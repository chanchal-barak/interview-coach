import axios from "axios";
import type {
  ResumeAnalysis,
  AIFeedback,
  DetailedFeedback,
  JobMatch,
  AIJobMatch,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
});

// ─── helpers ─────────────────────────────────────────────────────

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

// ─── API calls ───────────────────────────────────────────────────

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