export type HireDecision = "Hire" | "No Hire";

export interface RecruiterReviewResponse {
  decision: HireDecision;
  shortlisting_probability: number;
  interview_probability: number;
  resume_score: number;
  faang_readiness_score: number;
  recruiter_summary: string;
  strengths: string[];
  weaknesses: string[];
}