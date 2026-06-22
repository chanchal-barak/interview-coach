from typing import Literal
from pydantic import BaseModel, Field


HireDecision = Literal["Hire", "No Hire"]


class RecruiterReviewResponse(BaseModel):
    decision: HireDecision
    shortlisting_probability: int = Field(..., ge=0, le=100)
    interview_probability: int = Field(..., ge=0, le=100)
    resume_score: float = Field(..., ge=0, le=10)
    faang_readiness_score: int = Field(..., ge=0, le=100)
    recruiter_summary: str
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)