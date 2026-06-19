from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ─────────────────────────────────────────────
# Requests
# ─────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ─────────────────────────────────────────────
# Responses
# ─────────────────────────────────────────────

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str   # user id
    exp: int


# ─────────────────────────────────────────────
# History
# ─────────────────────────────────────────────

class HistoryItem(BaseModel):
    id: str
    analysis_type: str
    created_at: datetime
    result: dict

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    total: int
    items: list[HistoryItem]