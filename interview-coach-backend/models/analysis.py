import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class Analysis(Base):
    """
    Generic storage for any analysis result tied to a user:
    - "resume_analysis"  (heuristic /upload-resume)
    - "ai_feedback"       (/generate-feedback)
    - "detailed_feedback" (/detailed-feedback)
    - "job_match"         (/match-job)
    - "ai_job_match"      (/match-job-ai)

    result_json stores the full JSON response as text so the
    schema never has to change when a feature's response shape evolves.
    """

    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    analysis_type = Column(String(50), nullable=False, index=True)
    result_json = Column(Text, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User", back_populates="analyses")