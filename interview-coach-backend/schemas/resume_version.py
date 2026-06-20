from datetime import datetime
from pydantic import BaseModel, Field


class SaveResumeVersionRequest(BaseModel):
    version_name: str = Field(..., min_length=1, max_length=255)


class ResumeVersionSummary(BaseModel):
    id: str
    version_name: str
    file_name: str
    resume_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeVersionListResponse(BaseModel):
    total: int
    items: list[ResumeVersionSummary]


class ResumeVersionDetail(BaseModel):
    id: str
    version_name: str
    file_name: str
    resume_score: float
    skills: list[str]
    extracted_text: str
    created_at: datetime


class CompareResumeVersionsRequest(BaseModel):
    old_version_id: str
    new_version_id: str


class CompareResumeVersionsResponse(BaseModel):
    old_version_id: str
    new_version_id: str
    old_score: float
    new_score: float
    score_change: float
    added_skills: list[str]
    removed_skills: list[str]
    new_recommendations: list[str]