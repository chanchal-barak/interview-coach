import { useState } from "react";
import { matchJob, matchJobAI } from "../services/api";
import type { JobMatch, AIJobMatch } from "../types";

type Tab = "keyword" | "ai";

function MatchRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value / 100));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const color =
    pct >= 0.7 ? "var(--green)" : pct >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div className="score-ring-wrap">
      <div className="score-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle className="score-ring__track" cx="60" cy="60" r={radius} />
          <circle
            className="score-ring__fill"
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-ring__value">
          <div className="score-ring__number" style={{ color }}>
            {value}%
          </div>
        </div>
      </div>
      <div className="score-ring__label">Match Score</div>
    </div>
  );
}

function FileSlot({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <div className="section-label">{label}</div>
      <label className={"dropzone" + (file ? " dropzone--has-file" : "")}>
        <span className="dropzone__icon">{file ? "✅" : "📄"}</span>
        <div className="dropzone__label">{file ? "File ready" : "Click to browse"}</div>
        <div className="dropzone__sublabel">PDF only, max 10MB</div>
        {file && <div className="dropzone__filename">{file.name}</div>}
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

export default function JobMatchPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>("keyword");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywordResult, setKeywordResult] = useState<JobMatch | null>(null);
  const [aiResult, setAiResult] = useState<AIJobMatch | null>(null);

  function resetResults() {
    setKeywordResult(null);
    setAiResult(null);
    setError(null);
  }

  async function handleMatch() {
    if (!resume || !jd) {
      setError("Please upload both your resume and a job description.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (tab === "keyword") {
        const data = await matchJob(resume, jd);
        setKeywordResult(data);
      } else {
        const data = await matchJobAI(resume, jd);
        setAiResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Job matching failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    resetResults();
  }

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Step 3</div>
        <h1 className="page-hero__title">Match against a job</h1>
        <p className="page-hero__sub">
          See exactly which skills you have and which ones you're missing.
        </p>
      </div>

      <div className="tabs">
        <button
          className={"tab" + (tab === "keyword" ? " active" : "")}
          onClick={() => switchTab("keyword")}
        >
          Keyword Match
        </button>
        <button
          className={"tab" + (tab === "ai" ? " active" : "")}
          onClick={() => switchTab("ai")}
        >
          AI Semantic Match
        </button>
      </div>

      <div className="card stack stack--md">
        <div className="results-grid">
          <FileSlot label="Resume" file={resume} onChange={(f) => { setResume(f); resetResults(); }} />
          <FileSlot label="Job Description" file={jd} onChange={(f) => { setJd(f); resetResults(); }} />
        </div>

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!resume || !jd || loading}
          onClick={handleMatch}
        >
          {loading ? (
            <>
              <span className="spinner" /> Matching...
            </>
          ) : tab === "keyword" ? (
            "Run Keyword Match"
          ) : (
            "Run AI Match"
          )}
        </button>

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading && tab === "ai" && (
          <div className="alert alert--info">
            <span className="spinner spinner--sm" />
            This can take 10–20 seconds — Gemini is comparing both documents.
          </div>
        )}
      </div>

      {/* ─── Keyword Match Results ─── */}
      {tab === "keyword" && keywordResult && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          {keywordResult.note ? (
            <div className="alert alert--info">
              <span>ℹ️</span> {keywordResult.note}
            </div>
          ) : (
            <>
              <div className="card" style={{ display: "flex", justifyContent: "center" }}>
                <MatchRing value={keywordResult.match_score} />
              </div>

              <div className="results-grid">
                <div className="card">
                  <div className="card__header">
                    <div className="card__icon card__icon--green">✅</div>
                    <div className="card__title">Matched Skills</div>
                  </div>
                  <div className="skill-grid">
                    {keywordResult.matched.length === 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        None found
                      </span>
                    )}
                    {keywordResult.matched.map((s) => (
                      <span className="badge badge--green" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card__header">
                    <div className="card__icon card__icon--red">❌</div>
                    <div className="card__title">Missing Skills</div>
                  </div>
                  <div className="skill-grid">
                    {keywordResult.missing.length === 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        None — full coverage!
                      </span>
                    )}
                    {keywordResult.missing.map((s) => (
                      <span className="badge badge--red" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── AI Match Results ─── */}
      {tab === "ai" && aiResult && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <div className="card" style={{ display: "flex", justifyContent: "center" }}>
            <MatchRing value={aiResult.match_score} />
          </div>

          <div className="card card--accent">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🧠</div>
              <div className="card__title">Role Fit Summary</div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {aiResult.role_fit_summary}
            </p>
            <div className="divider" />
            <div className="section-label">Skill Gap Analysis</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {aiResult.skill_gap_analysis}
            </p>
          </div>

          <div className="results-grid">
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">✅</div>
                <div className="card__title">Matched Skills</div>
              </div>
              <div className="skill-grid">
                {aiResult.matched_skills.map((s) => (
                  <span className="badge badge--green" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--red">❌</div>
                <div className="card__title">Missing Skills</div>
              </div>
              <div className="skill-grid">
                {aiResult.missing_skills.map((s) => (
                  <span className="badge badge--red" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🎯</div>
              <div className="card__title">Recommendations</div>
            </div>
            <div className="result-list">
              {aiResult.recommendations.map((r, i) => (
                <div className="result-list__item" key={i}>
                  <span className="result-list__dot result-list__dot--blue" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
