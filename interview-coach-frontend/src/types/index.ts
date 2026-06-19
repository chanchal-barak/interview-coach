
export interface ResumeAnalysis {
  score: number;          // 0–10
  raw_score: number;
  max_score: number;
  projects: number;
  github: boolean;
  languages: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SectionScores {
  education: number;
  experience: number;
  skills: number;
  projects: number;
  formatting: number;
}

export interface AIFeedback {
  readiness_score: number; 
  section_scores: SectionScores;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  recommendations: string[];
  summary: string;
}

export interface BulletRewrite {
  original: string;
  improved: string;
}

export interface SectionFeedback {
  education: string;
  experience: string;
  projects: string;
  skills: string;
  formatting: string;
}

export interface DetailedFeedback {
  overall_feedback: string;
  section_feedback: SectionFeedback;
  bullet_rewrites: BulletRewrite[];
  interview_readiness: string;
}

export interface JobMatch {
  match_score: number;
  matched: string[];
  missing: string[];
  note?: string;
}

export interface AIJobMatch {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  skill_gap_analysis: string;
  recommendations: string[];
  role_fit_summary: string;
}