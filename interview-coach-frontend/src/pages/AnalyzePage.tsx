import { useResumeAnalysis } from "../hooks/useResumeAnalysis";
import ResumeDropzone from "../components/resume/ResumeDropzone";
import ScoreCard from "../components/resume/ScoreCard";
import StrengthsList from "../components/resume/StrengthsList";
import RecommendationList from "../components/resume/RecommendationList";

export default function AnalyzePage() {
  const { file, result, loading, error, setFile, analyze } = useResumeAnalysis();

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Step 1</div>
        <h1 className="page-hero__title">Analyze your resume</h1>
        <p className="page-hero__sub">
          Instant heuristic scoring — no AI cost, results in seconds.
        </p>
      </div>

      <div className="card stack stack--md">
        <ResumeDropzone file={file} onChange={setFile} />

        <button
          className="btn btn--primary btn--full btn--lg"
          disabled={!file || loading}
          onClick={analyze}
        >
          {loading ? (
            <>
              <span className="spinner" /> Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="stack stack--md" style={{ marginTop: 24 }}>
          <ScoreCard
            score={result.score}
            projects={result.projects}
            github={result.github}
            languages={result.languages}
          />

          <div className="results-grid">
            <StrengthsList items={result.strengths} variant="strength" />
            <StrengthsList items={result.weaknesses} variant="weakness" />
          </div>

          <RecommendationList items={result.recommendations} />
        </div>
      )}
    </div>
  );
}
