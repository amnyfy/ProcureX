from pydantic import BaseModel
from datetime import datetime


class TenderCreate(BaseModel):
    title: str
    reference_number: str
    organization: str
    description: str | None = None
    category: str | None = None
    location: str | None = None
    estimated_value: str | None = None
    deadline: datetime | None = None


class TenderResponse(BaseModel):
    id: int
    title: str
    reference_number: str
    organization: str
    description: str | None
    category: str | None
    location: str | None
    estimated_value: str | None
    deadline: datetime | None
    status: str
    company_id: int

    class Config:
        from_attributes = True