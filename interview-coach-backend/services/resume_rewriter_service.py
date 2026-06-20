from services.gemini_service import _call_gemini, _extract_json  # reuse existing low-level helpers


_REWRITER_PROMPT = """You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist reviewing a resume for a software engineering role.

Your job is to rewrite EVERY weak bullet point in this resume — not just a couple of examples. Be exhaustive.

Respond with ONLY a valid JSON object, no markdown, no code fences:

{{
  "overall_ats_score": <integer 0-100>,
  "ats_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "bullet_rewrites": [
    {{
      "original": "<exact bullet text from the resume>",
      "improved": "<rewritten version with strong action verb, ATS keywords, and quantified impact>",
      "issue": "<short label for what was wrong, e.g. 'passive voice', 'no metrics', 'vague impact', 'missing keywords'>",
      "ats_keywords_added": ["<keyword 1>", "<keyword 2>"]
    }}
  ],
  "missing_metrics_summary": "<1-2 sentence summary of how often metrics/numbers are missing across the resume and why that matters>",
  "general_improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}}

Rules for rewriting bullets:
- Identify EVERY bullet point in the experience/projects sections, not just the worst few.
- A bullet only needs rewriting if it's weak — don't rewrite bullets that are already strong (already have metrics, strong action verbs, and clear impact). Skip those.
- Use the format: "<Strong action verb> <what was built/done> <using/with what technology> <resulting in quantified impact>".
- If the original bullet has no number, invent a REALISTIC placeholder is NOT allowed — instead, phrase the improved version to highlight scale/scope qualitatively (e.g. "across the team", "for production use") rather than fabricating fake statistics.
- ats_keywords_added: relevant technical keywords (frameworks, methodologies, tools) that recruiters and ATS systems scan for, which the rewrite naturally incorporates.
- overall_ats_score: 100 = perfectly keyword-optimized and parses cleanly; 0 = unreadable by ATS systems or completely generic.
- ats_issues: structural/formatting problems that hurt ATS parsing (e.g. tables, columns, graphics, missing section headers, unusual fonts implied by formatting).
- Return ONLY the JSON object, nothing else.

Resume:
{resume_text}
"""


def rewrite_resume(resume_text: str) -> dict:
    """
    Sends the resume to Gemini for exhaustive bullet-by-bullet rewriting
    with ATS-friendliness scoring. Raises ValueError on malformed response.
    """
    prompt = _REWRITER_PROMPT.format(resume_text=resume_text[:10000])
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "overall_ats_score", "ats_issues", "bullet_rewrites",
        "missing_metrics_summary", "general_improvements",
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini resume rewriter response missing required key: '{key}'")

    return result