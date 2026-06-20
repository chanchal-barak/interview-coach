export interface ResumeVersionSummary {
  id: string;
  version_name: string;
  file_name: string;
  resume_score: number;
  created_at: string;
}

export interface ResumeVersionListResponse {
  total: number;
  items: ResumeVersionSummary[];
}

export interface ResumeVersionDetail {
  id: string;
  version_name: string;
  file_name: string;
  resume_score: number;
  skills: string[];
  extracted_text: string;
  created_at: string;
}

export interface CompareResumeVersionsRequest {
  old_version_id: string;
  new_version_id: string;
}

export interface CompareResumeVersionsResponse {
  old_version_id: string;
  new_version_id: string;
  old_score: number;
  new_score: number;
  score_change: number;
  added_skills: string[];
  removed_skills: string[];
  new_recommendations: string[];
}