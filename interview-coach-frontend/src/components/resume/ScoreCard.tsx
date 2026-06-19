interface ScoreCardProps {
  score: number;
  max?: number;
  projects: number;
  github: boolean;
  languages: string[];
}

export default function ScoreCard({
  score,
  max = 10,
  projects,
  github,
  languages,
}: ScoreCardProps) {
  const pct = Math.max(0, Math.min(1, score / max));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const color =
    pct >= 0.7 ? "var(--green)" : pct >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div className="card" style={{ display: "flex", gap: 28, alignItems: "center" }}>
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
              {score.toFixed(1)}
            </div>
            <div className="score-ring__denom">/ {max}</div>
          </div>
        </div>
        <div className="score-ring__label">Resume Score</div>
      </div>

      <div className="stack stack--sm">
        <div className="card__title">Quick Stats</div>
        <div className="result-list__item">
          <span className="result-list__dot result-list__dot--blue" />
          Projects detected: <strong>{projects}</strong>
        </div>
        <div className="result-list__item">
          <span
            className={
              "result-list__dot " +
              (github ? "result-list__dot--green" : "result-list__dot--red")
            }
          />
          GitHub profile: <strong>{github ? "Linked" : "Not found"}</strong>
        </div>
        {languages.length > 0 && (
          <div className="skill-grid">
            {languages.map((lang) => (
              <span className="badge badge--blue" key={lang}>
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
