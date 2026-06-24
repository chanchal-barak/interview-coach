import hashlib
import time
import os
import json
from cache.redis_client import redis_client
import re
from google import genai
from dotenv import load_dotenv


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.5-flash"


from google.genai.errors import ClientError


def _call_gemini(prompt: str) -> str:

    cache_key = (
        "gemini:"
        + hashlib.sha256(
            prompt.encode("utf-8")
        ).hexdigest()
    )

    # Check Redis cache first
    try:
        cached = redis_client.get(cache_key)
        if cached:
            print("✅ Cache hit")
            return cached
    except Exception as e:
        print(f"Redis GET failed: {e}")

    last_error = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )

            if response and response.text:

                try:
                    redis_client.setex(
                        cache_key,
                        86400,  # 24 hours
                        response.text
                    )
                except Exception as e:
                    print(f"Redis SET failed: {e}")

                return response.text

            raise ValueError("Gemini returned an empty response.")

        except ClientError as e:
            last_error = e

            error_text = str(e)

            print("\n===== GEMINI ERROR =====")
            print(error_text)
            print("========================\n")

            # Quota exhausted
            if (
                "RESOURCE_EXHAUSTED" in error_text
                or "429" in error_text
            ):
                raise ValueError(
                    "Gemini quota exceeded. Please wait for quota reset or use a different API key."
                )

            if attempt < 2:
                wait_time = 2 ** attempt
                print(f"Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue

        except Exception as e:
            last_error = e

            print(f"Unexpected Gemini error: {e}")

            if attempt < 2:
                wait_time = 2 ** attempt
                print(f"Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue

    raise ValueError(
        f"Gemini failed after 3 attempts: {last_error}"
    )

def _extract_json(raw: str) -> dict:
    """
    Strip markdown code fences if present, then parse JSON.
    Gemini sometimes wraps output in ```json ... ``` even when told not to.
    """
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Gemini did not return valid JSON.\nRaw output:\n{raw}\nError: {e}"
        )

RESUME_ANALYSIS_PROMPT = """
You are an expert technical recruiter reviewing a resume for software engineering internships at companies like Google, Microsoft, Amazon, and Meta.

Analyze the resume below and respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.

The JSON must follow this exact structure:
{{
  "readiness_score": <integer 0-100>,
  "section_scores": {{
    "education": <integer 0-100>,
    "experience": <integer 0-100>,
    "skills": <integer 0-100>,
    "projects": <integer 0-100>,
    "formatting": <integer 0-100>
  }},
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "missing_skills": [<string>, ...],
  "recommendations": [<string>, ...],
  "summary": "<one paragraph honest assessment>"
}}

Rules:
- Be specific and actionable, not generic.
- strengths, weaknesses, missing_skills, recommendations: each list must have 3-6 items.
- readiness_score: 0 = completely unprepared, 100 = ready to interview at FAANG today.
- Do NOT wrap in markdown. Return raw JSON only.

Resume:
{resume_text}
"""


def analyze_resume_with_ai(resume_text: str) -> dict:
    """
    Sends resume text to Gemini, returns structured analysis dict.
    Raises ValueError if Gemini fails or returns malformed output.
    """
    prompt = RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text)
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "readiness_score", "section_scores", "strengths",
        "weaknesses", "missing_skills", "recommendations", "summary"
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini response missing required key: '{key}'")

    return result

JOB_MATCH_PROMPT = """
You are a technical recruiter comparing a candidate's resume against a job description for a software engineering internship.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.

The JSON must follow this exact structure:
{{
  "match_score": <integer 0-100>,
  "matched_skills": [<string>, ...],
  "missing_skills": [<string>, ...],
  "skill_gap_analysis": "<2-3 sentence paragraph explaining the gap>",
  "recommendations": [<string>, ...],
  "role_fit_summary": "<one paragraph honest assessment of candidate fit for this specific role>"
}}

Rules:
- matched_skills: skills the candidate HAS that the JD requires.
- missing_skills: skills the JD requires that the candidate LACKS.
- match_score: 0 = completely unqualified, 100 = perfect match.
- recommendations: concrete steps (courses, projects, certifications) to close the gap.
- Each list must have at least 2 items and no more than 10.
- Do NOT wrap in markdown. Return raw JSON only.

Resume:
{resume_text}

Job Description:
{jd_text}
"""


def analyze_job_match_with_ai(resume_text: str, jd_text: str) -> dict:
    """
    Sends resume + JD to Gemini, returns structured match analysis.
    """
    prompt = JOB_MATCH_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text
    )
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "match_score", "matched_skills", "missing_skills",
        "skill_gap_analysis", "recommendations", "role_fit_summary"
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini response missing required key: '{key}'")

    return result

FEEDBACK_PROMPT = """
You are a senior software engineer and career coach giving detailed, honest feedback on a resume for a software engineering internship applicant.

Respond with ONLY a valid JSON object — no explanation, no markdown, no code fences.

The JSON must follow this exact structure:
{{
  "overall_feedback": "<2-3 paragraph honest overall assessment>",
  "section_feedback": {{
    "education": "<specific feedback on education section>",
    "experience": "<specific feedback on work experience or internships>",
    "projects": "<specific feedback on projects — depth, impact, tech stack>",
    "skills": "<specific feedback on skills section — missing tech, outdated tools>",
    "formatting": "<specific feedback on resume layout, clarity, length>"
  }},
  "bullet_rewrites": [
    {{
      "original": "<exact bullet point from their resume>",
      "improved": "<rewritten version with stronger impact and metrics>"
    }}
  ],
  "interview_readiness": "<one sentence verdict: are they ready to apply now, or what must change first>"
}}

Rules:
- bullet_rewrites: pick the 2-3 weakest bullets and rewrite them with STAR format + metrics.
- Be direct. Don't soften criticism. This person needs honest feedback to improve.
- Do NOT wrap in markdown. Return raw JSON only.

Resume:
{resume_text}
"""


def generate_ai_feedback(resume_text: str) -> dict:
    """
    Generates detailed per-section resume feedback with bullet rewrites.
    """
    prompt = FEEDBACK_PROMPT.format(resume_text=resume_text)
    raw = _call_gemini(prompt)
    result = _extract_json(raw)

    required = [
        "overall_feedback", "section_feedback",
        "bullet_rewrites", "interview_readiness"
    ]
    for key in required:
        if key not in result:
            raise ValueError(f"Gemini response missing required key: '{key}'")

    return result

