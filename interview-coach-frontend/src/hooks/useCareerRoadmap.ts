import { useState, useEffect, useCallback } from "react";
import { generateCareerRoadmap, getLatestCareerRoadmap } from "../services/api";
import type { GenerateRoadmapResponse } from "../types/career";

interface UseCareerRoadmapResult {
  roadmap: GenerateRoadmapResponse | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  hasRoadmap: boolean;
  generate: () => Promise<void>;
}

export function useCareerRoadmap(): UseCareerRoadmapResult {
  const [roadmap, setRoadmap] = useState<GenerateRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRoadmap, setHasRoadmap] = useState(false);

  useEffect(() => {
    getLatestCareerRoadmap()
      .then((data) => {
        setRoadmap(data);
        setHasRoadmap(true);
      })
      .catch(() => {
        // 404 expected when the user has never generated one — not an error state
        setRoadmap(null);
        setHasRoadmap(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateCareerRoadmap();
      setRoadmap(data);
      setHasRoadmap(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  }, []);

  return { roadmap, loading, generating, error, hasRoadmap, generate };
}