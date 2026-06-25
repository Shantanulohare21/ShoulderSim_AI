"""
Application Configuration
Environment-based configuration management
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "ShoulderSim AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/shouldersim"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CELERY_DB: int = 1
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Storage (S3/MinIO)
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "shouldersim-dicom"
    S3_USE_SSL: bool = False
    
    # AI/ML
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MODEL_REGISTRY_PATH: str = "./models"
    
    # Monitoring
    SENTRY_DSN: str = ""
    PROMETHEUS_ENABLED: bool = True
    
    # DICOM Processing
    MONAI_CACHE_DIR: str = "./cache/monai"
    SEGMENTATION_MODEL_PATH: str = "./models/segmentation"
    
    # Simulation
    FENICSX_MESH_DIR: str = "./cache/meshes"
    SIMULATION_TIMEOUT_SECONDS: int = 3600
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
