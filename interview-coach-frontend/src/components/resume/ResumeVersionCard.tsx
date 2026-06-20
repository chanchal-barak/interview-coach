import type { ResumeVersionSummary } from "../../types/resumeVersion";

interface ResumeVersionCardProps {
  version: ResumeVersionSummary;
  selected?: boolean;
  onClick?: () => void;
}

function scoreColor(score: number): string {
  if (score >= 7) return "var(--green)";
  if (score >= 4) return "var(--amber)";
  return "var(--red)";
}

export default function ResumeVersionCard({
  version,
  selected = false,
  onClick,
}: ResumeVersionCardProps) {
  return (
    <div
      className={"card" + (selected ? " card--accent" : "")}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="card__title">{version.version_name}</div>
          <div className="card__subtitle">
            {version.file_name} · {new Date(version.created_at).toLocaleDateString()}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: scoreColor(version.resume_score),
          }}
        >
          {version.resume_score.toFixed(1)}
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/10</span>
        </div>
      </div>
    </div>
  );
}