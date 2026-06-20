import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class InterviewSession(Base):
    """
    One mock interview session: role + difficulty chosen by the user,
    a running set of questions/answers, and a final score once completed.
    """

    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    role = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False)  # "easy" | "medium" | "hard"
    status = Column(String(20), default="active", nullable=False)  # active | completed

    overall_score = Column(Float, nullable=True)        # 0-100, set on completion
    technical_score = Column(Float, nullable=True)      # 0-100, set on completion
    communication_score = Column(Float, nullable=True)  # 0-100, set on completion
    summary = Column(Text, nullable=True)                # Gemini's final written summary

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User")
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.order_index",
    )


class InterviewQuestion(Base):
    """
    A single question within an interview session, along with the
    candidate's answer (once submitted) and Gemini's evaluation of it.
    """

    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    session_id = Column(
        String(36), ForeignKey("interview_sessions.id"), nullable=False, index=True
    )

    order_index = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String(20), default="behavioral", nullable=False)  # behavioral | technical

    answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)       # 0-10, set after evaluation
    feedback = Column(Text, nullable=True)     # Gemini's per-answer feedback

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    answered_at = Column(DateTime, nullable=True)

    session = relationship("InterviewSession", back_populates="questions")