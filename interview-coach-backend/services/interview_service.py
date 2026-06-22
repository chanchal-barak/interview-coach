import json
import re
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models.interview import InterviewSession, InterviewQuestion
from services.gemini_service import _call_gemini, _extract_json  # reuse existing low-level helpers
from services.question_generation_service import generate_first_question, generate_next_question

MAX_QUESTIONS = 5


_EVALUATE_ANSWER_PROMPT = """You are an experienced technical interviewer evaluating a candidate's answer during a mock interview for a {role} position at {difficulty} difficulty.

Question asked:
{question}

Candidate's answer:
{answer}

Evaluate this answer. Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "score": <float 0-10>,
  "feedback": "<2-3 sentences of direct, honest feedback on this specific answer>",
  "ideal_answer_hints": ["<hint 1>", "<hint 2>", "<hint 3>"]
}}

Rules:
- score: 0 = no answer / completely wrong, 10 = excellent, structured, complete answer
- feedback must be specific to what they actually said, not generic
- ideal_answer_hints: 2-4 concrete points a strong answer would have included
"""

_FINAL_SUMMARY_PROMPT = """You are an experienced technical interviewer wrapping up a mock interview for a {role} position at {difficulty} difficulty.

Full transcript with scores:
{transcript}

Write a final interview summary. Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "overall_score": <float 0-100>,
  "technical_score": <float 0-100>,
  "communication_score": <float 0-100>,
  "summary": "<3-4 paragraph honest assessment: overall performance, key strengths shown, key areas to improve, and a verdict on readiness for real interviews at this level>",
  "recommendations": ["<concrete next step 1>", "<concrete next step 2>", "<concrete next step 3>"]
}}

Rules:
- overall_score: holistic average across all answers, scaled to 0-100
- technical_score: quality of technical/problem-solving answers specifically, scaled to 0-100 (if no technical questions were asked, estimate based on technical depth shown elsewhere, or default to overall_score)
- communication_score: clarity, structure, and articulation of answers regardless of technical content, scaled to 0-100
- recommendations: 3-5 concrete, actionable next steps (e.g. "Practice explaining time complexity out loud", "Use the STAR method for behavioral answers")
- Be honest and specific, referencing actual moments from the transcript
"""


def _build_transcript(questions: list[InterviewQuestion]) -> str:
    """Renders the Q&A history as readable text for prompt context."""
    lines = []
    for q in questions:
        lines.append(f"Q{q.order_index}: {q.question}")
        if q.answer:
            lines.append(f"A{q.order_index}: {q.answer}")
        if q.score is not None:
            lines.append(f"(Scored {q.score}/10 — {q.feedback})")
        lines.append("")
    return "\n".join(lines) if lines else "(no questions yet)"


def start_interview(
    db: Session,
    user_id: str,
    role: str,
    difficulty: str,
    mode: str = "general",
    resume_text: str | None = None,
    job_description_text: str | None = None,
) -> tuple[InterviewSession, InterviewQuestion]:
    """
    Creates a new interview session and generates the first question.
    mode determines how questions are generated:
      - "general": role + difficulty only
      - "resume_based": grounded in the candidate's actual resume
      - "job_description_based": grounded in a real JD + resume/JD skill-match gap
    """
    session = InterviewSession(
        user_id=user_id,
        role=role,
        difficulty=difficulty,
        mode=mode,
        resume_text=resume_text,
        job_description_text=job_description_text,
        status="active",
    )
    db.add(session)
    db.flush()  # get session.id without committing yet

    q_data = generate_first_question(mode, role, difficulty, resume_text, job_description_text)

    question = InterviewQuestion(
        session_id=session.id,
        order_index=1,
        question=q_data["question"],
        question_type=q_data["question_type"],
    )
    db.add(question)
    db.commit()
    db.refresh(session)
    db.refresh(question)

    return session, question


def submit_answer(
    db: Session, session: InterviewSession, question: InterviewQuestion, answer_text: str
) -> tuple[dict, InterviewQuestion | None, bool]:
    """
    Evaluates the submitted answer, saves it, and generates the next question
    unless MAX_QUESTIONS has been reached.

    Returns: (evaluation_dict, next_question_or_None, is_complete)
    """
    eval_prompt = _EVALUATE_ANSWER_PROMPT.format(
        role=session.role,
        difficulty=session.difficulty,
        question=question.question,
        answer=answer_text,
    )
    raw = _call_gemini(eval_prompt)
    evaluation = _extract_json(raw)

    required = ["score", "feedback", "ideal_answer_hints"]
    for key in required:
        if key not in evaluation:
            raise ValueError(f"Gemini evaluation response missing key: '{key}'")

    question.answer = answer_text
    question.score = float(evaluation["score"])
    question.feedback = evaluation["feedback"]
    question.answered_at = datetime.now(timezone.utc)
    db.add(question)
    db.commit()

    all_questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session.id)
        .order_by(InterviewQuestion.order_index)
        .all()
    )

    if len(all_questions) >= MAX_QUESTIONS:
        return evaluation, None, True

    next_q_data = generate_next_question(
        mode=session.mode,
        role=session.role,
        difficulty=session.difficulty,
        resume_text=session.resume_text,
        job_description_text=session.job_description_text,
        question_number=len(all_questions) + 1,
        max_questions=MAX_QUESTIONS,
        transcript=_build_transcript(all_questions),
    )

    next_question = InterviewQuestion(
        session_id=session.id,
        order_index=len(all_questions) + 1,
        question=next_q_data["question"],
        question_type=next_q_data["question_type"],
    )
    db.add(next_question)
    db.commit()
    db.refresh(next_question)

    return evaluation, next_question, False


def end_interview(db: Session, session: InterviewSession) -> tuple[InterviewSession, list[str]]:
    """
    Generates the final summary and scores, marks session completed.
    Returns (session, recommendations) — recommendations are not persisted
    as a DB column, only returned at completion time.
    """
    questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session.id)
        .order_by(InterviewQuestion.order_index)
        .all()
    )

    answered = [q for q in questions if q.score is not None]

    if not answered:
        # No answers submitted at all — close out gracefully without a Gemini call
        session.status = "completed"
        session.overall_score = 0.0
        session.technical_score = 0.0
        session.communication_score = 0.0
        session.summary = "No questions were answered before ending this interview."
        session.completed_at = datetime.now(timezone.utc)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session, []

    prompt = _FINAL_SUMMARY_PROMPT.format(
        role=session.role,
        difficulty=session.difficulty,
        transcript=_build_transcript(questions),
    )
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = ["overall_score", "technical_score", "communication_score", "summary"]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini summary response missing required key: '{key}'")

    session.status = "completed"
    session.overall_score = float(result["overall_score"])
    session.technical_score = float(result["technical_score"])
    session.communication_score = float(result["communication_score"])
    session.summary = result["summary"]
    session.completed_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()
    db.refresh(session)

    recommendations = result.get("recommendations", [])

    return session, recommendations