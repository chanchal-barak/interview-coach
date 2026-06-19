from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.auth import HistoryListResponse, HistoryItem
from services.history_service import (
    get_user_history,
    get_analysis_by_id,
    serialize_analysis,
)
from middleware.auth_middleware import get_current_user

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryListResponse)
def list_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = get_user_history(db, current_user.id)
    items = [HistoryItem(**serialize_analysis(r)) for r in records]
    return HistoryListResponse(total=len(items), items=items)


@router.get("/history/{analysis_id}", response_model=HistoryItem)
def get_history_item(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_analysis_by_id(db, current_user.id, analysis_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )
    return HistoryItem(**serialize_analysis(record))