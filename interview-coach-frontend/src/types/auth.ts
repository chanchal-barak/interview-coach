export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface HistoryItem {
  id: string;
  analysis_type:
    | "resume_analysis"
    | "ai_feedback"
    | "detailed_feedback"
    | "job_match"
    | "ai_job_match";
  created_at: string;
  result: Record<string, unknown>;
}

export interface HistoryListResponse {
  total: number;
  items: HistoryItem[];
}