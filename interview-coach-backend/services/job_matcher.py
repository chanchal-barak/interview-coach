def match_resume_job(resume_text, jd_text):

    resume_text = resume_text.lower()
    jd_text = jd_text.lower()

    skills = [
        "python",
        "c++",
        "java",
        "docker",
        "aws",
        "kubernetes",
        "react",
        "sql",
        "machine learning"
    ]

    matched = []
    missing = []

    for skill in skills:
        if skill in jd_text:
            if skill in resume_text:
                matched.append(skill)
            else:
                missing.append(skill)

    score = 0

    if len(matched) + len(missing) > 0:
        score = int(
            len(matched)
            /
            (len(matched) + len(missing))
            * 100
        )

    return {
        "match_score": score,
        "matched": matched,
        "missing": missing
    }