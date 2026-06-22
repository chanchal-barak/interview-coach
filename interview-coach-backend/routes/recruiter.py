from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.recruiter import RecruiterReviewResponse
from services.pdf_extractor import extract_text_from_upload
from services.recruiter_service import review_resume
from services.history_service import save_analysis
from middleware.auth_middleware import get_current_user_optional

router = APIRouter(tags=["recruiter"])


@router.post("/recruiter-review", response_model=RecruiterReviewResponse)
async def recruiter_review(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Extracts resume text and sends it to Gemini for a simulated recruiter
    screening pass. Saved to history if logged in.
    """
    text = await extract_text_from_upload(file)

    try:
        result = review_resume(text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if current_user is not None:
        save_analysis(db, current_user.id, "recruiter_review", result)

    return result