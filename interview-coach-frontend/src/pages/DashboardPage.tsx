import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHistory, getInterviewHistory, getDashboardSummary, listResumeVersions } from "../services/api";
import type { HistoryItem } from "../types/auth";
import type { InterviewSessionSummary } from "../types/interview";
import type { DashboardSummaryResponse } from "../types/analytics";
import type { ResumeVersionSummary } from "../types/resumeVersion";
import InterviewHistoryCard from "../components/interview/InterviewHistoryCard";
import { useCareerRoadmap } from "../hooks/useCareerRoadmap";

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "mock-1",
    analysis_type: "resume_analysis",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    result: { score: 7.5 },
  },
  {
    id: "mock-2",
    analysis_type: "ai_feedback",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    result: { readiness_score: 68 },
  },
  {
    id: "mock-3",
    analysis_type: "job_match",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    result: { match_score: 72 },
  },
];

const TYPE_LABELS: Record<string, string> = {
  resume_analysis: "Resume Analysis",
  ai_feedback: "AI Feedback",
  detailed_feedback: "Detailed Feedback",
  job_match: "Job Match",
  ai_job_match: "AI Job Match",
};

const TYPE_ICONS: Record<string, string> = {
  resume_analysis: "📄",
  ai_feedback: "🧠",
  detailed_feedback: "📋",
  job_match: "🎯",
  ai_job_match: "🎯",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { roadmap, hasRoadmap, loading: roadmapLoading } = useCareerRoadmap();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);

  const [interviews, setInterviews] = useState<InterviewSessionSummary[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((data) => {
        setHistory(data.items);
        setUsingMock(false);
      })
      .catch(() => {
        // Backend history not ready yet — fall back to mock data
        setHistory(MOCK_HISTORY);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getInterviewHistory()
      .then((data) => setInterviews(data.items))
      .catch(() => setInterviews([]))
      .finally(() => setInterviewsLoading(false));
  }, []);

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [latestVersion, setLatestVersion] = useState<ResumeVersionSummary | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    listResumeVersions()
      .then((data) => setLatestVersion(data.items[0] ?? null))
      .catch(() => setLatestVersion(null));
  }, []);

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const totalInterviews = interviews.length;
  const averageInterviewScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.overall_score ?? 0), 0) /
            completedInterviews.length
        )
      : null;

  const resumeCount = history.filter((h) => h.analysis_type === "resume_analysis").length;
  const feedbackCount = history.filter(
    (h) => h.analysis_type === "ai_feedback" || h.analysis_type === "detailed_feedback"
  ).length;
  const jobMatchCount = history.filter(
    (h) => h.analysis_type === "job_match" || h.analysis_type === "ai_job_match"
  ).length;

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Dashboard</div>
        <h1 className="page-hero__title">Welcome back{user ? `, ${user.full_name}` : ""}</h1>
        <p className="page-hero__sub">Here's a snapshot of your activity.</p>
      </div>

      {usingMock && !loading && (
        <div className="alert alert--info" style={{ marginBottom: 20 }}>
          <span>ℹ️</span> Showing sample activity — your real history will appear
          here once saved.
        </div>
      )}

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card__header">
          <div className="card__icon card__icon--blue">👤</div>
          <div>
            <div className="card__title">{user?.full_name ?? "—"}</div>
            <div className="card__subtitle">{user?.email ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Growth metrics */}
      {summary && (
        <div
          className="card"
          style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div className="card__header" style={{ marginBottom: 0 }}>
            <div className="card__icon card__icon--green">📈</div>
            <div className="card__title">Your Growth</div>
          </div>
          <Link to="/analytics" className="btn btn--outline btn--sm">
            View Full Analytics
          </Link>
        </div>
      )}

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {[
            { label: "Resume Growth", value: summary.resume_improvement },
            { label: "Interview Growth", value: summary.interview_improvement },
            { label: "Job Match Growth", value: summary.job_match_improvement },
          ].map((g) => {
            const isPositive = g.value > 0;
            const isNeutral = g.value === 0;
            return (
              <div className="card" key={g.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: isNeutral
                      ? "var(--text-muted)"
                      : isPositive
                      ? "var(--green)"
                      : "var(--red)",
                  }}
                >
                  {isNeutral ? "—" : `${isPositive ? "+" : ""}${g.value}`}
                  {!isNeutral && <span style={{ fontSize: "1rem" }}> pts</span>}
                </div>
                <div className="card__subtitle">{g.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resume rewriter */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="card__header"
          style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="card__icon card__icon--blue">✍️</div>
            <div>
              <div className="card__title">AI Resume Rewriter</div>
              <div className="card__subtitle">Get every weak bullet rewritten</div>
            </div>
          </div>
          <Link to="/resume-rewriter" className="btn btn--primary btn--sm">
            Rewrite Resume
          </Link>
        </div>
      </div>

      {/* Recruiter review */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="card__header"
          style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="card__icon card__icon--amber">🕴️</div>
            <div>
              <div className="card__title">AI Recruiter Mode</div>
              <div className="card__subtitle">Get a real hire / no-hire call</div>
            </div>
          </div>
          <Link to="/recruiter-review" className="btn btn--primary btn--sm">
            Get Reviewed
          </Link>
        </div>
      </div>

      {/* Career roadmap */}
      {!roadmapLoading && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div
            className="card__header"
            style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="card__icon card__icon--green">🧭</div>
              <div>
                <div className="card__title">AI Career Roadmap</div>
                <div className="card__subtitle">
                  {hasRoadmap && roadmap
                    ? `Current level: ${roadmap.current_level}`
                    : "Not generated yet"}
                </div>
              </div>
            </div>
            <Link to="/roadmap" className="btn btn--primary btn--sm">
              {hasRoadmap ? "View Roadmap" : "Generate Roadmap"}
            </Link>
          </div>
        </div>
      )}

      {/* Latest resume version */}
      {latestVersion && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div
            className="card__header"
            style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="card__icon card__icon--blue">📄</div>
              <div>
                <div className="card__title">Latest Resume Version</div>
                <div className="card__subtitle">{latestVersion.version_name}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {latestVersion.resume_score.toFixed(1)}
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/10</span>
              </span>
              <Link to="/resume-versions" className="btn btn--secondary btn--sm">
                View All
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__icon card__icon--blue" style={{ margin: "0 auto 12px" }}>
            📄
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}>
            {resumeCount}
          </div>
          <div className="card__subtitle">Resume Analyses</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__icon card__icon--green" style={{ margin: "0 auto 12px" }}>
            🧠
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}>
            {feedbackCount}
          </div>
          <div className="card__subtitle">AI Feedback Reports</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__icon card__icon--amber" style={{ margin: "0 auto 12px" }}>
            🎯
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}>
            {jobMatchCount}
          </div>
          <div className="card__subtitle">Job Match Reports</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__icon card__icon--blue" style={{ margin: "0 auto 12px" }}>
            🎤
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}>
            {totalInterviews}
          </div>
          <div className="card__subtitle">Total Interviews</div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <div className="card__icon card__icon--green" style={{ margin: "0 auto 12px" }}>
            📊
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}>
            {averageInterviewScore !== null ? averageInterviewScore : "—"}
          </div>
          <div className="card__subtitle">Avg. Interview Score</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card__header">
          <div className="card__icon card__icon--blue">🕒</div>
          <div className="card__title">Recent Activity</div>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <span className="spinner" />
          </div>
        )}

        {!loading && history.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            No activity yet. Run a resume analysis to get started.
          </p>
        )}

        {!loading && history.length > 0 && (
          <div className="result-list">
            {history.map((item) => (
              <div
                key={item.id}
                className="result-list__item"
                style={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <span>
                  {TYPE_ICONS[item.analysis_type] ?? "📌"}{" "}
                  {TYPE_LABELS[item.analysis_type] ?? item.analysis_type}
                </span>
                <span className="badge badge--muted">{timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent interview sessions */}
      <div className="card" style={{ marginTop: 16 }}>
        <div
          className="card__header"
          style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="card__icon card__icon--blue">🎤</div>
            <div className="card__title">Recent Interview Sessions</div>
          </div>
          <Link to="/interview" className="btn btn--primary btn--sm">
            + New Interview
          </Link>
        </div>

        {interviewsLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <span className="spinner" />
          </div>
        )}

        {!interviewsLoading && interviews.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            No interviews yet. Try the AI Interview Simulator to get started.
          </p>
        )}

        {!interviewsLoading && interviews.length > 0 && (
          <div className="stack stack--md">
            {interviews.slice(0, 5).map((session) => (
              <InterviewHistoryCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}