import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TrendChartProps {
  scores: number[];
  dates: string[];
  color?: string;
  maxValue?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TrendChart({
  scores,
  dates,
  color = "var(--accent)",
  maxValue = 100,
}: TrendChartProps) {
  if (scores.length === 0) {
    return (
      <div
        style={{
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        Not enough data yet — complete a few more sessions to see your trend.
      </div>
    );
  }

  const data = scores.map((score, i) => ({
    name: dates[i] ? formatDate(dates[i]) : `#${i + 1}`,
    score,
  }));

  // Resolve CSS variable to actual color for Recharts (it doesn't read CSS vars itself
  // for SVG stroke/fill in all browsers reliably, so we resolve via computed style).
  const resolvedColor =
    typeof window !== "undefined" && color.startsWith("var(")
      ? getComputedStyle(document.documentElement)
          .getPropertyValue(color.slice(4, -1))
          .trim() || "#0ea5e9"
      : color;

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, maxValue]}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 8,
              fontSize: "0.8rem",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={resolvedColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: resolvedColor }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}