from fastapi import FastAPI, UploadFile, File
import pdfplumber
from fastapi.middleware.cors import CORSMiddleware
from services.resume_analyzer import analyze_resume_text
from services.job_matcher import match_resume_job

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_pdf_text(filepath):
    text = ""

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text

    return text



@app.get("/")
def home():
    return {"message": "Interview Coach API Running"}



@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    filepath = f"uploads/{file.filename}"

    with open(filepath, "wb") as f:
        f.write(await file.read())

    text = ""

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text

    analysis = analyze_resume_text(text)

    return analysis

@app.post("/match-job")
async def match_job(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...)
):

    resume_path = f"uploads/{resume.filename}"
    jd_path = f"uploads/{job_description.filename}"

    with open(resume_path, "wb") as f:
        f.write(await resume.read())

    with open(jd_path, "wb") as f:
        f.write(await job_description.read())

    resume_text = extract_pdf_text(resume_path)
    jd_text = extract_pdf_text(jd_path)

    result = match_resume_job(
        resume_text,
        jd_text
    )

    return result