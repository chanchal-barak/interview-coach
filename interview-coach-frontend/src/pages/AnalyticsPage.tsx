import { useAnalytics } from "../hooks/useAnalytics";
import AnalyticsCard from "../components/analytics/AnalyticsCard";
import ProgressRing from "../components/analytics/ProgressRing";

export default function AnalyticsPage() {
  const { resumeTrend, interviewTrend, jobMatchTrend, summary, loading, error } = useAnalytics();

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Progress Analytics</div>
        <h1 className="page-hero__title">Your improvement over time</h1>
        <p className="page-hero__sub">
          Track how your resume, interviews, and job matches have evolved.
        </p>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <span className="spinner" />
        </div>
      )}

      {!loading && summary && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card__header">
              <div className="card__icon card__icon--blue">📊</div>
              <div className="card__title">Overall Summary</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 20,
                justifyItems: "center",
                marginTop: 8,
              }}
            >
              {summary.latest_resume_score !== null && (
                <ProgressRing
                  value={summary.latest_resume_score}
                  size={100}
                  label="Resume Score"
                />
              )}
              {summary.latest_interview_score !== null && (
                <ProgressRing
                  value={summary.latest_interview_score}
                  size={100}
                  label="Interview Score"
                />
              )}
              {summary.latest_job_match_score !== null && (
                <ProgressRing
                  value={summary.latest_job_match_score}
                  size={100}
                  label="Job Match Score"
                />
              )}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {summary.total_reports}
                </div>
                <div className="score-ring__label">Total Reports</div>
              </div>
            </div>
          </div>

          <div className="stack stack--md">
            <AnalyticsCard
              title="Resume Score"
              icon="📄"
              scores={resumeTrend?.scores ?? []}
              dates={resumeTrend?.dates ?? []}
              improvement={summary.resume_improvement}
              latestScore={summary.latest_resume_score}
              color="var(--accent)"
            />

            <AnalyticsCard
              title="Interview Score"
              icon="🎤"
              scores={interviewTrend?.scores ?? []}
              dates={interviewTrend?.dates ?? []}
              improvement={summary.interview_improvement}
              latestScore={summary.latest_interview_score}
              color="var(--green)"
            />

            <AnalyticsCard
              title="Job Match Score"
              icon="🎯"
              scores={jobMatchTrend?.scores ?? []}
              dates={jobMatchTrend?.dates ?? []}
              improvement={summary.job_match_improvement}
              latestScore={summary.latest_job_match_score}
              color="var(--amber)"
            />
          </div>
        </>
      )}
    </div>
  );
}