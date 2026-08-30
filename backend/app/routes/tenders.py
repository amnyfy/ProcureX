from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config.database import get_db
from app.models.tender import Tender
from app.models.company import Company
from app.schemas.tender import TenderCreate, TenderResponse

router = APIRouter()


# Create Tender
@router.post("/", response_model=TenderResponse)
def create_tender(
    tender: TenderCreate,
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    # Make sure the company belongs to the logged-in user
    company = (
        db.query(Company)
        .filter(
            Company.id == company_id,
            Company.user_id == user_id
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    new_tender = Tender(
        title=tender.title,
        reference_number=tender.reference_number,
        organization=tender.organization,
        description=tender.description,
        category=tender.category,
        location=tender.location,
        estimated_value=tender.estimated_value,
        deadline=tender.deadline,
        company_id=company_id
    )

    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)

    return new_tender


# Get All Tenders
@router.get("/", response_model=list[TenderResponse])
def get_tenders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    return (
        db.query(Tender)
        .join(Company)
        .filter(Company.user_id == user_id)
        .all()
    )


# Get Tender by ID
@router.get("/{tender_id}", response_model=TenderResponse)
def get_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    tender = (
        db.query(Tender)
        .join(Company)
        .filter(
            Tender.id == tender_id,
            Company.user_id == user_id
        )
        .first()
    )

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    return tender


# Update Tender
@router.put("/{tender_id}", response_model=TenderResponse)
def update_tender(
    tender_id: int,
    tender_data: TenderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    tender = (
        db.query(Tender)
        .join(Company)
        .filter(
            Tender.id == tender_id,
            Company.user_id == user_id
        )
        .first()
    )

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    tender.title = tender_data.title
    tender.reference_number = tender_data.reference_number
    tender.organization = tender_data.organization
    tender.description = tender_data.description
    tender.category = tender_data.category
    tender.location = tender_data.location
    tender.estimated_value = tender_data.estimated_value
    tender.deadline = tender_data.deadline

    db.commit()
    db.refresh(tender)

    return tender


# Delete Tender
@router.delete("/{tender_id}")
def delete_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    tender = (
        db.query(Tender)
        .join(Company)
        .filter(
            Tender.id == tender_id,
            Company.user_id == user_id
        )
        .first()
    )

    if not tender:
        raise HTTPException(
            status_code=404,
            detail="Tender not found"
        )

    db.delete(tender)
    db.commit()

    return {
        "message": "Tender deleted successfully"
    }