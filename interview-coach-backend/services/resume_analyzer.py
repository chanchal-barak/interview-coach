import re
def analyze_resume_text(text: str) -> dict:
    """
    Heuristic resume analysis. Fast, no API cost.
    Checks 20+ signals across skills, projects, education, experience.
    Returns a structured dict the frontend can render directly.
    """
    t = text.lower()

    strengths = []
    weaknesses = []
    recommendations = []
    score = 0
    max_score = 0

    languages = {
        "python": 2, "java": 2, "c++": 2, "javascript": 1,
        "typescript": 1, "go": 2, "rust": 2, "kotlin": 1,
        "swift": 1, "c#": 1
    }
    found_langs = [lang for lang in languages if re.search(r'\b' + re.escape(lang) + r'\b', t)]
    lang_score = min(sum(languages[l] for l in found_langs), 4)
    max_score += 4
    score += lang_score

    if found_langs:
        strengths.append(f"Programming languages: {', '.join(found_langs[:5]).title()}")
    else:
        weaknesses.append("No programming languages detected")
        recommendations.append("Explicitly list programming languages in a Skills section")

    project_section = re.search(
        r'(projects?|personal projects?|academic projects?)(.*?)(experience|education|skills|$)',
        t, re.DOTALL
    )
    project_count = 0
    if project_section:
        project_block = project_section.group(2)
        project_count = len(re.findall(r'\n\s*[a-z].*(?:app|system|tool|bot|website|platform|api|engine|model|analyzer)', project_block))
        if project_count == 0:
            project_count = len(re.findall(r'[•\-\*]\s+\w', project_block))
            project_count = min(project_count // 3, 5)  # rough estimate

    max_score += 3
    if project_count >= 3:
        score += 3
        strengths.append(f"Strong projects section with {project_count}+ projects")
    elif project_count >= 1:
        score += 2
        strengths.append("Projects section present")
        recommendations.append("Add 2-3 more projects with tech stack and impact metrics")
    else:
        weaknesses.append("No projects section detected or projects section is empty")
        recommendations.append("Add 2-3 personal/academic projects with GitHub links and measurable outcomes")

    max_score += 1
    github_present = bool(re.search(r'github\.com/\S+', t))
    if github_present:
        score += 1
        strengths.append("GitHub profile linked")
    else:
        weaknesses.append("No GitHub profile linked")
        recommendations.append("Add your GitHub URL to your resume header")

    cloud_tools = ["aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd", "github actions"]
    found_cloud = [tool for tool in cloud_tools if re.search(r'\b' + re.escape(tool) + r'\b', t)]
    max_score += 2
    if len(found_cloud) >= 2:
        score += 2
        strengths.append(f"Cloud/DevOps skills: {', '.join(found_cloud[:3]).upper()}")
    elif len(found_cloud) == 1:
        score += 1
        recommendations.append(f"Expand cloud skills — found only: {found_cloud[0].upper()}")
    else:
        weaknesses.append("No cloud or DevOps tools detected")
        recommendations.append("Learn Docker basics and deploy a project to AWS or GCP")

    databases = ["sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "dynamodb", "firebase"]
    found_db = [db for db in databases if re.search(r'\b' + re.escape(db) + r'\b', t)]
    max_score += 1
    if found_db:
        score += 1
        strengths.append(f"Database experience: {', '.join(found_db[:3]).upper()}")
    else:
        weaknesses.append("No database skills detected")
        recommendations.append("Add SQL or NoSQL database experience to your projects")

    frameworks = ["react", "node", "django", "flask", "fastapi", "spring", "express", "tensorflow", "pytorch", "scikit"]
    found_fw = [fw for fw in frameworks if re.search(r'\b' + re.escape(fw) + r'\b', t)]
    max_score += 2
    if len(found_fw) >= 2:
        score += 2
        strengths.append(f"Frameworks: {', '.join(found_fw[:4]).title()}")
    elif len(found_fw) == 1:
        score += 1
        recommendations.append("Add more frameworks/libraries to show versatility")

    max_score += 2
    has_degree = bool(re.search(r'\b(b\.?s\.?|b\.?tech|bachelor|b\.?e\.?|m\.?s\.?|master|phd|computer science|information technology|software engineering)\b', t))
    has_gpa = bool(re.search(r'gpa\s*:?\s*[0-9]\.[0-9]', t))

    if has_degree:
        score += 1
        if has_gpa:
            score += 1
            gpa_match = re.search(r'gpa\s*:?\s*([0-9]\.[0-9]+)', t)
            if gpa_match:
                gpa_val = float(gpa_match.group(1))
                if gpa_val >= 3.5:
                    strengths.append(f"Strong GPA: {gpa_val:.2f}")
                else:
                    strengths.append("GPA listed on resume")
        else:
            recommendations.append("Include your GPA if it's 3.0 or above")
    else:
        weaknesses.append("No degree or education section detected")

    max_score += 2
    has_internship = bool(re.search(r'\b(intern|internship|software engineer|developer|sde)\b', t))
    has_experience_section = bool(re.search(r'\b(experience|work history|employment)\b', t))

    if has_internship:
        score += 2
        strengths.append("Prior internship or work experience present")
    elif has_experience_section:
        score += 1
        recommendations.append("Highlight internship titles explicitly to pass ATS filters")

    max_score += 1
    has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
    has_linkedin = bool(re.search(r'linkedin\.com/in/\S+', t))

    if has_email and has_linkedin:
        score += 1
        strengths.append("Contact info complete (email + LinkedIn)")
    elif has_email:
        recommendations.append("Add your LinkedIn profile URL to your resume header")
    else:
        weaknesses.append("No email address found")

    max_score += 1
    has_metrics = bool(re.search(r'\b(\d+%|\d+x|reduced|improved|increased|built|developed|led|designed|optimized)\b', t))
    if has_metrics:
        score += 1
        strengths.append("Bullets use action verbs and/or metrics")
    else:
        weaknesses.append("Bullet points lack measurable impact (numbers, percentages)")
        recommendations.append("Rewrite bullets with STAR format: 'Built X using Y, resulting in Z% improvement'")
    final_score = round((score / max_score) * 10, 1) if max_score > 0 else 0.0

    return {
        "score": min(final_score, 10.0),
        "raw_score": score,
        "max_score": max_score,
        "projects": project_count,
        "github": github_present,
        "languages": found_langs,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
    }