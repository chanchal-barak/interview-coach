import json

from workers.celery_app import celery

from services.gemini_service import (
    analyze_resume_with_ai,
    analyze_job_match_with_ai,
    generate_ai_feedback
)


@celery.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3
)
def resume_analysis_task(
    self,
    resume_text: str
):
    return analyze_resume_with_ai(
        resume_text
    )


@celery.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3
)
def detailed_feedback_task(
    self,
    resume_text: str
):
    return generate_ai_feedback(
        resume_text
    )


@celery.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3
)
def job_match_task(
    self,
    resume_text: str,
    jd_text: str
):
    return analyze_job_match_with_ai(
        resume_text,
        jd_text
    )