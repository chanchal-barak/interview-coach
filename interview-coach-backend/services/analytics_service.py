import json
from sqlalchemy.orm import Session

from models.analysis import Analysis
from models.interview import InterviewSession


def _resume_score_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    """
    Pulls heuristic resume scores (0-10, scaled to 0-100) from saved
    'resume_analysis' records, oldest first.
    """
    records = (
        db.query(Analysis)
        .filter(Analysis.user_id == user_id, Analysis.analysis_type == "resume_analysis")
        .order_by(Analysis.created_at.asc())
        .all()
    )

    scores: list[float] = []
    dates: list[str] = []
    for r in records:
        try:
            data = json.loads(r.result_json)
            score = data.get("score")
            if score is not None:
                scores.append(round(float(score) * 10, 1))  # 0-10 -> 0-100 scale
                dates.append(r.created_at.isoformat())
        except (json.JSONDecodeError, TypeError, ValueError):
            continue

    return scores, dates


def _job_match_score_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    """
    Pulls match_score (already 0-100) from saved 'job_match' and
    'ai_job_match' records combined, oldest first.
    """
    records = (
        db.query(Analysis)
        .filter(
            Analysis.user_id == user_id,
            Analysis.analysis_type.in_(["job_match", "ai_job_match"]),
        )
        .order_by(Analysis.created_at.asc())
        .all()
    )

    scores: list[float] = []
    dates: list[str] = []
    for r in records:
        try:
            data = json.loads(r.result_json)
            score = data.get("match_score")
            if score is not None:
                scores.append(float(score))
                dates.append(r.created_at.isoformat())
        except (json.JSONDecodeError, TypeError, ValueError):
            continue

    return scores, dates


def _interview_score_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    """
    Pulls overall_score from completed interview sessions, oldest first.
    """
    sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == user_id,
            InterviewSession.status == "completed",
            InterviewSession.overall_score.isnot(None),
        )
        .order_by(InterviewSession.created_at.asc())
        .all()
    )

    scores = [float(s.overall_score) for s in sessions]
    dates = [s.created_at.isoformat() for s in sessions]
    return scores, dates


def get_resume_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    return _resume_score_trend(db, user_id)


def get_interview_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    return _interview_score_trend(db, user_id)


def get_job_match_trend(db: Session, user_id: str) -> tuple[list[float], list[str]]:
    return _job_match_score_trend(db, user_id)


def _improvement(scores: list[float]) -> float:
    """First-vs-latest change. 0 if fewer than 2 data points."""
    if len(scores) < 2:
        return 0.0
    return round(scores[-1] - scores[0], 1)


def get_dashboard_summary(db: Session, user_id: str) -> dict:
    resume_scores, _ = _resume_score_trend(db, user_id)
    interview_scores, _ = _interview_score_trend(db, user_id)
    job_match_scores, _ = _job_match_score_trend(db, user_id)

    total_reports = (
        db.query(Analysis).filter(Analysis.user_id == user_id).count()
        + db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id, InterviewSession.status == "completed")
        .count()
    )

    return {
        "resume_improvement": _improvement(resume_scores),
        "interview_improvement": _improvement(interview_scores),
        "job_match_improvement": _improvement(job_match_scores),
        "total_reports": total_reports,
        "latest_resume_score": resume_scores[-1] if resume_scores else None,
        "latest_interview_score": interview_scores[-1] if interview_scores else None,
        "latest_job_match_score": job_match_scores[-1] if job_match_scores else None,
    }