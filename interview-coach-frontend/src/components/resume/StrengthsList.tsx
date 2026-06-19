interface StrengthsListProps {
  items: string[];
  variant?: "strength" | "weakness";
}

const CONFIG = {
  strength: {
    icon: "💪",
    iconClass: "card__icon--green",
    title: "Strengths",
    dotClass: "result-list__dot--green",
  },
  weakness: {
    icon: "⚠️",
    iconClass: "card__icon--red",
    title: "Weaknesses",
    dotClass: "result-list__dot--red",
  },
};

export default function StrengthsList({
  items,
  variant = "strength",
}: StrengthsListProps) {
  const cfg = CONFIG[variant];

  return (
    <div className="card">
      <div className="card__header">
        <div className={`card__icon ${cfg.iconClass}`}>{cfg.icon}</div>
        <div className="card__title">{cfg.title}</div>
      </div>
      <div className="result-list">
        {items.length === 0 && (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            None detected
          </span>
        )}
        {items.map((item, i) => (
          <div className="result-list__item" key={i}>
            <span className={`result-list__dot ${cfg.dotClass}`} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
