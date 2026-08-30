from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse

router = APIRouter()


# Create Company
@router.post("/", response_model=CompanyResponse)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    new_company = Company(
        name=company.name,
        email=company.email,
        phone=company.phone,
        address=company.address,
        user_id=user_id
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


# Get All Companies
@router.get("/", response_model=list[CompanyResponse])
def get_companies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    return (
        db.query(Company)
        .filter(Company.user_id == user_id)
        .all()
    )


# Get Company by ID
@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

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

    return company


# Update Company
@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

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

    company.name = company_data.name
    company.email = company_data.email
    company.phone = company_data.phone
    company.address = company_data.address

    db.commit()
    db.refresh(company)

    return company


# Delete Company
@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

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

    db.delete(company)
    db.commit()

    return {
        "message": "Company deleted successfully"
    }