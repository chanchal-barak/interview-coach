import type { QuestionOut, QuestionType } from "../../types/interview";

interface QuestionCardProps {
  question: QuestionOut;
  questionsAsked: number;
  maxQuestions: number;
  elapsedSeconds: number;
}

const TYPE_CONFIG: Record<QuestionType, { label: string; badgeClass: string }> = {
  behavioral: { label: "Behavioral", badgeClass: "badge--green" },
  technical: { label: "Technical", badgeClass: "badge--amber" },
  project_based: { label: "Project-Based", badgeClass: "badge--blue" },
  system_design: { label: "System Design", badgeClass: "badge--red" },
};

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
          className={"badge " + TYPE_CONFIG[question.question_type].badgeClass}
          style={{ marginBottom: 10 }}
        >
          {TYPE_CONFIG[question.question_type].label}
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