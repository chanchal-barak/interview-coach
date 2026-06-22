from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from services.pdf_extractor import extract_text_from_upload
from services.resume_analyzer import analyze_resume_text
from services.job_matcher import match_resume_job
from services.gemini_service import (
    analyze_resume_with_ai,
    analyze_job_match_with_ai,
    generate_ai_feedback,
    client
)
from schemas.resume import ResumeAnalysisResponse

from database.connection import engine, get_db
from models.base import Base
from models import user, analysis, interview, resume_version, career_roadmap  # noqa: F401 — registers tables with Base
from models.user import User
from routes import auth as auth_routes
from routes import history as history_routes
from routes import interview as interview_routes
from routes import analytics as analytics_routes
from routes import resume_version as resume_version_routes
from routes import career as career_routes
from routes import resume_rewriter as resume_rewriter_routes
from routes import recruiter as recruiter_routes
from middleware.auth_middleware import get_current_user_optional
from services.history_service import save_analysis

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for resume analysis, job matching, AI feedback, and user accounts.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(history_routes.router)
app.include_router(interview_routes.router)
app.include_router(analytics_routes.router)
app.include_router(resume_version_routes.router)
app.include_router(career_routes.router)
app.include_router(resume_rewriter_routes.router)
app.include_router(recruiter_routes.router)


@app.get("/")
def root():
    return {"status": "AI Interview Coach API is running"}


@app.post("/upload-resume", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Extracts text from resume PDF and runs heuristic analysis.
    Fast response, no Gemini call. Saved to history if logged in.
    """
    text = await extract_text_from_upload(file)
    result = analyze_resume_text(text)

    if current_user is not None:
        save_analysis(db, current_user.id, "resume_analysis", result)

    return result


@app.post("/generate-feedback")
async def generate_feedback(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    try:
        text = await extract_text_from_upload(file)
        result = analyze_resume_with_ai(text)

        if current_user is not None:
            save_analysis(db, current_user.id, "ai_feedback", result)

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )


@app.post("/detailed-feedback")
async def detailed_feedback(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    try:
        text = await extract_text_from_upload(file)
        result = generate_ai_feedback(text)

        if current_user is not None:
            save_analysis(db, current_user.id, "detailed_feedback", result)

        return result
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/match-job")
async def match_job(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    resume_text = await extract_text_from_upload(resume)
    jd_text = await extract_text_from_upload(job_description)

    result = match_resume_job(resume_text, jd_text)

    if current_user is not None:
        save_analysis(db, current_user.id, "job_match", result)

    return result


@app.post("/match-job-ai")
async def match_job_ai(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):

    try:
        resume_text = await extract_text_from_upload(resume)
        jd_text = await extract_text_from_upload(job_description)
        result = analyze_job_match_with_ai(resume_text, jd_text)

        if current_user is not None:
            save_analysis(db, current_user.id, "ai_job_match", result)

        return result
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/test-gemini")
def test_gemini():
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say hello"
        )

        return {
            "success": True,
            "text": response.text
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }