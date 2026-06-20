export interface ScoreTrendResponse {
  scores: number[];
  dates: string[];
}

export interface DashboardSummaryResponse {
  resume_improvement: number;
  interview_improvement: number;
  job_match_improvement: number;
  total_reports: number;
  latest_resume_score: number | null;
  latest_interview_score: number | null;
  latest_job_match_score: number | null;
}