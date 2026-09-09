from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.config.database import get_db
from app.auth.dependencies import get_current_user
from app.models.tender import Tender
from app.models.company import Company

from app.schemas.government_tender import (
    GovernmentTenderResponse,
    GovernmentTenderSyncResponse,
    SyncStatusResponse,
)
from app.services.government_tender_service import (
    sync_government_tenders,
    get_sync_status,
)

router = APIRouter()


# ============================================================
# GET GOVERNMENT TENDERS (PAGINATED & FILTERED)
# ============================================================

@router.get("/", response_model=dict)
def get_government_tenders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    organization: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Retrieves public government tenders from PostgreSQL database with server-side pagination,
    keyword searching, and multi-field filtering.
    """
    query = db.query(Tender).filter(Tender.is_government_tender == True)

    # Keyword Search across title, reference number, organization, description
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Tender.title.ilike(search_pattern),
                Tender.reference_number.ilike(search_pattern),
                Tender.organization.ilike(search_pattern),
                Tender.department.ilike(search_pattern),
                Tender.description.ilike(search_pattern),
            )
        )

    if organization:
        query = query.filter(Tender.organization.ilike(f"%{organization}%"))

    if department:
        query = query.filter(Tender.department.ilike(f"%{department}%"))

    if category:
        query = query.filter(Tender.category.ilike(f"%{category}%"))

    if location:
        query = query.filter(Tender.location.ilike(f"%{location}%"))

    if min_value is not None:
        query = query.filter(Tender.estimated_value >= min_value)

    if max_value is not None:
        query = query.filter(Tender.estimated_value <= max_value)

    if source:
        query = query.filter(Tender.source.ilike(source))

    # Total matching count
    total = query.count()

    # Pagination calculation
    offset = (page - 1) * page_size
    items = query.order_by(Tender.id.desc()).offset(offset).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return {
        "items": [GovernmentTenderResponse.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


# ============================================================
# SYNC STATUS & METRICS
# ============================================================

@router.get("/sync/status", response_model=SyncStatusResponse)
def get_feed_sync_status(
    source: str = Query("CPPP"),
    db: Session = Depends(get_db),
):
    """
    Returns official government tender feed connection status, sync metrics, and timestamps.
    """
    status = get_sync_status(source_name=source, db=db)
    return status


# ============================================================
# CONTROLLED SYNC TRIGGER
# ============================================================

@router.post("/sync", response_model=GovernmentTenderSyncResponse)
def trigger_sync(
    source: str = Query("CPPP"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Triggers controlled synchronization from official public government portal source.
    Requires authentication to prevent public unauthorized overuse.
    """
    summary = sync_government_tenders(source_name=source, db=db)
    return summary


# ============================================================
# GET SINGLE GOVERNMENT TENDER
# ============================================================

@router.get("/{tender_id}", response_model=GovernmentTenderResponse)
def get_government_tender(
    tender_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieves details of a specific government tender by ID.
    """
    tender = db.query(Tender).filter(
        Tender.id == tender_id,
        Tender.is_government_tender == True,
    ).first()

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Government tender not found"
        )

    return tender


# ============================================================
# ADD TO MY OPPORTUNITIES
# ============================================================

@router.post("/{tender_id}/add-to-my-opportunities")
def add_to_my_opportunities(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Links/adds a public government tender to the logged-in user's company procurement pipeline.
    Preserves source="CPPP" and is_government_tender=True while linking to user's company.
    """
    user_id = int(current_user["sub"])

    # Find tender
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    # Get user's primary company
    user_company = db.query(Company).filter(Company.user_id == user_id).first()
    if not user_company:
        raise HTTPException(
            status_code=400,
            detail="Please create a company first before adding tenders to your pipeline."
        )

    # Link tender to user's company
    tender.company_id = user_company.id
    db.commit()
    db.refresh(tender)

    return {
        "message": f"Successfully added '{tender.title}' to your opportunities pipeline!",
        "tender_id": tender.id,
        "company_id": user_company.id,
        "source": tender.source,
    }
