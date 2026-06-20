import type { QuestionOut } from "../../types/interview";

interface QuestionCardProps {
  question: QuestionOut;
  questionsAsked: number;
  maxQuestions: number;
  elapsedSeconds: number;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuestionCard({
  question,
  questionsAsked,
  maxQuestions,
  elapsedSeconds,
}: QuestionCardProps) {
  // questionsAsked counts *answered* questions; current question is one beyond that
  const currentIndex = Math.min(questionsAsked + 1, maxQuestions);
  const progressPct = (questionsAsked / maxQuestions) * 100;

  return (
    <div className="card card--accent stack stack--md">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge badge--blue">
          Question {currentIndex} / {maxQuestions}
        </span>
        <span className="badge badge--muted">⏱ {formatTime(elapsedSeconds)}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${progressPct}%`, background: "var(--accent)" }}
        />
      </div>

      <div>
        <span
          className={
            "badge " +
            (question.question_type === "technical" ? "badge--amber" : "badge--green")
          }
          style={{ marginBottom: 10 }}
        >
          {question.question_type === "technical" ? "Technical" : "Behavioral"}
        </span>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          {question.question}
        </p>
      </div>
    </div>
  );
}