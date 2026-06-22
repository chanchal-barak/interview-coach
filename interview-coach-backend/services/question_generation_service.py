from services.gemini_service import _call_gemini, _extract_json 
from services.job_matcher import match_resume_job

QUESTION_TYPES = ("behavioral", "technical", "project_based", "system_design")

MAX_RESUME_CHARS = 6000
MAX_JD_CHARS = 3000


_GENERAL_FIRST_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

Generate the FIRST interview question. The first question should be a warm, approachable behavioral or background question.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text>",
  "question_type": "behavioral"
}}
"""

_GENERAL_NEXT_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

This is question {question_number} of {max_questions}.

Transcript so far:
{transcript}

Generate the NEXT question. It should:
- Adapt to the candidate's previous answers (probe deeper on a weak area, or move to a new topic if they answered well)
- Get progressively more challenging as the interview proceeds
- Choose the most appropriate category for this point in the interview

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text>",
  "question_type": "behavioral" or "technical" or "project_based" or "system_design"
}}
"""

_RESUME_BASED_FIRST_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

Here is the candidate's actual resume:
{resume_text}

Generate the FIRST interview question, grounded in something specific from this resume — a real project, technology, or experience they listed. Make it feel like you actually read their resume, not a generic opener.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text, referencing something specific from the resume>",
  "question_type": "project_based" or "behavioral"
}}
"""

_RESUME_BASED_NEXT_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

Here is the candidate's actual resume:
{resume_text}

This is question {question_number} of {max_questions}.

Transcript so far:
{transcript}

Generate the NEXT question. It must be grounded in specific content from the resume above — ask about a project they built, a technology they listed, or a claim they made. Adapt difficulty based on how well they've answered so far. Mix categories across the interview: technical depth on their stated skills, project_based deep-dives into what they built, system_design questions extrapolating from their project scale, and behavioral questions about their listed experience.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text, referencing something specific from the resume>",
  "question_type": "behavioral" or "technical" or "project_based" or "system_design"
}}
"""

_JD_BASED_FIRST_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

Here is the actual job description for this role:
{jd_text}

Here is the candidate's resume:
{resume_text}

Here is an automated skill-match analysis comparing the two:
- Match score: {match_score}%
- Skills the candidate already has that this job requires: {matched_skills}
- Skills this job requires that the candidate is missing: {missing_skills}

Generate the FIRST interview question. Make it relevant to this specific job description — focus on a core requirement of the role.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text>",
  "question_type": "behavioral" or "technical"
}}
"""

_JD_BASED_NEXT_PROMPT = """You are an experienced technical interviewer conducting a mock interview for a {role} position at {difficulty} difficulty.

Job description:
{jd_text}

Candidate's resume:
{resume_text}

Skill-match analysis:
- Match score: {match_score}%
- Matched skills: {matched_skills}
- Missing skills: {missing_skills}

This is question {question_number} of {max_questions}.

Transcript so far:
{transcript}

Generate the NEXT question. Prioritize probing the candidate's MISSING skills (from the gap analysis above) to see how they'd handle the parts of the job they're weakest on — this is the most valuable signal for this kind of interview. Also ask about matched skills to verify real depth, not just keyword presence. Mix categories: technical, project_based, behavioral, and system_design as appropriate for a {difficulty} {role} interview.

Respond with ONLY a valid JSON object, no markdown, no code fences:
{{
  "question": "<the question text>",
  "question_type": "behavioral" or "technical" or "project_based" or "system_design"
}}
"""


def _validate_question(result: dict) -> dict:
    if "question" not in result or "question_type" not in result:
        raise ValueError("Gemini question response missing required keys.")
    if result["question_type"] not in QUESTION_TYPES:
        result["question_type"] = "behavioral"
    return result


def generate_first_question(
    mode: str,
    role: str,
    difficulty: str,
    resume_text: str | None,
    job_description_text: str | None,
) -> dict:
    """
    Generates the opening question for a new interview session, using
    whichever source material is available for the chosen mode.
    """
    if mode == "resume_based" and resume_text:
        prompt = _RESUME_BASED_FIRST_PROMPT.format(
            role=role,
            difficulty=difficulty,
            resume_text=resume_text[:MAX_RESUME_CHARS],
        )
    elif mode == "job_description_based" and job_description_text:
        match = match_resume_job(resume_text or "", job_description_text)
        prompt = _JD_BASED_FIRST_PROMPT.format(
            role=role,
            difficulty=difficulty,
            resume_text=(resume_text or "(no resume provided)")[:MAX_RESUME_CHARS],
            jd_text=job_description_text[:MAX_JD_CHARS],
            match_score=match.get("match_score", "N/A"),
            matched_skills=", ".join(match.get("matched", [])) or "none detected",
            missing_skills=", ".join(match.get("missing", [])) or "none detected",
        )
    else:
        prompt = _GENERAL_FIRST_PROMPT.format(role=role, difficulty=difficulty)

    raw = _call_gemini(prompt)
    return _validate_question(_extract_json(raw))


def generate_next_question(
    mode: str,
    role: str,
    difficulty: str,
    resume_text: str | None,
    job_description_text: str | None,
    question_number: int,
    max_questions: int,
    transcript: str,
) -> dict:
    """
    Generates the next adaptive question, grounded in resume/JD context
    when available, always adapting to the transcript so far.
    """
    if mode == "resume_based" and resume_text:
        prompt = _RESUME_BASED_NEXT_PROMPT.format(
            role=role,
            difficulty=difficulty,
            resume_text=resume_text[:MAX_RESUME_CHARS],
            question_number=question_number,
            max_questions=max_questions,
            transcript=transcript,
        )
    elif mode == "job_description_based" and job_description_text:
        match = match_resume_job(resume_text or "", job_description_text)
        prompt = _JD_BASED_NEXT_PROMPT.format(
            role=role,
            difficulty=difficulty,
            resume_text=(resume_text or "(no resume provided)")[:MAX_RESUME_CHARS],
            jd_text=job_description_text[:MAX_JD_CHARS],
            match_score=match.get("match_score", "N/A"),
            matched_skills=", ".join(match.get("matched", [])) or "none detected",
            missing_skills=", ".join(match.get("missing", [])) or "none detected",
            question_number=question_number,
            max_questions=max_questions,
            transcript=transcript,
        )
    else:
        prompt = _GENERAL_NEXT_PROMPT.format(
            role=role,
            difficulty=difficulty,
            question_number=question_number,
            max_questions=max_questions,
            transcript=transcript,
        )

    raw = _call_gemini(prompt)
    return _validate_question(_extract_json(raw))