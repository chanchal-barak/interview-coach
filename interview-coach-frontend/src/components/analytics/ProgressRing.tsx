interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
}

export default function ProgressRing({ value, max = 100, size = 100, label }: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  const color =
    pct >= 0.7 ? "var(--green)" : pct >= 0.4 ? "var(--amber)" : "var(--red)";

  return (
    <div className="score-ring-wrap">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="score-ring__track"
            cx={center}
            cy={center}
            r={radius}
          />
          <circle
            className="score-ring__fill"
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-ring__value">
          <div
            className="score-ring__number"
            style={{ color, fontSize: size < 90 ? "1.1rem" : "1.5rem" }}
          >
            {Math.round(value)}
          </div>
        </div>
      </div>
      {label && <div className="score-ring__label">{label}</div>}
    </div>
  );
}