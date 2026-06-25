"""
ShoulderSim AI - Main FastAPI Application
Production-grade backend for biomechanical shoulder simulation
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import logging
import os
from prometheus_client import make_asgi_app
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
if sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "development"),
):
    logger.info("Sentry initialized for error tracking")

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting ShoulderSim AI backend...")
    # Startup: Initialize database connections, Redis, etc.
    yield
    # Shutdown: Cleanup resources
    logger.info("Shutting down ShoulderSim AI backend...")

# Create FastAPI application
app = FastAPI(
    title="ShoulderSim AI API",
    description="AI-powered biomechanical shoulder simulation platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    return {
        "status": "healthy",
        "service": "shouldersim-ai-backend",
        "version": "1.0.0"
    }

# API Routes (to be implemented)
@app.get("/api/v1/status")
async def api_status():
    """API status endpoint"""
    return {
        "status": "operational",
        "modules": {
            "dicom_ingestion": "active",
            "segmentation": "pending",
            "simulation": "active",
            "ai_models": "pending",
            "sandbox": "pending"
        }
    }

# Include routers
from app.api.v1 import scans, simulations, regulatory, clinical
app.include_router(scans.router, prefix="/api/v1/scans", tags=["scans"])
app.include_router(simulations.router, prefix="/api/v1/simulations", tags=["simulations"])
app.include_router(regulatory.router, prefix="/api/v1/regulatory", tags=["regulatory"])
app.include_router(clinical.router, prefix="/api/v1/clinical", tags=["clinical"])

# Additional routers to be added as modules are implemented
# from app.api.v1 import ai, sandbox, surgical_plans, auth
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
# app.include_router(sandbox.router, prefix="/api/v1/sandbox", tags=["sandbox"])
# app.include_router(surgical_plans.router, prefix="/api/v1/plans", tags=["surgical-plans"])
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])

if __name__ == "__main__":
    import uvicorn
    import os
    
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
        workers=int(os.getenv("WORKERS", 1))
    )
