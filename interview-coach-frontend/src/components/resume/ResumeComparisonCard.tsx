import type { CompareResumeVersionsResponse } from "../../types/resumeVersion";

interface ResumeComparisonCardProps {
  comparison: CompareResumeVersionsResponse;
}

export default function ResumeComparisonCard({ comparison }: ResumeComparisonCardProps) {
  const isImproved = comparison.score_change > 0;
  const isSame = comparison.score_change === 0;

  return (
    <div className="stack stack--md">
      <div className="card card--accent">
        <div className="card__title" style={{ marginBottom: 16, textAlign: "center" }}>
          Score Comparison
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div className="card__subtitle" style={{ marginBottom: 4 }}>
              Old Version
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              {comparison.old_score.toFixed(1)}
            </div>
          </div>

          <div style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>→</div>

          <div style={{ textAlign: "center" }}>
            <div className="card__subtitle" style={{ marginBottom: 4 }}>
              New Version
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                color: isImproved ? "var(--green)" : isSame ? "var(--text-secondary)" : "var(--red)",
              }}
            >
              {comparison.new_score.toFixed(1)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span
            className={
              "badge " +
              (isImproved ? "badge--green" : isSame ? "badge--muted" : "badge--red")
            }
          >
            {isImproved ? "▲" : isSame ? "—" : "▼"} {Math.abs(comparison.score_change).toFixed(1)} pts
          </span>
        </div>
      </div>

      <div className="results-grid">
        <div className="card">
          <div className="card__header">
            <div className="card__icon card__icon--green">➕</div>
            <div className="card__title">Skills Added</div>
          </div>
          <div className="skill-grid">
            {comparison.added_skills.length === 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No new skills detected
              </span>
            )}
            {comparison.added_skills.map((s) => (
              <span className="badge badge--green" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div className="card__icon card__icon--red">➖</div>
            <div className="card__title">Skills Removed</div>
          </div>
          <div className="skill-grid">
            {comparison.removed_skills.length === 0 && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No skills removed
              </span>
            )}
            {comparison.removed_skills.map((s) => (
              <span className="badge badge--red" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {comparison.new_recommendations.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__icon card__icon--blue">🎯</div>
            <div className="card__title">New Recommendations</div>
          </div>
          <div className="result-list">
            {comparison.new_recommendations.map((r, i) => (
              <div className="result-list__item" key={i}>
                <span className="result-list__dot result-list__dot--blue" />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}