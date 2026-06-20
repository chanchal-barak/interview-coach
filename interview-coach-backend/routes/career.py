from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.career import GenerateRoadmapResponse, RoadmapHistoryResponse, RoadmapSummary
from services.career_service import (
    generate_roadmap,
    get_roadmap_history,
    get_latest_roadmap,
    serialize_roadmap,
)
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/career-roadmap", tags=["career-roadmap"])


@router.post("/generate", response_model=GenerateRoadmapResponse)
def generate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        record = generate_roadmap(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return GenerateRoadmapResponse(**serialize_roadmap(record))


@router.get("", response_model=RoadmapHistoryResponse)
def history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = get_roadmap_history(db, current_user.id)
    items = [RoadmapSummary.model_validate(r) for r in records]
    return RoadmapHistoryResponse(total=len(items), items=items)


@router.get("/latest", response_model=GenerateRoadmapResponse)
def latest(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_latest_roadmap(db, current_user.id)
    if record is None:
        raise HTTPException(status_code=404, detail="No career roadmap generated yet.")

    return GenerateRoadmapResponse(**serialize_roadmap(record))