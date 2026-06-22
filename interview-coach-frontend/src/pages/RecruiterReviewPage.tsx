import { useRecruiterReview } from "../hooks/useRecruiterReview";
import ResumeDropzone from "../components/resume/ResumeDropzone";

function scoreColor(pct: number): string {
  if (pct >= 70) return "var(--green)";
  if (pct >= 40) return "var(--amber)";
  return "var(--red)";
}

function ProbabilityBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className="score-grid__item">
      <div className="score-grid__name">{label}</div>
      <div className="score-grid__value" style={{ color }}>
        {value}%
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function RecruiterReviewPage() {
  const { file, result, loading, error, setFile, review } = useRecruiterReview();

  const isHire = result?.decision === "Hire";

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">AI Recruiter Mode</div>
        <h1 className="page-hero__title">See how a real recruiter would screen you</h1>
        <p className="page-hero__sub">
          A direct hire / no-hire call, the way an actual screener would make it.
        </p>
      </div>

      <div className="card stack stack--md">
        <ResumeDropzone file={file} onChange={setFile} />

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!file || loading}
          onClick={review}
        >
          {loading ? (
            <>
              <span className="spinner" /> Screening your resume...
            </>
          ) : (
            "Get Recruiter Review"
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
            This can take 10–20 seconds — simulating a real screening pass.
          </div>
        )}
      </div>

      {result && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <div
            className="card card--accent"
            style={{ textAlign: "center", borderColor: isHire ? "var(--green)" : "var(--red)" }}
          >
            <div className="card__subtitle" style={{ marginBottom: 8 }}>
              Recruiter Decision
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.2rem",
                fontWeight: 700,
                color: isHire ? "var(--green)" : "var(--red)",
              }}
            >
              {isHire ? "✅ Hire" : "❌ No Hire"}
            </div>
          </div>

          <div className="card">
            <div className="score-grid">
              <ProbabilityBar label="Shortlisting" value={result.shortlisting_probability} />
              <ProbabilityBar label="Interview" value={result.interview_probability} />
              <ProbabilityBar label="FAANG Readiness" value={result.faang_readiness_score} />
            </div>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <div className="card__subtitle" style={{ marginBottom: 8 }}>
              Resume Score
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: scoreColor(result.resume_score * 10),
              }}
            >
              {result.resume_score.toFixed(1)}
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>/10</span>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">📋</div>
              <div className="card__title">Recruiter Notes</div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              {result.recruiter_summary}
            </p>
          </div>

          <div className="results-grid">
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">💪</div>
                <div className="card__title">Strengths</div>
              </div>
              <div className="result-list">
                {result.strengths.map((s, i) => (
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
                {result.weaknesses.map((w, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--red" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}