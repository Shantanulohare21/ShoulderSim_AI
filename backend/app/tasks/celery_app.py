"""
Celery Application Configuration
Async task processing for simulations and segmentation
"""

from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "shouldersim",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.simulation", "app.tasks.segmentation"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.simulation.*": {"queue": "simulation"},
    "app.tasks.segmentation.*": {"queue": "segmentation"},
}
