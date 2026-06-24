import hashlib


def generate_hash(text: str) -> str:
    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()


def resume_key(resume_text: str):
    return f"resume:{generate_hash(resume_text)}"


def feedback_key(resume_text: str):
    return f"feedback:{generate_hash(resume_text)}"


def job_match_key(
    resume_text: str,
    jd_text: str
):
    return (
        f"job_match:"
        f"{generate_hash(resume_text)}:"
        f"{generate_hash(jd_text)}"
    )