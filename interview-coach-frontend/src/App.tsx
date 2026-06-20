import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import FeedbackPage from "./pages/FeedbackPage";
import JobMatchPage from "./pages/JobMatchPage";
import ResumeRewriterPage from "./pages/ResumeRewriterPage";
import InterviewPage from "./pages/InterviewPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ResumeVersionsPage from "./pages/ResumeVersionsPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/styles.css";

function App() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/job-match" element={<JobMatchPage />} />
          <Route path="/resume-rewriter" element={<ResumeRewriterPage />} />

          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-versions"
            element={
              <ProtectedRoute>
                <ResumeVersionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;