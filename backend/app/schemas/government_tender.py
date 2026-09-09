from pydantic import BaseModel
from datetime import datetime


class GovernmentTenderResponse(BaseModel):
    id: int
    title: str
    reference_number: str
    organization: str | None = None
    department: str | None = None
    description: str | None = None
    category: str | None = None
    location: str | None = None
    estimated_value: float | None = None
    deadline: datetime | None = None
    published_date: datetime | None = None
    closing_date: datetime | None = None
    bid_opening_date: datetime | None = None
    status: str | None = "open"
    is_government_tender: bool = True
    source: str = "CPPP"
    source_tender_id: str | None = None
    source_url: str | None = None
    document_url: str | None = None
    company_id: int | None = None

    class Config:
        from_attributes = True


class GovernmentTenderSyncResponse(BaseModel):
    source: str = "CPPP"
    new_tenders: int
    updated_tenders: int
    duplicates: int
    failed: int
    message: str


class SyncStatusResponse(BaseModel):
    source: str = "CPPP"
    connected: bool
    last_sync_time: str | None = None
    next_sync_time: str | None = None
    sync_status: str = "idle"
    total_government_tenders: int = 0
    recent_sync: GovernmentTenderSyncResponse | None = None
