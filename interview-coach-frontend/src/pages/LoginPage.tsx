import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      const redirectTo =
        (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Welcome back</div>
        <h1 className="page-hero__title">Log in to your account</h1>
        <p className="page-hero__sub">
          Pick up where you left off with your saved reports.
        </p>
      </div>

      <form className="card stack stack--md" onSubmit={handleSubmit}>
        <div className="stack stack--sm">
          <label className="section-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="dropzone__sublabel"
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

        <div className="stack stack--sm">
          <label className="section-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

        {error && (
          <div className="alert alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)" }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
