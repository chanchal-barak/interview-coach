from pydantic import BaseModel, Field


class ScoreTrendResponse(BaseModel):
    scores: list[float] = Field(default_factory=list)
    dates: list[str] = Field(default_factory=list)


class DashboardSummaryResponse(BaseModel):
    resume_improvement: float       
    interview_improvement: float
    job_match_improvement: float
    total_reports: int
    latest_resume_score: float | None = None
    latest_interview_score: float | None = None
    latest_job_match_score: float | None = None