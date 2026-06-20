from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.resume_rewriter import ResumeRewriterResponse
from services.pdf_extractor import extract_text_from_upload
from services.resume_rewriter_service import rewrite_resume
from services.history_service import save_analysis
from middleware.auth_middleware import get_current_user_optional

router = APIRouter(tags=["resume-rewriter"])


@router.post("/resume-rewriter", response_model=ResumeRewriterResponse)
async def resume_rewriter(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Extracts resume text and sends it to Gemini for exhaustive bullet
    rewriting with ATS-friendliness scoring. Saved to history if logged in.
    """
    text = await extract_text_from_upload(file)

    try:
        result = rewrite_resume(text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if current_user is not None:
        save_analysis(db, current_user.id, "resume_rewriter", result)

    return result