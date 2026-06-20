import { useState, useCallback } from "react";
import { rewriteResume } from "../services/api";
import type { ResumeRewriterResponse } from "../types/resumeRewriter";

interface UseResumeRewriterResult {
  file: File | null;
  result: ResumeRewriterResponse | null;
  loading: boolean;
  error: string | null;
  setFile: (f: File | null) => void;
  rewrite: () => Promise<void>;
  reset: () => void;
}

export function useResumeRewriter(): UseResumeRewriterResult {
  const [file, setFileState] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeRewriterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFile = useCallback((f: File | null) => {
    setFileState(f);
    setResult(null);
    setError(null);
  }, []);

  const rewrite = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rewriteResume(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume rewrite failed.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFileState(null);
    setResult(null);
    setError(null);
  }, []);

  return { file, result, loading, error, setFile, rewrite, reset };
}