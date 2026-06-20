import { useCareerRoadmap } from "../hooks/useCareerRoadmap";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "var(--amber)",
  Intermediate: "var(--accent)",
  Advanced: "var(--green)",
};

export default function RoadmapPage() {
  const { roadmap, loading, generating, error, hasRoadmap, generate } = useCareerRoadmap();

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">AI Career Roadmap</div>
        <h1 className="page-hero__title">Your personalized path forward</h1>
        <p className="page-hero__sub">
          Built from your real resume analyses, job matches, and interview history.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && (
        <div className="card stack stack--md" style={{ marginBottom: 24 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {hasRoadmap
              ? "Generate a fresh roadmap any time — it'll factor in everything you've done since your last one."
              : "You haven't generated a roadmap yet. Run a resume analysis, job match, or mock interview first for the best results, or generate now for a general starter plan."}
          </p>

          {error && (
            <div className="alert alert--error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className="btn btn--primary btn--full btn--lg"
            disabled={generating}
            onClick={generate}
          >
            {generating ? (
              <>
                <span className="spinner" /> Building your roadmap...
              </>
            ) : hasRoadmap ? (
              "Regenerate Roadmap"
            ) : (
              "Generate My Roadmap"
            )}
          </button>
        </div>
      )}

      {roadmap && (
        <div className="stack stack--md">
          <div className="card card--accent" style={{ textAlign: "center" }}>
            <div className="card__subtitle" style={{ marginBottom: 8 }}>
              Current Level
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: LEVEL_COLORS[roadmap.current_level] ?? "var(--text-primary)",
              }}
            >
              {roadmap.current_level}
            </div>
          </div>

          <div className="results-grid">
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">💪</div>
                <div className="card__title">Strengths</div>
              </div>
              <div className="result-list">
                {roadmap.strengths.map((s, i) => (
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
                {roadmap.weaknesses.map((w, i) => (
                  <div className="result-list__item" key={i}>
                    <span className="result-list__dot result-list__dot--red" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="section-label">4-Week Learning Plan</div>
            <div className="stack stack--md">
              {roadmap.weekly_plan.map((w) => (
                <div className="card" key={w.week}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span className="badge badge--blue">Week {w.week}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{w.focus}</span>
                  </div>
                  <div className="result-list">
                    {w.tasks.map((t, i) => (
                      <div className="result-list__item" key={i}>
                        <span className="result-list__dot result-list__dot--blue" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🛠️</div>
              <div className="card__title">Recommended Projects</div>
            </div>
            <div className="result-list">
              {roadmap.recommended_projects.map((p, i) => (
                <div className="result-list__item" key={i}>
                  <span className="result-list__dot result-list__dot--blue" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div className="results-grid">
            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--amber">🧩</div>
                <div className="card__title">LeetCode Topics</div>
              </div>
              <div className="skill-grid">
                {roadmap.recommended_leetcode_topics.map((t) => (
                  <span className="badge badge--amber" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__header">
                <div className="card__icon card__icon--green">🎤</div>
                <div className="card__title">Interview Topics</div>
              </div>
              <div className="skill-grid">
                {roadmap.recommended_interview_topics.map((t) => (
                  <span className="badge badge--green" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="card__icon card__icon--blue">🎓</div>
              <div className="card__title">Recommended Courses</div>
            </div>
            <div className="result-list">
              {roadmap.recommended_courses.map((c, i) => (
                <div className="result-list__item" key={i}>
                  <span className="result-list__dot result-list__dot--blue" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}