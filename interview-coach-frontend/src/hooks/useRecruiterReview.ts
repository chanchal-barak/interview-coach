import { useState, useCallback } from "react";
import { getRecruiterReview } from "../services/api";
import type { RecruiterReviewResponse } from "../types/recruiter";

interface UseRecruiterReviewResult {
  file: File | null;
  result: RecruiterReviewResponse | null;
  loading: boolean;
  error: string | null;
  setFile: (f: File | null) => void;
  review: () => Promise<void>;
  reset: () => void;
}

export function useRecruiterReview(): UseRecruiterReviewResult {
  const [file, setFileState] = useState<File | null>(null);
  const [result, setResult] = useState<RecruiterReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFile = useCallback((f: File | null) => {
    setFileState(f);
    setResult(null);
    setError(null);
  }, []);

  const review = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRecruiterReview(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recruiter review failed.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFileState(null);
    setResult(null);
    setError(null);
  }, []);

  return { file, result, loading, error, setFile, review, reset };
}