import { useState, useEffect, useCallback } from "react";
import {
  getResumeTrend,
  getInterviewTrend,
  getJobMatchTrend,
  getDashboardSummary,
} from "../services/api";
import type { ScoreTrendResponse, DashboardSummaryResponse } from "../types/analytics";

interface UseAnalyticsResult {
  resumeTrend: ScoreTrendResponse | null;
  interviewTrend: ScoreTrendResponse | null;
  jobMatchTrend: ScoreTrendResponse | null;
  summary: DashboardSummaryResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAnalytics(): UseAnalyticsResult {
  const [resumeTrend, setResumeTrend] = useState<ScoreTrendResponse | null>(null);
  const [interviewTrend, setInterviewTrend] = useState<ScoreTrendResponse | null>(null);
  const [jobMatchTrend, setJobMatchTrend] = useState<ScoreTrendResponse | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getResumeTrend(),
      getInterviewTrend(),
      getJobMatchTrend(),
      getDashboardSummary(),
    ])
      .then(([resume, interview, jobMatch, summaryData]) => {
        setResumeTrend(resume);
        setInterviewTrend(interview);
        setJobMatchTrend(jobMatch);
        setSummary(summaryData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { resumeTrend, interviewTrend, jobMatchTrend, summary, loading, error, refresh: load };
}