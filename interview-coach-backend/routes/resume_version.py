import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.resume_version import (
    ResumeVersionSummary,
    ResumeVersionListResponse,
    ResumeVersionDetail,
    CompareResumeVersionsRequest,
    CompareResumeVersionsResponse,
)
from services.resume_version_service import (
    create_resume_version,
    list_resume_versions,
    get_resume_version,
    compare_resume_versions,
)
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/resume-version", tags=["resume-version"])


@router.post("/save", response_model=ResumeVersionSummary, status_code=status.HTTP_201_CREATED)
async def save_version(
    version_name: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        record = create_resume_version(
            db, current_user.id, version_name, file.filename, contents
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return ResumeVersionSummary.model_validate(record)


@router.get("/list", response_model=ResumeVersionListResponse)
def list_versions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = list_resume_versions(db, current_user.id)
    items = [ResumeVersionSummary.model_validate(r) for r in records]
    return ResumeVersionListResponse(total=len(items), items=items)


@router.get("/{version_id}", response_model=ResumeVersionDetail)
def get_version(
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_resume_version(db, current_user.id, version_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Resume version not found.")

    return ResumeVersionDetail(
        id=record.id,
        version_name=record.version_name,
        file_name=record.file_name,
        resume_score=record.resume_score,
        skills=json.loads(record.skills_json),
        extracted_text=record.extracted_text,
        created_at=record.created_at,
    )


@router.post("/compare", response_model=CompareResumeVersionsResponse)
def compare_versions(
    payload: CompareResumeVersionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = compare_resume_versions(
        db, current_user.id, payload.old_version_id, payload.new_version_id
    )
    if result is None:
        raise HTTPException(
            status_code=404,
            detail="One or both resume versions not found for this user.",
        )

    return CompareResumeVersionsResponse(**result)