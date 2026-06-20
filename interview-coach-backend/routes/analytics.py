from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.analytics import ScoreTrendResponse, DashboardSummaryResponse
from services.analytics_service import (
    get_resume_trend,
    get_interview_trend,
    get_job_match_trend,
    get_dashboard_summary,
)
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/resume-trend", response_model=ScoreTrendResponse)
def resume_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores, dates = get_resume_trend(db, current_user.id)
    return ScoreTrendResponse(scores=scores, dates=dates)


@router.get("/interview-trend", response_model=ScoreTrendResponse)
def interview_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores, dates = get_interview_trend(db, current_user.id)
    return ScoreTrendResponse(scores=scores, dates=dates)


@router.get("/job-match-trend", response_model=ScoreTrendResponse)
def job_match_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scores, dates = get_job_match_trend(db, current_user.id)
    return ScoreTrendResponse(scores=scores, dates=dates)


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = get_dashboard_summary(db, current_user.id)
    return DashboardSummaryResponse(**data)