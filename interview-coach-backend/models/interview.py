import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class InterviewSession(Base):
    """
    Reserved for the upcoming Interview Simulator feature.
    Not yet wired to any route — table exists now so the
    migration path stays clean when that feature is built.
    """

    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role_target = Column(String(255), nullable=True)
    status = Column(String(20), default="active", nullable=False)  # active | completed
    total_score = Column(Float, nullable=True)
    questions_json = Column(Text, nullable=True)  # full Q&A transcript as JSON
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User")