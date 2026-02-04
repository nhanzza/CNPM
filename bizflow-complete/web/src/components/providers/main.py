from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.core.config import settings

# =========================
# App initialization
# =========================
app = FastAPI(
    title="BizFlow API",
    description="Backend service for BizFlow authentication and business management",
    version="1.0.0",
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Routers
# =========================
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

# =========================
# Health check
# =========================
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": "BizFlow API",
        "version": "1.0.0"
    }

# =========================
# Global exception handler
# =========================
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
        },
    )
