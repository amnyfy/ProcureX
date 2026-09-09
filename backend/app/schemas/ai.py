from pydantic import BaseModel, Field
from typing import List, Optional


class TenderAnalysisResponse(BaseModel):
    tender_id: int
    document_id: int
    eligibility_score: float
    winning_probability: float
    recommendation: str
    matched_requirements: List[str]
    summary: str


class CopilotMessage(BaseModel):
    role: str
    content: str


class CopilotQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    conversation_history: Optional[List[CopilotMessage]] = None


class CopilotResponse(BaseModel):
    tender_id: int
    question: str
    answer: str
    sources: List[str]
    disclaimer: str