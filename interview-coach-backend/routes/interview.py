from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from models.interview import InterviewSession, InterviewQuestion
from schemas.interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    AnswerEvaluation,
    EndInterviewRequest,
    EndInterviewResponse,
    QuestionOut,
    QuestionDetail,
    InterviewHistoryResponse,
    InterviewSessionSummary,
    InterviewSessionDetail,
)
from services.interview_service import start_interview, submit_answer, end_interview, MAX_QUESTIONS
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])


def _get_owned_session(db: Session, user_id: str, session_id: str) -> InterviewSession:
    session = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id)
        .first()
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return session


@router.post("/start", response_model=StartInterviewResponse)
def start(
    payload: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.mode == "resume_based" and not payload.resume_text:
        raise HTTPException(
            status_code=400,
            detail="resume_text is required when mode is 'resume_based'.",
        )
    if payload.mode == "job_description_based" and not payload.job_description_text:
        raise HTTPException(
            status_code=400,
            detail="job_description_text is required when mode is 'job_description_based'.",
        )

    try:
        session, question = start_interview(
            db,
            current_user.id,
            payload.role,
            payload.difficulty,
            mode=payload.mode,
            resume_text=payload.resume_text,
            job_description_text=payload.job_description_text,
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return StartInterviewResponse(
        session_id=session.id,
        role=session.role,
        difficulty=session.difficulty,
        mode=session.mode,
        question=QuestionOut.model_validate(question),
    )


@router.post("/answer", response_model=SubmitAnswerResponse)
def answer(
    payload: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_owned_session(db, current_user.id, payload.session_id)

    if session.status != "active":
        raise HTTPException(status_code=400, detail="This interview session has already ended.")

    question = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.id == payload.question_id,
            InterviewQuestion.session_id == session.id,
        )
        .first()
    )
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found in this session.")

    if question.answer is not None:
        raise HTTPException(status_code=400, detail="This question has already been answered.")

    try:
        evaluation, next_question, is_complete = submit_answer(db, session, question, payload.answer)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    questions_asked = question.order_index

    return SubmitAnswerResponse(
        evaluation=AnswerEvaluation(**evaluation),
        next_question=QuestionOut.model_validate(next_question) if next_question else None,
        is_complete=is_complete,
        questions_asked=questions_asked,
        max_questions=MAX_QUESTIONS,
    )


@router.post("/end", response_model=EndInterviewResponse)
def end(
    payload: EndInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_owned_session(db, current_user.id, payload.session_id)

    if session.status == "completed":
        # idempotent — return existing result instead of erroring.
        # recommendations aren't persisted, so they're empty on replay.
        questions = sorted(session.questions, key=lambda q: q.order_index)
        return EndInterviewResponse(
            session_id=session.id,
            overall_score=session.overall_score or 0.0,
            technical_score=session.technical_score or 0.0,
            communication_score=session.communication_score or 0.0,
            summary=session.summary or "",
            recommendations=[],
            questions=[QuestionDetail.model_validate(q) for q in questions],
        )

    try:
        session, recommendations = end_interview(db, session)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    questions = sorted(session.questions, key=lambda q: q.order_index)

    return EndInterviewResponse(
        session_id=session.id,
        overall_score=session.overall_score,
        technical_score=session.technical_score,
        communication_score=session.communication_score,
        summary=session.summary,
        recommendations=recommendations,
        questions=[QuestionDetail.model_validate(q) for q in questions],
    )


@router.get("/history", response_model=InterviewHistoryResponse)
def history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )

    items = [
        InterviewSessionSummary(
            id=s.id,
            role=s.role,
            difficulty=s.difficulty,
            mode=s.mode,
            status=s.status,
            overall_score=s.overall_score,
            technical_score=s.technical_score,
            communication_score=s.communication_score,
            created_at=s.created_at,
            completed_at=s.completed_at,
            question_count=len(s.questions),
        )
        for s in sessions
    ]

    return InterviewHistoryResponse(total=len(items), items=items)


@router.get("/history/{session_id}", response_model=InterviewSessionDetail)
def history_detail(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = _get_owned_session(db, current_user.id, session_id)
    questions = sorted(session.questions, key=lambda q: q.order_index)

    return InterviewSessionDetail(
        id=session.id,
        role=session.role,
        difficulty=session.difficulty,
        mode=session.mode,
        status=session.status,
        overall_score=session.overall_score,
        technical_score=session.technical_score,
        communication_score=session.communication_score,
        summary=session.summary,
        recommendations=[],
        created_at=session.created_at,
        completed_at=session.completed_at,
        questions=[QuestionDetail.model_validate(q) for q in questions],
    )