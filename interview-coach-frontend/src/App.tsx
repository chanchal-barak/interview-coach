import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import FeedbackPage from "./pages/FeedbackPage";
import JobMatchPage from "./pages/JobMatchPage";
import "./styles/styles.css";

function App() {
  return (
    <BrowserRouter>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/job-match" element={<JobMatchPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
