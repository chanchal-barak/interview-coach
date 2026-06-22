from services.gemini_service import _call_gemini, _extract_json  # reuse existing low-level helpers


_RECRUITER_PROMPT = """You are a senior technical recruiter at a major tech company, screening resumes for software engineering roles. You have screened thousands of resumes and make fast, honest hire/no-hire calls based on what you actually see — not on potential or good intentions.

Review this resume exactly as you would during a real screening pass. Respond with ONLY a valid JSON object, no markdown, no code fences:

{{
  "decision": "Hire" or "No Hire",
  "shortlisting_probability": <integer 0-100>,
  "interview_probability": <integer 0-100>,
  "resume_score": <float 0-10>,
  "faang_readiness_score": <integer 0-100>,
  "recruiter_summary": "<2-3 paragraph honest recruiter assessment, written the way you'd actually summarize a candidate to a hiring manager>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"]
}}

Rules:
- decision: "Hire" means you'd move this resume forward to a phone screen. "No Hire" means you'd reject it at this stage. Be realistic — most resumes at this stage get rejected, so don't default to "Hire" out of politeness.
- shortlisting_probability: your honest estimate of the odds this resume gets shortlisted out of a typical applicant pool for this type of role.
- interview_probability: given it IS shortlisted, the odds it converts to an actual interview invite.
- resume_score: overall resume quality score, 0-10, considering structure, clarity, and content together.
- faang_readiness_score: 0-100, specifically how ready this candidate looks for FAANG-tier (Google, Meta, Amazon, Microsoft, Apple) screening standards — these are stricter than average.
- recruiter_summary should sound like a real recruiter's notes, not generic encouragement. Be direct about real gaps.
- strengths and weaknesses must be specific to what's actually on this resume, not generic advice.
- Return ONLY the JSON object, nothing else.

Resume:
{resume_text}
"""


def review_resume(resume_text: str) -> dict:
    """
    Sends the resume to Gemini for a simulated recruiter screening pass.
    Raises ValueError on malformed or missing response data.
    """
    prompt = _RECRUITER_PROMPT.format(resume_text=resume_text[:10000])
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "decision", "shortlisting_probability", "interview_probability",
        "resume_score", "faang_readiness_score", "recruiter_summary",
        "strengths", "weaknesses",
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini recruiter review response missing required key: '{key}'")

    if result["decision"] not in ("Hire", "No Hire"):
        result["decision"] = "No Hire"

    return result