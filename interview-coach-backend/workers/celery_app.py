from celery import Celery
from config.settings import (
    CELERY_BROKER_URL,
    CELERY_RESULT_BACKEND
)

celery = Celery(
    "interview_coach",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
)

celery.autodiscover_tasks(
    ["workers"]
)