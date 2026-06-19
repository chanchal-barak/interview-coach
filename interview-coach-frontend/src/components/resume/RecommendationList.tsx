interface RecommendationListProps {
  items: string[];
}

export default function RecommendationList({ items }: RecommendationListProps) {
  return (
    <div className="card">
      <div className="card__header">
        <div className="card__icon card__icon--blue">🎯</div>
        <div className="card__title">Recommendations</div>
      </div>
      <div className="result-list">
        {items.length === 0 && (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No recommendations — resume looks solid.
          </span>
        )}
        {items.map((item, i) => (
          <div className="result-list__item" key={i}>
            <span className="result-list__dot result-list__dot--blue" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
