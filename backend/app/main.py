from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes.api import router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI Service Orchestrator — Google Antigravity + Multi-Agent Platform",
)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"] if settings.use_mock_gcp else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "mock_gcp": settings.use_mock_gcp,
        "orchestrator": "Google Antigravity",
    }


@app.get("/")
async def root():
    return {
        "message": "ServiceFlow AI Orchestration API",
        "docs": "/docs",
        "orchestrate": "POST /api/v1/orchestrate",
    }
