import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo">
          <div className="navbar__logo-icon">🎯</div>
          InterviewCoach
        </NavLink>

        <div className="navbar__nav">
          <NavLink
            to="/analyze"
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " active" : "")
            }
          >
            Analyze Resume
          </NavLink>
          <NavLink
            to="/feedback"
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " active" : "")
            }
          >
            AI Feedback
          </NavLink>
          <NavLink
            to="/job-match"
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " active" : "")
            }
          >
            Job Match
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
