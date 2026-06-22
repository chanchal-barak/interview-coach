export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "behavioral" | "technical" | "project_based" | "system_design";
export type InterviewMode = "general" | "resume_based" | "job_description_based";

export interface StartInterviewRequest {
  role: string;
  difficulty: Difficulty;
  mode: InterviewMode;
  resume_text?: string | null;
  job_description_text?: string | null;
}

export interface QuestionOut {
  id: string;
  order_index: number;
  question: string;
  question_type: QuestionType;
}

export interface StartInterviewResponse {
  session_id: string;
  role: string;
  difficulty: Difficulty;
  mode: InterviewMode;
  question: QuestionOut;
}

export interface SubmitAnswerRequest {
  session_id: string;
  question_id: string;
  answer: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  ideal_answer_hints: string[];
}

export interface SubmitAnswerResponse {
  evaluation: AnswerEvaluation;
  next_question: QuestionOut | null;
  is_complete: boolean;
  questions_asked: number;
  max_questions: number;
}

export interface QuestionDetail {
  id: string;
  order_index: number;
  question: string;
  question_type: QuestionType;
  answer: string | null;
  score: number | null;
  feedback: string | null;
}

export interface EndInterviewResponse {
  session_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  summary: string;
  recommendations: string[];
  questions: QuestionDetail[];
}

export interface InterviewSessionSummary {
  id: string;
  role: string;
  difficulty: Difficulty;
  mode: InterviewMode;
  status: "active" | "completed";
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  created_at: string;
  completed_at: string | null;
  question_count: number;
}

export interface InterviewHistoryResponse {
  total: number;
  items: InterviewSessionSummary[];
}

export interface InterviewSessionDetail {
  id: string;
  role: string;
  difficulty: Difficulty;
  mode: InterviewMode;
  status: "active" | "completed";
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  summary: string | null;
  recommendations: string[];
  created_at: string;
  completed_at: string | null;
  questions: QuestionDetail[];
}