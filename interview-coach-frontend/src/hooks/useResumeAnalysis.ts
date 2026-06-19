import { useState, useCallback } from "react";
import { uploadResume } from "../services/api";
import type { ResumeAnalysis } from "../types";

interface UseResumeAnalysisResult {
  file: File | null;
  result: ResumeAnalysis | null;
  loading: boolean;
  error: string | null;
  setFile: (f: File | null) => void;
  analyze: () => Promise<void>;
  reset: () => void;
}

export function useResumeAnalysis(): UseResumeAnalysisResult {
  const [file, setFileState] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFile = useCallback((f: File | null) => {
    setFileState(f);
    setResult(null);
    setError(null);
  }, []);

  const analyze = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadResume(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFileState(null);
    setResult(null);
    setError(null);
  }, []);

  return { file, result, loading, error, setFile, analyze, reset };
}