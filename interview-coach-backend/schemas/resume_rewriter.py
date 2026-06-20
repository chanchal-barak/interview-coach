from pydantic import BaseModel, Field


class BulletRewriteItem(BaseModel):
    original: str
    improved: str
    issue: str          # what was weak about it (e.g. "no metrics", "passive voice")
    ats_keywords_added: list[str] = Field(default_factory=list)


class ResumeRewriterResponse(BaseModel):
    overall_ats_score: int = Field(..., ge=0, le=100, description="ATS-friendliness score, 0-100")
    ats_issues: list[str] = Field(default_factory=list)
    bullet_rewrites: list[BulletRewriteItem] = Field(default_factory=list)
    missing_metrics_summary: str
    general_improvements: list[str] = Field(default_factory=list)