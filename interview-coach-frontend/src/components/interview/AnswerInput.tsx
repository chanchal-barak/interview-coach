import { useState } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  loading: boolean;
}

export default function AnswerInput({ onSubmit, loading }: AnswerInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
    setText("");
  }

  return (
    <div className="card stack stack--md">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your answer here..."
        disabled={loading}
        rows={6}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          fontSize: "0.92rem",
          fontFamily: "var(--font-body)",
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
      <button
        className="btn btn--primary btn--full btn--lg"
        disabled={!text.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <span className="spinner" /> Evaluating your answer...
          </>
        ) : (
          "Submit Answer"
        )}
      </button>
    </div>
  );
}