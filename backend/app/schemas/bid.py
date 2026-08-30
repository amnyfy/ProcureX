from pydantic import BaseModel


class BidCreate(BaseModel):
    tender_id: int
    eligibility_score: float
    winning_probability: float
    status: str = "pending"


class BidResponse(BaseModel):
    id: int
    user_id: int
    tender_id: int
    eligibility_score: float
    winning_probability: float
    status: str

    class Config:
        from_attributes = True


class BidStatusUpdate(BaseModel):
    status: str