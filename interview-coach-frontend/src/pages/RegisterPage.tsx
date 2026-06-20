import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const inputStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "var(--bg-elevated)",
  color: "var(--text-primary)",
  fontSize: "0.9rem",
  width: "100%",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({ full_name: fullName, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container--narrow">
      <div className="page-hero">
        <div className="page-hero__eyebrow">Get started</div>
        <h1 className="page-hero__title">Create your account</h1>
        <p className="page-hero__sub">
          Save your resume analyses, feedback, and job matches in one place.
        </p>
      </div>

      <form className="card stack stack--md" onSubmit={handleSubmit}>
        <div className="stack stack--sm">
          <label className="section-label" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            style={inputStyle}
          />
        </div>

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
            style={inputStyle}
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={inputStyle}
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
              <span className="spinner" /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)" }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
