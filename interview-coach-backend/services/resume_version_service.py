import json
from sqlalchemy.orm import Session

from models.resume_version import ResumeVersion
from services.pdf_extractor import extract_text_from_bytes
from services.resume_analyzer import analyze_resume_text


def create_resume_version(
    db: Session, user_id: str, version_name: str, file_name: str, file_bytes: bytes
) -> ResumeVersion:
    """
    Extracts text, runs heuristic analysis, and saves a new resume version snapshot.
    """
    text = extract_text_from_bytes(file_bytes)
    analysis = analyze_resume_text(text)

    record = ResumeVersion(
        user_id=user_id,
        version_name=version_name,
        file_name=file_name,
        resume_score=analysis["score"],
        extracted_text=text,
        skills_json=json.dumps(analysis.get("languages", [])),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_resume_versions(db: Session, user_id: str) -> list[ResumeVersion]:
    return (
        db.query(ResumeVersion)
        .filter(ResumeVersion.user_id == user_id)
        .order_by(ResumeVersion.created_at.desc())
        .all()
    )


def get_resume_version(db: Session, user_id: str, version_id: str) -> ResumeVersion | None:
    return (
        db.query(ResumeVersion)
        .filter(ResumeVersion.id == version_id, ResumeVersion.user_id == user_id)
        .first()
    )


def compare_resume_versions(
    db: Session, user_id: str, old_id: str, new_id: str
) -> dict | None:
    """
    Compares two resume versions belonging to the same user.
    Returns None if either version isn't found / doesn't belong to the user.
    """
    old_v = get_resume_version(db, user_id, old_id)
    new_v = get_resume_version(db, user_id, new_id)

    if old_v is None or new_v is None:
        return None

    old_skills = set(json.loads(old_v.skills_json))
    new_skills = set(json.loads(new_v.skills_json))

    added_skills = sorted(new_skills - old_skills)
    removed_skills = sorted(old_skills - new_skills)

    # Re-run heuristic analysis on the newer text to surface fresh recommendations
    new_analysis = analyze_resume_text(new_v.extracted_text)

    return {
        "old_version_id": old_v.id,
        "new_version_id": new_v.id,
        "old_score": old_v.resume_score,
        "new_score": new_v.resume_score,
        "score_change": round(new_v.resume_score - old_v.resume_score, 2),
        "added_skills": added_skills,
        "removed_skills": removed_skills,
        "new_recommendations": new_analysis.get("recommendations", []),
    }