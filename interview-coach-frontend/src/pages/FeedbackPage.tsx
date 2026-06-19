import { useState } from "react";
import { generateFeedback, getDetailedFeedback } from "../services/api";
import type { AIFeedback, DetailedFeedback } from "../types";

type Tab = "quick" | "detailed";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "var(--green)" : value >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="score-grid__item">
      <div className="score-grid__name">{label}</div>
      <div className="score-grid__value" style={{ color }}>
        {value}
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>("quick");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickResult, setQuickResult] = useState<AIFeedback | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedFeedback | null>(null);

  function handleFileChange(f: File | null) {
    setFile(f);
    setQuickResult(null);
    setDetailedResult(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === "quick") {
        const data = await generateFeedback(file);
        setQuickResult(data);
      } else {
        const data = await getDetailedFeedback(file);
        setDetailedResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI feedback failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
  }

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Step 2</div>
        <h1 className="page-hero__title">Get AI feedback</h1>
        <p className="page-hero__sub">
          Gemini reviews your resume like a real recruiter would.
        </p>
      </div>

      <div className="tabs">
        <button
          className={"tab" + (tab === "quick" ? " active" : "")}
          onClick={() => switchTab("quick")}
        >
          Quick Score
        </button>
        <button
          className={"tab" + (tab === "detailed" ? " active" : "")}
          onClick={() => switchTab("detailed")}
        >
          Detailed Rewrite
        </button>
      </div>

      <div className="card stack stack--md">
        <label className={"dropzone" + (file ? " dropzone--has-file" : "")}>
          <span className="dropzone__icon">{file ? "✅" : "📄"}</span>
          <div className="dropzone__label">
            {file ? "File ready" : "Drag & drop your resume, or click to browse"}
          </div>
          <div className="dropzone__sublabel">PDF only, max 10MB</div>
          {file && <div className="dropzone__filename">{file.name}</div>}
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!file || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <span className="spinner" /> Asking Gemini...
            </>
          ) : tab === "quick" ? (
            "Get AI Score"
          ) : (
            "Get Detailed Rewrite"
          )}
        </button>

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading && (
          <div className="alert alert--info">
            <span className="spinner spinner--sm" />
            This can take 10–20 seconds — Gemini is reading the whole resume.
          </div>
        )}
      </div>

      {/* ─── Quick Score Results ─── */}
      {tab === "quick" && quickResult && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <div className="card card--accent">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🧠</div>
              <div>
                <div className="card__title">Interview Readiness</div>
                <div className="card__subtitle">Gemini's overall verdict</div>
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.4rem",
                fontWeight: 700,
                color:
                  quickResult.readiness_score >= 70
                    ? "var(--green)"
                    : quickResult.readiness_score >= 40
                    ? "var(--amber)"
                    : "var(--red)",
              }}
            >
              {quickResult.readiness_score}
              <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span>
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: 12, fontSize: "0.9rem" }}>
              {quickResult.summary}
            </p>

            <div className="score-grid">
              {Object.entries(quickResult.section_scores).map(([key, val]) => (
                <ScoreBar key={key} label={key} value={val} />
              ))}
            </div>
          </div>

          <div className="results-grid">
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">💪</div>
                <div className="card__title">Strengths</div>
              </div>
              <div className="result-list">
                {quickResult.strengths.map((s, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--green" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--red">⚠️</div>
                <div className="card__title">Weaknesses</div>
              </div>
              <div className="result-list">
                {quickResult.weaknesses.map((w, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--red" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--amber">🚫</div>
              <div className="card__title">Missing Skills</div>
            </div>
            <div className="skill-grid">
              {quickResult.missing_skills.map((s) => (
                <span className="badge badge--red" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🎯</div>
              <div className="card__title">Recommendations</div>
            </div>
            <div className="result-list">
              {quickResult.recommendations.map((r, i) => (
                <div className="result-list__item" key={i}>
                  <span className="result-list__dot result-list__dot--blue" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Detailed Rewrite Results ─── */}
      {tab === "detailed" && detailedResult && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <div className="card card--accent">
            <div className="card__header">
              <div className="card__icon card__icon--blue">📋</div>
              <div className="card__title">Overall Feedback</div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {detailedResult.overall_feedback}
            </p>
            <div className="divider" />
            <div className="alert alert--info">
              <span>🎯</span> {detailedResult.interview_readiness}
            </div>
          </div>

          <div className="card">
            <div className="section-label">Section-by-Section</div>
            <div className="stack stack--md">
              {Object.entries(detailedResult.section_feedback).map(([key, val]) => (
                <div key={key}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      textTransform: "capitalize",
                      marginBottom: 4,
                    }}
                  >
                    {key}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-label">Bullet Rewrites</div>
            <div className="stack stack--md">
              {detailedResult.bullet_rewrites.map((b, i) => (
                <div className="rewrite-card" key={i}>
                  <div className="rewrite-card__before">
                    <div className="rewrite-card__tag rewrite-card__tag--before">
                      Original
                    </div>
                    <div className="rewrite-card__text">{b.original}</div>
                  </div>
                  <div className="rewrite-card__after">
                    <div className="rewrite-card__tag rewrite-card__tag--after">
                      Improved
                    </div>
                    <div className="rewrite-card__text" style={{ color: "var(--text-primary)" }}>
                      {b.improved}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
