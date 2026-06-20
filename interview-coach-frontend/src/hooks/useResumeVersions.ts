import { useState, useEffect, useCallback } from "react";
import {
  listResumeVersions,
  saveResumeVersion,
  compareResumeVersions,
} from "../services/api";
import type {
  ResumeVersionSummary,
  CompareResumeVersionsResponse,
} from "../types/resumeVersion";

interface UseResumeVersionsResult {
  versions: ResumeVersionSummary[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveVersion: (versionName: string, file: File) => Promise<void>;
  comparing: boolean;
  comparisonResult: CompareResumeVersionsResponse | null;
  compareVersions: (oldId: string, newId: string) => Promise<void>;
  refresh: () => void;
}

export function useResumeVersions(): UseResumeVersionsResult {
  const [versions, setVersions] = useState<ResumeVersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] =
    useState<CompareResumeVersionsResponse | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listResumeVersions()
      .then((data) => setVersions(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load versions."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveVersion = useCallback(
    async (versionName: string, file: File) => {
      setSaving(true);
      setError(null);
      try {
        await saveResumeVersion(versionName, file);
        load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save version.");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const compareVersions = useCallback(async (oldId: string, newId: string) => {
    setComparing(true);
    setError(null);
    setComparisonResult(null);
    try {
      const result = await compareResumeVersions({
        old_version_id: oldId,
        new_version_id: newId,
      });
      setComparisonResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare versions.");
    } finally {
      setComparing(false);
    }
  }, []);

  return {
    versions,
    loading,
    error,
    saving,
    saveVersion,
    comparing,
    comparisonResult,
    compareVersions,
    refresh: load,
  };
}