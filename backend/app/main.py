# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import analyze, upload

def create_app() -> FastAPI:
    app = FastAPI(title="SkillsBuild Finance API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(upload.router, prefix="/api", tags=["upload"])
    app.include_router(analyze.router, prefix="/api", tags=["analyze"])

    @app.get("/health")
    def health():
        return {"ok": True}

    return app

app = create_app()