import type { AnswerEvaluation } from "../../types/interview";

interface FeedbackPanelProps {
  evaluation: AnswerEvaluation;
}

export default function FeedbackPanel({ evaluation }: FeedbackPanelProps) {
  const color =
    evaluation.score >= 7
      ? "var(--green)"
      : evaluation.score >= 4
      ? "var(--amber)"
      : "var(--red)";

  return (
    <div className="card stack stack--md">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 700,
            color,
          }}
        >
          {evaluation.score.toFixed(1)}
          <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span>
        </div>
        <div className="card__title">Answer Feedback</div>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
        {evaluation.feedback}
      </p>

      {evaluation.ideal_answer_hints.length > 0 && (
        <div>
          <div className="section-label">What a strong answer would include</div>
          <div className="result-list">
            {evaluation.ideal_answer_hints.map((hint, i) => (
              <div className="result-list__item" key={i}>
                <span className="result-list__dot result-list__dot--blue" />
                {hint}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}