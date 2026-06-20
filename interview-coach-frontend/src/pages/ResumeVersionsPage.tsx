import { useState } from "react";
import { useResumeVersions } from "../hooks/useResumeVersions";
import ResumeVersionCard from "../components/resume/ResumeVersionCard";
import ResumeComparisonCard from "../components/resume/ResumeComparisonCard";
import ResumeDropzone from "../components/resume/ResumeDropzone";

export default function ResumeVersionsPage() {
  const {
    versions,
    loading,
    error,
    saving,
    saveVersion,
    comparing,
    comparisonResult,
    compareVersions,
  } = useResumeVersions();

  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [selectedOld, setSelectedOld] = useState<string | null>(null);
  const [selectedNew, setSelectedNew] = useState<string | null>(null);

  async function handleSave() {
    if (!file || !versionName.trim()) return;
    try {
      await saveVersion(versionName.trim(), file);
      setFile(null);
      setVersionName("");
    } catch {
      // error already surfaced via hook's error state
    }
  }

  function handleSelectVersion(id: string) {
    if (selectedOld === id) {
      setSelectedOld(null);
      return;
    }
    if (selectedNew === id) {
      setSelectedNew(null);
      return;
    }
    if (!selectedOld) {
      setSelectedOld(id);
    } else if (!selectedNew) {
      setSelectedNew(id);
    } else {
      // both already selected — start over with this as the new "old"
      setSelectedOld(id);
      setSelectedNew(null);
    }
  }

  async function handleCompare() {
    if (!selectedOld || !selectedNew) return;
    await compareVersions(selectedOld, selectedNew);
  }

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Resume Versions</div>
        <h1 className="page-hero__title">Track every iteration</h1>
        <p className="page-hero__sub">
          Save a snapshot each time you update your resume, then compare any two versions.
        </p>
      </div>

      {/* Save new version */}
      <div className="card stack stack--md" style={{ marginBottom: 24 }}>
        <div className="section-label">Save a New Version</div>

        <input
          type="text"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          placeholder="e.g. v3 - added AWS certification"
          style={{
            padding: "11px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            width: "100%",
          }}
        />

        <ResumeDropzone file={file} onChange={setFile} />

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!file || !versionName.trim() || saving}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <span className="spinner" /> Saving version...
            </>
          ) : (
            "Save Version"
          )}
        </button>
      </div>

      {/* Version timeline */}
      <div className="section-label">
        Version Timeline {versions.length > 0 && `(tap 2 to compare)`}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && versions.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          No versions saved yet. Save your first resume above to start tracking.
        </p>
      )}

      {!loading && versions.length > 0 && (
        <div className="stack stack--md" style={{ marginBottom: 24 }}>
          {versions.map((v) => (
            <ResumeVersionCard
              key={v.id}
              version={v}
              selected={selectedOld === v.id || selectedNew === v.id}
              onClick={() => handleSelectVersion(v.id)}
            />
          ))}
        </div>
      )}

      {selectedOld && selectedNew && (
        <button
          className="btn btn--secondary btn--full btn--lg"
          disabled={comparing}
          onClick={handleCompare}
          style={{ marginBottom: 24 }}
        >
          {comparing ? (
            <>
              <span className="spinner" /> Comparing...
            </>
          ) : (
            "Compare Selected Versions"
          )}
        </button>
      )}

      {comparisonResult && <ResumeComparisonCard comparison={comparisonResult} />}
    </div>
  );
}