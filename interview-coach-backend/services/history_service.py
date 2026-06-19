import json
from sqlalchemy.orm import Session

from models.analysis import Analysis


def save_analysis(db: Session, user_id: str, analysis_type: str, result: dict) -> Analysis:
    """
    Persists any analysis result (resume score, AI feedback, job match, etc.)
    tied to a user. result is serialized to JSON text for schema flexibility.
    """
    record = Analysis(
        user_id=user_id,
        analysis_type=analysis_type,
        result_json=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_user_history(db: Session, user_id: str) -> list[Analysis]:
    """Returns all analyses for a user, most recent first."""
    return (
        db.query(Analysis)
        .filter(Analysis.user_id == user_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


def get_analysis_by_id(db: Session, user_id: str, analysis_id: str) -> Analysis | None:
    """Returns a single analysis, scoped to the requesting user only."""
    return (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == user_id)
        .first()
    )


def serialize_analysis(record: Analysis) -> dict:
    """Converts an Analysis row into the shape HistoryItem expects."""
    return {
        "id": record.id,
        "analysis_type": record.analysis_type,
        "created_at": record.created_at,
        "result": json.loads(record.result_json),
    }