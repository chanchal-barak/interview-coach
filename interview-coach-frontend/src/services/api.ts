import axios from "axios";
import type {
  ResumeAnalysis,
  AIFeedback,
  DetailedFeedback,
  JobMatch,
  AIJobMatch,
} from "../types";
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  HistoryListResponse,
} from "../types/auth";
import type {
  StartInterviewRequest,
  StartInterviewResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  EndInterviewResponse,
  InterviewHistoryResponse,
  InterviewSessionDetail,
} from "../types/interview";
import type {
  ScoreTrendResponse,
  DashboardSummaryResponse,
} from "../types/analytics.ts";
import type {
  ResumeVersionSummary,
  ResumeVersionListResponse,
  ResumeVersionDetail,
  CompareResumeVersionsRequest,
  CompareResumeVersionsResponse,
} from "../types/resumeVersion.ts";
import type {
  GenerateRoadmapResponse,
  RoadmapHistoryResponse,
} from "../types/career";
import type { ResumeRewriterResponse } from "../types/resumeRewriter";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, 
});


http.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function singleFileForm(file: File, key = "file"): FormData {
  const fd = new FormData();
  fd.append(key, file);
  return fd;
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
    if (err.message) return err.message;
  }
  return "An unexpected error occurred.";
}


export async function uploadResume(file: File): Promise<ResumeAnalysis> {
  try {
    const { data } = await http.post<ResumeAnalysis>(
      "/upload-resume",
      singleFileForm(file)
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function generateFeedback(file: File): Promise<AIFeedback> {
  try {
    const { data } = await http.post<AIFeedback>(
      "/generate-feedback",
      singleFileForm(file)
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getDetailedFeedback(
  file: File
): Promise<DetailedFeedback> {
  try {
    const { data } = await http.post<DetailedFeedback>(
      "/detailed-feedback",
      singleFileForm(file)
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function matchJob(
  resume: File,
  jobDescription: File
): Promise<JobMatch> {
  try {
    const fd = new FormData();
    fd.append("resume", resume);
    fd.append("job_description", jobDescription);
    const { data } = await http.post<JobMatch>("/match-job", fd);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function matchJobAI(
  resume: File,
  jobDescription: File
): Promise<AIJobMatch> {
  try {
    const fd = new FormData();
    fd.append("resume", resume);
    fd.append("job_description", jobDescription);
    const { data } = await http.post<AIJobMatch>("/match-job-ai", fd);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}


export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    const { data } = await http.post<AuthResponse>("/register", payload);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const { data } = await http.post<AuthResponse>("/login", payload);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const { data } = await http.get<User>("/me");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

// ─── NEW: History API calls ────────────────────────────────────────

export async function getHistory(): Promise<HistoryListResponse> {
  try {
    const { data } = await http.get<HistoryListResponse>("/history");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}
export async function startInterview(
  payload: StartInterviewRequest
): Promise<StartInterviewResponse> {
  try {
    const { data } = await http.post<StartInterviewResponse>(
      "/interview/start",
      payload
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function submitInterviewAnswer(
  payload: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  try {
    const { data } = await http.post<SubmitAnswerResponse>(
      "/interview/answer",
      payload
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function endInterview(sessionId: string): Promise<EndInterviewResponse> {
  try {
    const { data } = await http.post<EndInterviewResponse>("/interview/end", {
      session_id: sessionId,
    });
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getInterviewHistory(): Promise<InterviewHistoryResponse> {
  try {
    const { data } = await http.get<InterviewHistoryResponse>("/interview/history");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getInterviewDetail(sessionId: string): Promise<InterviewSessionDetail> {
  try {
    const { data } = await http.get<InterviewSessionDetail>(
      `/interview/history/${sessionId}`
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}


export async function getResumeTrend(): Promise<ScoreTrendResponse> {
  try {
    const { data } = await http.get<ScoreTrendResponse>("/analytics/resume-trend");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getInterviewTrend(): Promise<ScoreTrendResponse> {
  try {
    const { data } = await http.get<ScoreTrendResponse>("/analytics/interview-trend");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getJobMatchTrend(): Promise<ScoreTrendResponse> {
  try {
    const { data } = await http.get<ScoreTrendResponse>("/analytics/job-match-trend");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  try {
    const { data } = await http.get<DashboardSummaryResponse>("/analytics/dashboard-summary");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}


export async function saveResumeVersion(
  versionName: string,
  file: File
): Promise<ResumeVersionSummary> {
  try {
    const fd = new FormData();
    fd.append("version_name", versionName);
    fd.append("file", file);
    const { data } = await http.post<ResumeVersionSummary>("/resume-version/save", fd);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function listResumeVersions(): Promise<ResumeVersionListResponse> {
  try {
    const { data } = await http.get<ResumeVersionListResponse>("/resume-version/list");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getResumeVersion(versionId: string): Promise<ResumeVersionDetail> {
  try {
    const { data } = await http.get<ResumeVersionDetail>(`/resume-version/${versionId}`);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function compareResumeVersions(
  payload: CompareResumeVersionsRequest
): Promise<CompareResumeVersionsResponse> {
  try {
    const { data } = await http.post<CompareResumeVersionsResponse>(
      "/resume-version/compare",
      payload
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}


export async function generateCareerRoadmap(): Promise<GenerateRoadmapResponse> {
  try {
    const { data } = await http.post<GenerateRoadmapResponse>("/career-roadmap/generate");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getCareerRoadmapHistory(): Promise<RoadmapHistoryResponse> {
  try {
    const { data } = await http.get<RoadmapHistoryResponse>("/career-roadmap");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getLatestCareerRoadmap(): Promise<GenerateRoadmapResponse> {
  try {
    const { data } = await http.get<GenerateRoadmapResponse>("/career-roadmap/latest");
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}


export async function rewriteResume(file: File): Promise<ResumeRewriterResponse> {
  try {
    const { data } = await http.post<ResumeRewriterResponse>(
      "/resume-rewriter",
      singleFileForm(file)
    );
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}