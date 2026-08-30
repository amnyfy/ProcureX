from pydantic import BaseModel
from typing import List


class TenderAnalysisResponse(BaseModel):
    tender_id: int
    document_id: int
    eligibility_score: float
    winning_probability: float
    recommendation: str
    matched_requirements: List[str]
    summary: str
    