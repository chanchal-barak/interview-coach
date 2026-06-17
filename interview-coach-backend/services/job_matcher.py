import re

KNOWN_SKILLS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "ruby", "scala", "r", "matlab", "bash", "shell",
    # Web
    "react", "angular", "vue", "node", "express", "next.js", "html", "css",
    "rest", "graphql", "fastapi", "django", "flask", "spring",
    # Data / ML
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "data analysis", "sql",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
    "ci/cd", "github actions", "jenkins", "linux", "git",
    # Databases
    "mysql", "postgresql", "mongodb", "redis", "dynamodb", "sqlite",
    "firebase", "elasticsearch",
    # Mobile
    "android", "ios", "react native", "flutter",
    # Other
    "agile", "scrum", "microservices", "api", "system design",
    "object oriented", "data structures", "algorithms",
]


def _extract_skills_from_text(text: str, skill_list: list[str]) -> set[str]:
    """
    Find which skills from skill_list appear in text using word-boundary matching.
    Returns a set of matched skill strings.
    """
    t = text.lower()
    found = set()
    for skill in skill_list:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, t):
            found.add(skill)
    return found


def match_resume_job(resume_text: str, jd_text: str) -> dict:
    """
    Extracts skills dynamically from the JD (not a hardcoded list),
    then checks which of those the resume covers.

    Returns:
      match_score   - int 0-100
      matched       - skills in both JD and resume
      missing       - skills in JD but not in resume
    """

    required_skills = _extract_skills_from_text(jd_text, KNOWN_SKILLS)

    if not required_skills:
        return {
            "match_score": 0,
            "matched": [],
            "missing": [],
            "note": "No recognizable technical skills found in job description."
        }

    resume_skills = _extract_skills_from_text(resume_text, list(required_skills))

    matched = sorted(list(resume_skills))
    missing = sorted(list(required_skills - resume_skills))

    score = int(len(matched) / len(required_skills) * 100)

    return {
        "match_score": score,
        "matched": matched,
        "missing": missing,
    }