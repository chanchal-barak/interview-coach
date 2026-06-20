import { useResumeRewriter } from "../hooks/useResumeRewriter";
import ResumeDropzone from "../components/resume/ResumeDropzone";

function atsScoreColor(score: number): string {
  if (score >= 70) return "var(--green)";
  if (score >= 40) return "var(--amber)";
  return "var(--red)";
}

export default function ResumeRewriterPage() {
  const { file, result, loading, error, setFile, rewrite } = useResumeRewriter();

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">AI Resume Rewriter</div>
        <h1 className="page-hero__title">Rewrite every weak bullet</h1>
        <p className="page-hero__sub">
          Get an ATS score and a rewritten version of every underperforming bullet point.
        </p>
      </div>

      <div className="card stack stack--md">
        <ResumeDropzone file={file} onChange={setFile} />

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!file || loading}
          onClick={rewrite}
        >
          {loading ? (
            <>
              <span className="spinner" /> Rewriting your resume...
            </>
          ) : (
            "Rewrite My Resume"
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
            This can take 15–30 seconds — Gemini is reviewing every bullet point.
          </div>
        )}
      </div>

      {result && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <div className="card card--accent" style={{ textAlign: "center" }}>
            <div className="card__subtitle" style={{ marginBottom: 8 }}>
              ATS Friendliness Score
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.4rem",
                fontWeight: 700,
                color: atsScoreColor(result.overall_ats_score),
              }}
            >
              {result.overall_ats_score}
              <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span>
            </div>
          </div>

          {result.ats_issues.length > 0 && (
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--amber">⚠️</div>
                <div className="card__title">ATS Formatting Issues</div>
              </div>
              <div className="result-list">
                {result.ats_issues.map((issue, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--amber" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">📊</div>
              <div className="card__title">Metrics Coverage</div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              {result.missing_metrics_summary}
            </p>
          </div>

          <div>
            <div className="section-label">
              Bullet Rewrites ({result.bullet_rewrites.length})
            </div>
            <div className="stack stack--md">
              {result.bullet_rewrites.length === 0 && (
                <div className="card">
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    No weak bullets found — your existing bullets already use strong
                    action verbs and quantified impact.
                  </p>
                </div>
              )}

              {result.bullet_rewrites.map((b, i) => (
                <div className="rewrite-card" key={i}>
                  <div className="rewrite-card__before">
                    <div className="rewrite-card__tag rewrite-card__tag--before">
                      Original — {b.issue}
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
                    {b.ats_keywords_added.length > 0 && (
                      <div className="skill-grid" style={{ marginTop: 10 }}>
                        {b.ats_keywords_added.map((kw) => (
                          <span className="badge badge--blue" key={kw}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.general_improvements.length > 0 && (
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">🎯</div>
                <div className="card__title">General Improvements</div>
              </div>
              <div className="result-list">
                {result.general_improvements.map((g, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--blue" />
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}