import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "📄",
    title: "Resume Analysis",
    desc: "Get an instant heuristic score across languages, projects, cloud skills, and formatting — no AI cost, results in seconds.",
  },
  {
    icon: "🧠",
    title: "AI Feedback",
    desc: "Gemini reviews your resume like a FAANG recruiter: readiness score, section breakdown, and specific bullet rewrites.",
  },
  {
    icon: "🎯",
    title: "Job Matching",
    desc: "Upload a job description and see your exact skill match — what you have, what's missing, and how to close the gap.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__glow" />
        <div className="container--narrow">
          <div className="home-hero__eyebrow">
            <span>⚡</span> Powered by Gemini 2.5
          </div>
          <h1 className="home-hero__title">
            Land your next <span>internship</span> with confidence
          </h1>
          <p className="home-hero__sub">
            Upload your resume and get a real recruiter's read on it — strengths,
            gaps, and exactly what to fix before you apply to Google, Amazon, or Meta.
          </p>
          <div className="home-hero__ctas">
            <Link to="/analyze" className="btn btn--primary btn--lg">
              Analyze My Resume
            </Link>
            <Link to="/job-match" className="btn btn--secondary btn--lg">
              Match Against a Job
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="container">
          <div className="section-label" style={{ textAlign: "center" }}>
            What you get
          </div>
          <div className="home-features__grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-card__icon">{f.icon}</span>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
