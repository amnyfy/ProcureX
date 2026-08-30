import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config.database import get_db

from app.models.tender import Tender
from app.models.company import Company
from app.models.document import Document
from app.models.bid import Bid

from app.ai.pdf_extractor import extract_text_from_pdf
from app.ai.analyzer import analyze_tender

from app.schemas.ai import TenderAnalysisResponse


router = APIRouter()


@router.post(
    "/analyze/{tender_id}",
    response_model=TenderAnalysisResponse
)
def analyze_tender_document(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = int(current_user["sub"])

    # Verify tender belongs to logged-in user's company
    tender = (
        db.query(Tender)
        .join(
            Company,
            Tender.company_id == Company.id
        )
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

    # Find document belonging to this tender
    document = (
        db.query(Document)
        .filter(
            Document.tender_id == tender_id
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="No document found for this tender"
        )

    if not os.path.exists(document.filepath):
        raise HTTPException(
            status_code=404,
            detail="Uploaded document file not found"
        )

    # Extract PDF text
    text = extract_text_from_pdf(
        document.filepath
    )

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )

    # Analyze tender
    analysis = analyze_tender(text)

    # Check if bid already exists
    bid = (
        db.query(Bid)
        .filter(
            Bid.user_id == user_id,
            Bid.tender_id == tender_id
        )
        .first()
    )

    if not bid:
        bid = Bid(
            user_id=user_id,
            tender_id=tender_id
        )

        db.add(bid)

    # Save AI results
    bid.eligibility_score = analysis["eligibility_score"]
    bid.winning_probability = analysis["winning_probability"]
    bid.status = "analyzed"

    db.commit()
    db.refresh(bid)

    return {
        "tender_id": tender_id,
        "document_id": document.id,
        "eligibility_score": analysis["eligibility_score"],
        "winning_probability": analysis["winning_probability"],
        "recommendation": analysis["recommendation"],
        "matched_requirements": analysis["matched_requirements"],
        "summary": analysis["summary"]
    }