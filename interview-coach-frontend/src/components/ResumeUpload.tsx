import { useState } from "react";
import axios from "axios";

function ResumeUpload() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);

  const [analysis, setAnalysis] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);

    const handleResumeAnalysis = async () => {
    if (!resume) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", resume);

    try {
        const res = await axios.post(
        "http://127.0.0.1:8000/upload-resume",
        formData
        );

        setAnalysis(res.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
    };

  const handleJobMatch = async () => {
    if (!resume || !jobDescription) {
      alert("Please upload both Resume and Job Description");
      return;
    }

    const formData = new FormData();

    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/match-job",
        formData
      );

      setMatchResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Job matching failed");
    }
  };
  

  return (
  <div className="container">

    <div className="card">
      <h1>AI Interview Coach</h1>

      <h2>Resume Upload</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files) {
            setResume(e.target.files[0]);
          }
        }}
      />

      <br /><br />

      <button onClick={handleResumeAnalysis}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>

    {analysis && (
      <div className="card">
        <h2>Resume Score: {analysis.score}/10</h2>

        <h3>Strengths</h3>

        <ul>
          {analysis.strengths.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3>Weaknesses</h3>

        <ul>
          {analysis.weaknesses.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    <div className="card">
      <h2>Job Matching</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files) {
            setJobDescription(e.target.files[0]);
          }
        }}
      />

      <br /><br />

      <button onClick={handleJobMatch}>
        Analyze Match
      </button>
    </div>

    {matchResult && (
      <div className="card">
        <h2>Match Score: {matchResult.match_score}%</h2>

        <h3>Matched Skills</h3>

        <ul>
          {matchResult.matched.map((skill: string) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>

        <h3>Missing Skills</h3>

        <ul>
          {matchResult.missing.map((skill: string) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
}

export default ResumeUpload;