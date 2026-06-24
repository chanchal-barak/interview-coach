from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.concurrency import run_in_threadpool

from celery.result import AsyncResult
from workers.celery_app import celery

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
from workers.tasks import (
    resume_analysis_task,
    detailed_feedback_task,
    job_match_task,
)

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for resume analysis, job matching, AI feedback, and user accounts.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://interview-coach-eosin.vercel.app" ],
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

        result = await run_in_threadpool(
            analyze_resume_with_ai,
            text
        )

        if current_user:
            save_analysis(
                db,
                current_user.id,
                "ai_feedback",
                result
            )

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

        result = await run_in_threadpool(
            generate_ai_feedback,
            text
        )

        if current_user:
            save_analysis(
                db,
                current_user.id,
                "detailed_feedback",
                result
            )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


@app.post("/match-job")
async def match_job(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    resume_text = await extract_text_from_upload(resume)
    jd_text = await extract_text_from_upload(job_description)

    result = await run_in_threadpool(
    match_resume_job,
    resume_text,
    jd_text
)

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

        result = await run_in_threadpool(
            analyze_job_match_with_ai,
            resume_text,
            jd_text
        )

        if current_user:
            save_analysis(
                db,
                current_user.id,
                "ai_job_match",
                result
            )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
    
@app.get("/tasks/{task_id}")
def get_task_status(
    task_id: str
):
    task = AsyncResult(
        task_id,
        app=celery
    )

    return {
        "task_id": task.id,
        "status": task.status,
        "result":
            task.result
            if task.ready()
            else None
    }
@app.post("/generate-feedback-async")
async def generate_feedback_async(
    file: UploadFile = File(...)
):
    text = await extract_text_from_upload(file)

    task = resume_analysis_task.delay(
        text
    )

    return {
        "task_id": task.id,
        "status": "queued"
    }
@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    from models.user import User

    users = db.query(User).all()

    return {
        "count": len(users),
        "emails": [u.email for u in users]
    }