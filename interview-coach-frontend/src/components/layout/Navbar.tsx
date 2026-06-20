import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

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
          <NavLink
            to="/resume-rewriter"
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " active" : "")
            }
          >
            Rewriter
          </NavLink>
          <NavLink
            to="/interview"
            className={({ isActive }) =>
              "navbar__link" + (isActive ? " active" : "")
            }
          >
            Interview
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Analytics
              </NavLink>
              <NavLink
                to="/resume-versions"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Versions
              </NavLink>
              <NavLink
                to="/roadmap"
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " active" : "")
                }
              >
                Roadmap
              </NavLink>
              <button
                className="btn btn--secondary btn--sm"
                style={{ marginLeft: 8 }}
                onClick={handleLogout}
              >
                Log Out{user ? ` (${user.full_name.split(" ")[0]})` : ""}
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn--primary btn--sm" style={{ marginLeft: 8 }}>
              Log In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}