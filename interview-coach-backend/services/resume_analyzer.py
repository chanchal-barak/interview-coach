def analyze_resume_text(text):

    text = text.lower()

    score = 5

    strengths = []
    weaknesses = []

    project_count = text.count("project")
    github_present = "github" in text

    if github_present:
        score += 1
        strengths.append("GitHub profile detected")

    if project_count >= 2:
        score += 1
        strengths.append("Multiple projects found")

    if "python" in text:
        score += 1
        strengths.append("Python")

    if "docker" not in text:
        weaknesses.append("Docker missing")

    return {
        "score": min(score, 10),
        "projects": project_count,
        "github": github_present,
        "strengths": strengths,
        "weaknesses": weaknesses
    }