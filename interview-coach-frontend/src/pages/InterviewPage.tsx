import { useState } from "react";
import { useInterview } from "../hooks/useInterview";
import QuestionCard from "../components/interview/QuestionCard";
import AnswerInput from "../components/interview/AnswerInput";
import FeedbackPanel from "../components/interview/FeedbackPanel";
import InterviewSummary from "../components/interview/InterviewSummary";
import type { Difficulty, InterviewMode } from "../types/interview";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const MODES: { value: InterviewMode; label: string; description: string }[] = [
  {
    value: "general",
    label: "General Interview",
    description: "Standard role + difficulty questions, no extra material needed.",
  },
  {
    value: "resume_based",
    label: "Resume Based Interview",
    description: "Questions grounded in the real projects and skills on your resume.",
  },
  {
    value: "job_description_based",
    label: "Job Description Based Interview",
    description: "Questions targeting the specific gaps between your resume and a real job posting.",
  },
];

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: "0.88rem",
  fontFamily: "var(--font-body)",
  resize: "vertical",
  lineHeight: 1.6,
};

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
  const [mode, setMode] = useState<InterviewMode>("general");
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const needsResume = mode === "resume_based" || mode === "job_description_based";
  const needsJobDescription = mode === "job_description_based";

  const canStart =
    role.trim().length > 0 &&
    (!needsResume || resumeText.trim().length > 0) &&
    (!needsJobDescription || jobDescriptionText.trim().length > 0);

  async function handleStart() {
    if (!canStart) return;
    await start({
      role: role.trim(),
      difficulty,
      mode,
      resumeText: needsResume ? resumeText.trim() : undefined,
      jobDescriptionText: needsJobDescription ? jobDescriptionText.trim() : undefined,
    });
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
            <label className="section-label">Interview Type</label>
            <div className="stack stack--sm">
              {MODES.map((m) => (
                <label
                  key={m.value}
                  className={"card" + (mode === m.value ? " card--accent" : "")}
                  style={{ padding: 14, cursor: "pointer", display: "block" }}
                  onClick={() => setMode(m.value)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="radio"
                      name="interview-mode"
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.label}</span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: 6,
                      marginLeft: 24,
                    }}
                  >
                    {m.description}
                  </p>
                </label>
              ))}
            </div>
          </div>

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

          {needsResume && (
            <div className="stack stack--sm">
              <label className="section-label" htmlFor="resume-text">
                Paste Your Resume Text
              </label>
              <textarea
                id="resume-text"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume here..."
                rows={6}
                style={textareaStyle}
              />
            </div>
          )}

          {needsJobDescription && (
            <div className="stack stack--sm">
              <label className="section-label" htmlFor="jd-text">
                Paste the Job Description
              </label>
              <textarea
                id="jd-text"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job description text here..."
                rows={6}
                style={textareaStyle}
              />
            </div>
          )}

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
            disabled={!canStart || loading}
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