import type { EndInterviewResponse } from "../../types/interview";

interface InterviewSummaryProps {
  result: EndInterviewResponse;
  onRestart: () => void;
}

export default function InterviewSummary({ result, onRestart }: InterviewSummaryProps) {
  const pct = result.overall_score / 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, pct)));
  const color =
    pct >= 0.7 ? "var(--green)" : pct >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div className="stack stack--md">
      <div className="card card--accent" style={{ textAlign: "center" }}>
        <div className="card__title" style={{ marginBottom: 16 }}>
          Interview Complete
        </div>
        <div className="score-ring-wrap" style={{ margin: "0 auto" }}>
          <div className="score-ring" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle
                className="score-ring__track"
                cx="70"
                cy="70"
                r={radius}
              />
              <circle
                className="score-ring__fill"
                cx="70"
                cy="70"
                r={radius}
                stroke={color}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-ring__value">
              <div
                className="score-ring__number"
                style={{ color, fontSize: "2rem" }}
              >
                {Math.round(result.overall_score)}
              </div>
              <div className="score-ring__denom">/ 100</div>
            </div>
          </div>
          <div className="score-ring__label">Overall Score</div>
        </div>
      </div>

      <div className="results-grid">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__subtitle" style={{ marginBottom: 8 }}>
            Technical Score
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color:
                result.technical_score >= 70
                  ? "var(--green)"
                  : result.technical_score >= 40
                  ? "var(--amber)"
                  : "var(--red)",
            }}
          >
            {Math.round(result.technical_score)}
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__subtitle" style={{ marginBottom: 8 }}>
            Communication Score
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color:
                result.communication_score >= 70
                  ? "var(--green)"
                  : result.communication_score >= 40
                  ? "var(--amber)"
                  : "var(--red)",
            }}
          >
            {Math.round(result.communication_score)}
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__icon card__icon--blue">📋</div>
          <div className="card__title">Interviewer Summary</div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
          {result.summary}
        </p>
      </div>

      {result.recommendations.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__icon card__icon--green">🎯</div>
            <div className="card__title">Recommendations</div>
          </div>
          <div className="result-list">
            {result.recommendations.map((r, i) => (
              <div className="result-list__item" key={i}>
                <span className="result-list__dot result-list__dot--blue" />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="section-label">Question-by-Question Breakdown</div>
        <div className="stack stack--md">
          {result.questions.map((q) => (
            <div className="card" key={q.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Q{q.order_index}: {q.question}
                </span>
                {q.score !== null && (
                  <span
                    className={
                      "badge " +
                      (q.score >= 7
                        ? "badge--green"
                        : q.score >= 4
                        ? "badge--amber"
                        : "badge--red")
                    }
                  >
                    {q.score.toFixed(1)}/10
                  </span>
                )}
              </div>
              {q.answer && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 8 }}>
                  <strong style={{ color: "var(--text-primary)" }}>Your answer: </strong>
                  {q.answer}
                </p>
              )}
              {q.feedback && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{q.feedback}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn--primary btn--full btn--lg" onClick={onRestart}>
        Start Another Interview
      </button>
    </div>
  );
}