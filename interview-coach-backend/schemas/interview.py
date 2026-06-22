from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


Difficulty = Literal["easy", "medium", "hard"]
QuestionType = Literal["behavioral", "technical", "project_based", "system_design"]
InterviewMode = Literal["general", "resume_based", "job_description_based"]



class StartInterviewRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=255, examples=["Backend Engineer Intern"])
    difficulty: Difficulty = "medium"
    mode: InterviewMode = "general"
    resume_text: str | None = Field(None, max_length=20000)
    job_description_text: str | None = Field(None, max_length=10000)


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str = Field(..., min_length=1, max_length=8000)


class EndInterviewRequest(BaseModel):
    session_id: str


class QuestionOut(BaseModel):
    id: str
    order_index: int
    question: str
    question_type: QuestionType

    class Config:
        from_attributes = True


class StartInterviewResponse(BaseModel):
    session_id: str
    role: str
    difficulty: Difficulty
    mode: InterviewMode
    question: QuestionOut


class AnswerEvaluation(BaseModel):
    score: float = Field(..., ge=0, le=10)
    feedback: str
    ideal_answer_hints: list[str] = Field(default_factory=list)


class SubmitAnswerResponse(BaseModel):
    evaluation: AnswerEvaluation
    next_question: QuestionOut | None = None
    is_complete: bool = False
    questions_asked: int
    max_questions: int


class QuestionDetail(BaseModel):
    id: str
    order_index: int
    question: str
    question_type: QuestionType
    answer: str | None
    score: float | None
    feedback: str | None

    class Config:
        from_attributes = True


class EndInterviewResponse(BaseModel):
    session_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    summary: str
    recommendations: list[str] = Field(default_factory=list)
    questions: list[QuestionDetail]


class InterviewSessionSummary(BaseModel):
    id: str
    role: str
    difficulty: Difficulty
    mode: InterviewMode
    status: str
    overall_score: float | None
    technical_score: float | None
    communication_score: float | None
    created_at: datetime
    completed_at: datetime | None
    question_count: int

    class Config:
        from_attributes = True


class InterviewHistoryResponse(BaseModel):
    total: int
    items: list[InterviewSessionSummary]


class InterviewSessionDetail(BaseModel):
    id: str
    role: str
    difficulty: Difficulty
    mode: InterviewMode
    status: str
    overall_score: float | None
    technical_score: float | None
    communication_score: float | None
    summary: str | None
    recommendations: list[str] = Field(default_factory=list)
    created_at: datetime
    completed_at: datetime | None
    questions: list[QuestionDetail]

    class Config:
        from_attributes = True