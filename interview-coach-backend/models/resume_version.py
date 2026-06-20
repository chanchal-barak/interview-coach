import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class ResumeVersion(Base):
    """
    A saved snapshot of a resume at a point in time: its extracted text,
    heuristic score, and detected skills — used for version history,
    score-over-time trends, and old-vs-new comparisons.
    """

    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    version_name = Column(String(255), nullable=False)   # user-supplied label, e.g. "v2 - added AWS project"
    file_name = Column(String(255), nullable=False)

    resume_score = Column(Float, nullable=False)          # 0-10, from heuristic analyzer
    extracted_text = Column(Text, nullable=False)          # full text, used later for comparison
    skills_json = Column(Text, nullable=False)              # JSON list of detected languages/skills

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User")