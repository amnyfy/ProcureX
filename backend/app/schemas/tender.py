from pydantic import BaseModel
from datetime import datetime


class TenderCreate(BaseModel):
    title: str
    reference_number: str
    organization: str
    description: str
    category: str
    location: str
    estimated_value: float
    deadline: datetime


class TenderResponse(BaseModel):
    id: int
    title: str
    reference_number: str
    organization: str
    description: str
    category: str
    location: str
    estimated_value: float
    deadline: datetime
    company_id: int

    class Config:
        from_attributes = True