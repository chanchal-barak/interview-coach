import TrendChart from "./TrendChart";

interface AnalyticsCardProps {
  title: string;
  icon: string;
  scores: number[];
  dates: string[];
  improvement: number;
  latestScore: number | null;
  color?: string;
}

export default function AnalyticsCard({
  title,
  icon,
  scores,
  dates,
  improvement,
  latestScore,
  color,
}: AnalyticsCardProps) {
  const isPositive = improvement > 0;
  const isNeutral = improvement === 0;

  return (
    <div className="card">
      <div
        className="card__header"
        style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="card__icon card__icon--blue">{icon}</div>
          <div>
            <div className="card__title">{title}</div>
            {latestScore !== null && (
              <div className="card__subtitle">Latest: {Math.round(latestScore)}</div>
            )}
          </div>
        </div>

        {!isNeutral && (
          <span className={"badge " + (isPositive ? "badge--green" : "badge--red")}>
            {isPositive ? "▲" : "▼"} {Math.abs(improvement)} pts
          </span>
        )}
      </div>

      <TrendChart scores={scores} dates={dates} color={color} />
    </div>
  );
}