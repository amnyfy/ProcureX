from pydantic import BaseModel
from datetime import datetime


class TenderCreate(BaseModel):
    title: str
    reference_number: str | None = None
    organization: str | None = None
    department: str | None = None
    description: str | None = None
    category: str | None = None
    location: str | None = None
    estimated_value: float | None = None
    deadline: datetime | None = None
    status: str | None = "open"
    company_id: int | None = None
    is_government_tender: bool | None = False
    source: str | None = "User"
    source_tender_id: str | None = None
    source_url: str | None = None
    document_url: str | None = None


class TenderResponse(BaseModel):
    id: int
    title: str
    reference_number: str | None = None
    organization: str | None = None
    department: str | None = None
    description: str | None = None
    category: str | None = None
    location: str | None = None
    estimated_value: float | None = None
    deadline: datetime | None = None
    status: str | None = "open"
    company_id: int | None = None
    is_government_tender: bool | None = False
    source: str | None = "User"
    source_tender_id: str | None = None
    source_url: str | None = None
    document_url: str | None = None

    class Config:
        from_attributes = True