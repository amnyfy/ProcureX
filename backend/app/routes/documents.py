import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.auth.dependencies import get_current_user
from app.models.document import Document
from app.models.tender import Tender
from app.models.company import Company


router = APIRouter()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload/{tender_id}")
def upload_document(
    tender_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = int(current_user["sub"])

    # Check tender belongs to logged-in user's company
    tender = (
        db.query(Tender)
        .join(Company, Tender.company_id == Company.id)
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

    # Allow only PDF files
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Create unique filename
    filename = file.filename
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save document information in database
    document = Document(
        tender_id=tender_id,
        filename=filename,
        filepath=file_path
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "filename": document.filename,
        "filepath": document.filepath,
        "tender_id": tender_id
    }