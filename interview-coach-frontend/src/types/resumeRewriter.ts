export interface BulletRewriteItem {
  original: string;
  improved: string;
  issue: string;
  ats_keywords_added: string[];
}

export interface ResumeRewriterResponse {
  overall_ats_score: number;
  ats_issues: string[];
  bullet_rewrites: BulletRewriteItem[];
  missing_metrics_summary: string;
  general_improvements: string[];
}