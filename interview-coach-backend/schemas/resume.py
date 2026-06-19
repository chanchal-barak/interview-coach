from pydantic import BaseModel, Field


class ResumeAnalysisResponse(BaseModel):
    """
    Response shape for POST /upload-resume.
    Heuristic (non-AI) resume scoring — fast, no external API cost.
    """

    score: float = Field(..., ge=0, le=10, description="Overall resume score, 0-10")
    raw_score: int = Field(..., description="Raw points earned before normalization")
    max_score: int = Field(..., description="Maximum possible raw points")
    projects: int = Field(..., ge=0, description="Number of projects detected")
    github: bool = Field(..., description="Whether a GitHub profile link was found")
    languages: list[str] = Field(default_factory=list, description="Programming languages detected")
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "score": 7.5,
                "raw_score": 15,
                "max_score": 20,
                "projects": 3,
                "github": True,
                "languages": ["python", "java"],
                "strengths": [
                    "Programming languages: Python, Java",
                    "GitHub profile linked",
                    "Strong projects section with 3+ projects"
                ],
                "weaknesses": [
                    "No cloud or DevOps tools detected"
                ],
                "recommendations": [
                    "Learn Docker basics and deploy a project to AWS or GCP"
                ]
            }
        }


class ResumeErrorResponse(BaseModel):
    """Standard error shape returned by FastAPI's HTTPException."""
    detail: str