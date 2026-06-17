from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.pdf_extractor import extract_text_from_upload
from services.resume_analyzer import analyze_resume_text
from services.job_matcher import match_resume_job
from services.gemini_service import (
    analyze_resume_with_ai,
    analyze_job_match_with_ai,
    generate_ai_feedback,
)

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for resume analysis, job matching, and AI feedback.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "AI Interview Coach API is running"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Extracts text from resume PDF and runs heuristic analysis.
    Fast response, no Gemini call.
    """
    text = await extract_text_from_upload(file)
    result = analyze_resume_text(text)
    return result

@app.post("/generate-feedback")
async def generate_feedback(file: UploadFile = File(...)):
    """
    Sends resume to Gemini for structured AI analysis:
    - readiness_score (0-100)
    - section_scores
    - strengths, weaknesses, missing_skills
    - recommendations
    - summary
    """
    text = await extract_text_from_upload(file)

    try:
        result = analyze_resume_with_ai(text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return result

@app.post("/detailed-feedback")
async def detailed_feedback(file: UploadFile = File(...)):
    """
    Deep per-section feedback + bullet point rewrites.
    More expensive Gemini call — use on demand.
    """
    text = await extract_text_from_upload(file)

    try:
        result = generate_ai_feedback(text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return result

@app.post("/match-job")
async def match_job(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...)
):
    """
    Keyword-based job matching. Fast and free.
    Returns match_score, matched skills, missing skills.
    """
    resume_text = await extract_text_from_upload(resume)
    jd_text = await extract_text_from_upload(job_description)

    result = match_resume_job(resume_text, jd_text)
    return result

@app.post("/match-job-ai")
async def match_job_ai(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...)
):
    """
    Gemini-powered job matching with:
    - Semantic skill matching (not just keywords)
    - Skill gap analysis paragraph
    - Role fit summary
    - Recommendations to close the gap
    """
    resume_text = await extract_text_from_upload(resume)
    jd_text = await extract_text_from_upload(job_description)

    try:
        result = analyze_job_match_with_ai(resume_text, jd_text)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return result