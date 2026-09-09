import logging
import threading
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.tender import Tender
from app.services.government_tenders.cppp_source import CPPPSource

logger = logging.getLogger(__name__)

# Registry of supported government sources
SOURCES = {
    "CPPP": CPPPSource(),
}

# Global in-memory sync state tracker
_SYNC_STATE: Dict[str, Any] = {
    "CPPP": {
        "connected": True,
        "last_sync_time": None,
        "next_sync_time": None,
        "sync_status": "idle",
        "total_government_tenders": 0,
        "recent_sync": None,
    }
}

_SCHEDULER_THREAD: Optional[threading.Thread] = None
_SCHEDULER_RUNNING = False


def get_sync_status(source_name: str = "CPPP", db: Optional[Session] = None) -> Dict[str, Any]:
    """Returns official portal connection status and sync metadata."""
    state = _SYNC_STATE.get(source_name, {
        "connected": True,
        "last_sync_time": None,
        "next_sync_time": None,
        "sync_status": "idle",
        "total_government_tenders": 0,
        "recent_sync": None,
    })

    # Count total government tenders in PostgreSQL database
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        total = db.query(Tender).filter(
            Tender.is_government_tender == True,
            Tender.source == source_name
        ).count()
        state["total_government_tenders"] = total
    except Exception as e:
        logger.error(f"Error querying government tenders count: {e}")
    finally:
        if close_session:
            db.close()

    return {
        "source": source_name,
        "connected": state["connected"],
        "last_sync_time": state["last_sync_time"],
        "next_sync_time": state["next_sync_time"],
        "sync_status": state["sync_status"],
        "total_government_tenders": state["total_government_tenders"],
        "recent_sync": state["recent_sync"],
    }


def sync_government_tenders(source_name: str = "CPPP", db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Executes controlled synchronization from official government procurement source.
    Handles deduplication, record insertion/updates, logging, and error safety.
    """
    source = SOURCES.get(source_name)
    if not source:
        raise ValueError(f"Unsupported government tender source: {source_name}")

    state = _SYNC_STATE.setdefault(source_name, {})
    state["sync_status"] = "syncing"

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    new_tenders = 0
    updated_tenders = 0
    duplicates = 0
    failed = 0

    try:
        fetched_items = source.fetch_tenders()

        for item in fetched_items:
            try:
                source_tender_id = item.get("source_tender_id")
                ref_num = item.get("reference_number")
                org = item.get("organization")

                # Deduplication strategy: Check by (source, source_tender_id) or (source, reference_number)
                existing = None
                if source_tender_id:
                    existing = db.query(Tender).filter(
                        Tender.source == source_name,
                        Tender.source_tender_id == source_tender_id
                    ).first()

                if not existing and ref_num:
                    existing = db.query(Tender).filter(
                        Tender.reference_number == ref_num
                    ).first()

                if existing:
                    # Update fields if changed
                    changed = False
                    if item.get("status") and existing.status != item["status"]:
                        existing.status = item["status"]
                        changed = True
                    if item.get("estimated_value") and existing.estimated_value != item["estimated_value"]:
                        existing.estimated_value = item["estimated_value"]
                        changed = True

                    if changed:
                        updated_tenders += 1
                    else:
                        duplicates += 1
                else:
                    # Insert new government tender
                    new_tender = Tender(
                        title=item.get("title", "Untitled Government Tender"),
                        reference_number=ref_num or f"{source_name}-{source_tender_id or 'REF'}",
                        organization=org,
                        department=item.get("department"),
                        description=item.get("description"),
                        category=item.get("category"),
                        location=item.get("location"),
                        estimated_value=item.get("estimated_value"),
                        deadline=item.get("closing_date"),
                        published_date=item.get("published_date"),
                        closing_date=item.get("closing_date"),
                        bid_opening_date=item.get("bid_opening_date"),
                        status=item.get("status", "open"),
                        is_government_tender=True,
                        source=source_name,
                        source_tender_id=source_tender_id,
                        source_url=item.get("source_url"),
                        document_url=item.get("document_url"),
                        company_id=None,
                    )
                    db.add(new_tender)
                    new_tenders += 1

            except Exception as e:
                logger.error(f"Failed processing item {item.get('source_tender_id')}: {e}")
                failed += 1

        db.commit()

        now = datetime.now(timezone.utc)
        sync_summary = {
            "source": source_name,
            "new_tenders": new_tenders,
            "updated_tenders": updated_tenders,
            "duplicates": duplicates,
            "failed": failed,
            "message": f"Successfully synchronized {new_tenders} new, {updated_tenders} updated tenders."
        }

        state["connected"] = True
        state["last_sync_time"] = now.strftime("%d %b %Y %I:%M %p UTC")
        state["next_sync_time"] = (now + timedelta(minutes=30)).strftime("%d %b %Y %I:%M %p UTC")
        state["sync_status"] = "idle"
        state["recent_sync"] = sync_summary

        return sync_summary

    except Exception as e:
        logger.error(f"Error during CPPP sync: {e}")
        state["connected"] = False
        state["sync_status"] = "error"
        return {
            "source": source_name,
            "new_tenders": 0,
            "updated_tenders": 0,
            "duplicates": 0,
            "failed": 1,
            "message": f"Sync failed: {str(e)}"
        }
    finally:
        if close_session:
            db.close()


def _background_scheduler_loop():
    """Background thread that runs periodic synchronization every 30 minutes."""
    global _SCHEDULER_RUNNING
    logger.info("Starting background CPPP Tender Sync scheduler (30-minute interval)...")
    
    # Run initial sync on startup
    try:
        sync_government_tenders("CPPP")
    except Exception as e:
        logger.error(f"Initial CPPP sync error: {e}")

    while _SCHEDULER_RUNNING:
        time.sleep(1800)  # 30 minutes
        if not _SCHEDULER_RUNNING:
            break
        try:
            logger.info("Executing scheduled CPPP tender synchronization...")
            sync_government_tenders("CPPP")
        except Exception as e:
            logger.error(f"Scheduled CPPP sync error: {e}")


def start_scheduler():
    global _SCHEDULER_THREAD, _SCHEDULER_RUNNING
    if not _SCHEDULER_RUNNING:
        _SCHEDULER_RUNNING = True
        _SCHEDULER_THREAD = threading.Thread(target=_background_scheduler_loop, daemon=True)
        _SCHEDULER_THREAD.start()
