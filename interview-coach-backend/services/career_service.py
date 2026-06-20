import json
from sqlalchemy.orm import Session

from models.career_roadmap import CareerRoadmap
from models.analysis import Analysis
from models.interview import InterviewSession
from services.history_service import get_user_history
from services.gemini_service import _call_gemini, _extract_json  # reuse existing low-level helpers


_ROADMAP_PROMPT = """You are an expert career coach and technical mentor advising a software engineering candidate.

Below is everything known about this candidate, gathered from their actual activity on a job-prep platform:

RESUME ANALYSIS HISTORY:
{resume_summary}

JOB MATCH HISTORY:
{job_match_summary}

INTERVIEW HISTORY:
{interview_summary}

Based on this real history, generate a personalized career roadmap. Respond with ONLY a valid JSON object, no markdown, no code fences:

{{
  "current_level": "Beginner" or "Intermediate" or "Advanced",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "weekly_plan": [
    {{"week": 1, "focus": "<theme for this week>", "tasks": ["<task 1>", "<task 2>", "<task 3>"]}},
    {{"week": 2, "focus": "<theme>", "tasks": ["<task 1>", "<task 2>"]}},
    {{"week": 3, "focus": "<theme>", "tasks": ["<task 1>", "<task 2>"]}},
    {{"week": 4, "focus": "<theme>", "tasks": ["<task 1>", "<task 2>"]}}
  ],
  "recommended_projects": ["<project idea 1>", "<project idea 2>", "<project idea 3>"],
  "recommended_leetcode_topics": ["<topic 1>", "<topic 2>", "<topic 3>", "<topic 4>"],
  "recommended_interview_topics": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "recommended_courses": ["<course or resource 1>", "<course or resource 2>", "<course or resource 3>"]
}}

Rules:
- Base every recommendation on the ACTUAL data provided above, not generic advice. Reference real gaps you see (e.g. if interview scores show weak technical answers, recommend specific DSA topics; if job match shows missing AWS, recommend a cloud project).
- weekly_plan must have exactly 4 weeks, progressively building on each other.
- If history is sparse or empty, set current_level to "Beginner" and give a solid general-purpose starter roadmap rather than failing.
- Be specific and concrete, never vague platitudes.
- Return ONLY the JSON object, nothing else.
"""


def _summarize_resume_history(records: list[Analysis]) -> str:
    resume_records = [r for r in records if r.analysis_type in ("resume_analysis", "ai_feedback", "detailed_feedback")]
    if not resume_records:
        return "No resume analyses on file yet."

    lines = []
    for r in resume_records[:5]:  # most recent 5 is plenty of context
        try:
            data = json.loads(r.result_json)
        except json.JSONDecodeError:
            continue

        if r.analysis_type == "resume_analysis":
            lines.append(
                f"- Heuristic resume score: {data.get('score')}/10, "
                f"strengths: {data.get('strengths')}, weaknesses: {data.get('weaknesses')}"
            )
        elif r.analysis_type == "ai_feedback":
            lines.append(
                f"- AI readiness score: {data.get('readiness_score')}/100, "
                f"missing skills: {data.get('missing_skills')}, summary: {data.get('summary')}"
            )
        elif r.analysis_type == "detailed_feedback":
            lines.append(f"- Detailed feedback verdict: {data.get('interview_readiness')}")

    return "\n".join(lines) if lines else "No resume analyses on file yet."


def _summarize_job_match_history(records: list[Analysis]) -> str:
    job_records = [r for r in records if r.analysis_type in ("job_match", "ai_job_match")]
    if not job_records:
        return "No job match reports on file yet."

    lines = []
    for r in job_records[:5]:
        try:
            data = json.loads(r.result_json)
        except json.JSONDecodeError:
            continue

        if r.analysis_type == "job_match":
            lines.append(
                f"- Match score: {data.get('match_score')}%, missing skills: {data.get('missing')}"
            )
        else:
            lines.append(
                f"- AI match score: {data.get('match_score')}%, "
                f"missing skills: {data.get('missing_skills')}, "
                f"gap analysis: {data.get('skill_gap_analysis')}"
            )

    return "\n".join(lines) if lines else "No job match reports on file yet."


def _summarize_interview_history(db: Session, user_id: str) -> str:
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id, InterviewSession.status == "completed")
        .order_by(InterviewSession.created_at.desc())
        .limit(5)
        .all()
    )

    if not sessions:
        return "No completed mock interviews on file yet."

    lines = []
    for s in sessions:
        lines.append(
            f"- Role: {s.role}, difficulty: {s.difficulty}, "
            f"overall score: {s.overall_score}/100, "
            f"technical: {s.technical_score}/100, communication: {s.communication_score}/100. "
            f"Summary: {s.summary}"
        )

    return "\n".join(lines)


def generate_roadmap(db: Session, user_id: str) -> CareerRoadmap:
    """
    Pulls the user's resume, job match, and interview history, sends a
    synthesis prompt to Gemini, and persists the resulting roadmap.
    """
    history_records = get_user_history(db, user_id)

    resume_summary = _summarize_resume_history(history_records)
    job_match_summary = _summarize_job_match_history(history_records)
    interview_summary = _summarize_interview_history(db, user_id)

    prompt = _ROADMAP_PROMPT.format(
        resume_summary=resume_summary,
        job_match_summary=job_match_summary,
        interview_summary=interview_summary,
    )

    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "current_level", "strengths", "weaknesses", "weekly_plan",
        "recommended_projects", "recommended_leetcode_topics",
        "recommended_interview_topics", "recommended_courses",
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini roadmap response missing required key: '{key}'")

    record = CareerRoadmap(
        user_id=user_id,
        current_level=result["current_level"],
        roadmap_json=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_roadmap_history(db: Session, user_id: str) -> list[CareerRoadmap]:
    return (
        db.query(CareerRoadmap)
        .filter(CareerRoadmap.user_id == user_id)
        .order_by(CareerRoadmap.created_at.desc())
        .all()
    )


def get_latest_roadmap(db: Session, user_id: str) -> CareerRoadmap | None:
    return (
        db.query(CareerRoadmap)
        .filter(CareerRoadmap.user_id == user_id)
        .order_by(CareerRoadmap.created_at.desc())
        .first()
    )


def serialize_roadmap(record: CareerRoadmap) -> dict:
    data = json.loads(record.roadmap_json)
    return {
        **data,
        "id": record.id,
        "created_at": record.created_at,
    }