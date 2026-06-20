export type CurrentLevel = "Beginner" | "Intermediate" | "Advanced";

export interface WeeklyPlanItem {
  week: number;
  focus: string;
  tasks: string[];
}

export interface CareerRoadmapData {
  current_level: CurrentLevel;
  strengths: string[];
  weaknesses: string[];
  weekly_plan: WeeklyPlanItem[];
  recommended_projects: string[];
  recommended_leetcode_topics: string[];
  recommended_interview_topics: string[];
  recommended_courses: string[];
}

export interface GenerateRoadmapResponse extends CareerRoadmapData {
  id: string;
  created_at: string;
}

export interface RoadmapSummary {
  id: string;
  current_level: CurrentLevel;
  created_at: string;
}

export interface RoadmapHistoryResponse {
  total: number;
  items: RoadmapSummary[];
}