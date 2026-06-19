from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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


@app.post("/upload-resume", response_model=ResumeAnalysisResponse)
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
    try:
        text = await extract_text_from_upload(file)
        return analyze_resume_with_ai(text)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/detailed-feedback")
async def detailed_feedback(file: UploadFile = File(...)):
    try:
        text = await extract_text_from_upload(file)
        return generate_ai_feedback(text)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/match-job")
async def match_job(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...)
):
    resume_text = await extract_text_from_upload(resume)
    jd_text = await extract_text_from_upload(job_description)

    result = match_resume_job(resume_text, jd_text)
    return result


@app.post("/match-job-ai")
async def match_job_ai(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...)
):

    try:
        resume_text = await extract_text_from_upload(resume)
        jd_text = await extract_text_from_upload(job_description)
        result = analyze_job_match_with_ai(resume_text, jd_text)
        return result
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


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