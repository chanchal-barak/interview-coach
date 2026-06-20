import { useState } from "react";
import { useInterview } from "../hooks/useInterview";
import QuestionCard from "../components/interview/QuestionCard";
import AnswerInput from "../components/interview/AnswerInput";
import FeedbackPanel from "../components/interview/FeedbackPanel";
import InterviewSummary from "../components/interview/InterviewSummary";
import type { Difficulty } from "../types/interview";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function InterviewPage() {
  const {
    phase,
    currentQuestion,
    questionsAsked,
    maxQuestions,
    lastEvaluation,
    finalResult,
    elapsedSeconds,
    loading,
    error,
    start,
    submitAnswer,
    reset,
  } = useInterview();

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showFeedback, setShowFeedback] = useState(false);

  async function handleStart() {
    if (!role.trim()) return;
    await start(role.trim(), difficulty);
  }

  async function handleAnswerSubmit(answer: string) {
    setShowFeedback(false);
    await submitAnswer(answer);
    setShowFeedback(true);
  }

  function handleContinue() {
    setShowFeedback(false);
  }

  // ─── Setup screen ───────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="container--narrow">
        <div className="page-hero">
          <div className="page-hero__eyebrow">Mock Interview</div>
          <h1 className="page-hero__title">AI Interview Simulator</h1>
          <p className="page-hero__sub">
            Practice with an AI interviewer that adapts to your answers in real time.
          </p>
        </div>

        <div className="card stack stack--md">
          <div className="stack stack--sm">
            <label className="section-label" htmlFor="role">
              Target Role
            </label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Backend Engineer Intern"
              style={{
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                width: "100%",
              }}
            />
          </div>

          <div className="stack stack--sm">
            <label className="section-label">Difficulty</label>
            <div className="tabs">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  className={"tab" + (difficulty === d.value ? " active" : "")}
                  onClick={() => setDifficulty(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert--error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className="btn btn--primary btn--full btn--lg"
            disabled={!role.trim() || loading}
            onClick={handleStart}
          >
            {loading ? (
              <>
                <span className="spinner" /> Preparing your interview...
              </>
            ) : (
              "Start Interview"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Completion screen ──────────────────────────────────────────
  if (phase === "complete" && finalResult) {
    return (
      <div className="container--narrow">
        <div className="page-hero">
          <div className="page-hero__eyebrow">Results</div>
          <h1 className="page-hero__title">Your Interview Results</h1>
        </div>
        <InterviewSummary result={finalResult} onRestart={reset} />
      </div>
    );
  }

  // ─── Active interview screen ────────────────────────────────────
  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">In Progress</div>
        <h1 className="page-hero__title">Interview in progress</h1>
        <p className="page-hero__sub">Role: {role}</p>
      </div>

      <div className="stack stack--md">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionsAsked={questionsAsked}
            maxQuestions={maxQuestions}
            elapsedSeconds={elapsedSeconds}
          />
        )}

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        {showFeedback && lastEvaluation ? (
          <>
            <FeedbackPanel evaluation={lastEvaluation} />
            <button className="btn btn--secondary btn--full" onClick={handleContinue}>
              Continue to Next Question
            </button>
          </>
        ) : (
          <AnswerInput onSubmit={handleAnswerSubmit} loading={loading || phase === "evaluating"} />
        )}
      </div>
    </div>
  );
}