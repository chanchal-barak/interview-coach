import type { InterviewSessionSummary } from "../../types/interview";

interface InterviewHistoryCardProps {
  session: InterviewSessionSummary;
  onClick?: () => void;
}

function scoreColor(score: number): "green" | "amber" | "red" {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "red";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function InterviewHistoryCard({ session, onClick }: InterviewHistoryCardProps) {
  const isComplete = session.status === "completed" && session.overall_score !== null;

  return (
    <div
      className="card"
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div className="card__title" style={{ marginBottom: 4 }}>
            🎤 {session.role}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="badge badge--muted">{session.difficulty}</span>
            <span className="card__subtitle">{timeAgo(session.created_at)}</span>
          </div>
        </div>

        {isComplete ? (
          <span className={`badge badge--${scoreColor(session.overall_score!)}`}>
            {Math.round(session.overall_score!)}/100
          </span>
        ) : (
          <span className="badge badge--muted">In progress</span>
        )}
      </div>

      {isComplete && session.technical_score !== null && session.communication_score !== null && (
        <div className="results-grid" style={{ gap: 8 }}>
          <div className="score-grid__item">
            <div className="score-grid__name">Technical</div>
            <div
              className="score-grid__value"
              style={{ color: `var(--${scoreColor(session.technical_score)})`, fontSize: "1.1rem" }}
            >
              {Math.round(session.technical_score)}
            </div>
          </div>
          <div className="score-grid__item">
            <div className="score-grid__name">Communication</div>
            <div
              className="score-grid__value"
              style={{
                color: `var(--${scoreColor(session.communication_score)})`,
                fontSize: "1.1rem",
              }}
            >
              {Math.round(session.communication_score)}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--text-muted)" }}>
        {session.question_count} question{session.question_count !== 1 ? "s" : ""}
      </div>
    </div>
  );
}