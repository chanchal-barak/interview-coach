import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class CareerRoadmap(Base):
    """
    A generated career roadmap snapshot for a user, synthesized from their
    resume analysis, job match, and interview history at generation time.
    roadmap_json stores the full structured roadmap as text, keeping the
    schema flexible the same way Analysis.result_json does.
    """

    __tablename__ = "career_roadmaps"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    current_level = Column(String(50), nullable=False)  # e.g. "Beginner", "Intermediate", "Advanced"
    roadmap_json = Column(Text, nullable=False)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")