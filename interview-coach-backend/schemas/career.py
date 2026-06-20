from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


CurrentLevel = Literal["Beginner", "Intermediate", "Advanced"]


class WeeklyPlanItem(BaseModel):
    week: int
    focus: str
    tasks: list[str] = Field(default_factory=list)


class CareerRoadmapData(BaseModel):
    current_level: CurrentLevel
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    weekly_plan: list[WeeklyPlanItem] = Field(default_factory=list)
    recommended_projects: list[str] = Field(default_factory=list)
    recommended_leetcode_topics: list[str] = Field(default_factory=list)
    recommended_interview_topics: list[str] = Field(default_factory=list)
    recommended_courses: list[str] = Field(default_factory=list)


class GenerateRoadmapResponse(CareerRoadmapData):
    id: str
    created_at: datetime


class RoadmapSummary(BaseModel):
    id: str
    current_level: CurrentLevel
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapHistoryResponse(BaseModel):
    total: int
    items: list[RoadmapSummary]