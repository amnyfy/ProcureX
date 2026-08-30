from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.auth.dependencies import get_current_user

from app.models.tender import Tender
from app.models.company import Company
from app.models.document import Document
from app.models.bid import Bid


router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = int(current_user["sub"])

    # Get companies belonging to current user
    company_ids = [
        company.id
        for company in db.query(Company)
        .filter(Company.user_id == user_id)
        .all()
    ]

    # Total tenders
    total_tenders = (
        db.query(Tender)
        .filter(Tender.company_id.in_(company_ids))
        .count()
    )

    # Active tenders
    active_tenders = (
        db.query(Tender)
        .filter(
            Tender.company_id.in_(company_ids),
            Tender.status == "active"
        )
        .count()
    )

    # Total documents
    total_documents = (
        db.query(Document)
        .join(
            Tender,
            Document.tender_id == Tender.id
        )
        .filter(
            Tender.company_id.in_(company_ids)
        )
        .count()
    )

    # Total bids
    total_bids = (
        db.query(Bid)
        .filter(Bid.user_id == user_id)
        .count()
    )

    # Average eligibility score
    bids = (
        db.query(Bid)
        .filter(
            Bid.user_id == user_id,
            Bid.eligibility_score.isnot(None)
        )
        .all()
    )

    if bids:
        average_eligibility = round(
            sum(bid.eligibility_score for bid in bids)
            / len(bids),
            2
        )
    else:
        average_eligibility = 0

    # Recommended bids
    recommended_bids = (
        db.query(Bid)
        .filter(
            Bid.user_id == user_id,
            Bid.eligibility_score >= 50
        )
        .count()
    )

    return {
        "total_tenders": total_tenders,
        "active_tenders": active_tenders,
        "total_documents": total_documents,
        "total_bids": total_bids,
        "average_eligibility": average_eligibility,
        "recommended_bids": recommended_bids
    }