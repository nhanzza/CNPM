"""FastAPI application main entry point"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import json
import traceback

from .infrastructure.database import init_db, close_db


def get_cors_origins():
    """Parse CORS origins from environment variable"""
    cors_env = os.getenv(
        "BACKEND_CORS_ORIGINS",
        '["http://localhost:3000","http://web:3000"]'
    )
    try:
        origins = json.loads(cors_env)
        if not isinstance(origins, list):
            origins = []
    except Exception:
        origins = ["http://localhost:3000", "http://web:3000"]

    origins.extend([
        "https://bizflow-web-demo.loca.lt",
        "https://bizflow-backend-demo.loca.lt",
        "https://*.loca.lt",
        "https://*.ngrok-free.app",
        "https://*.cloudflare.com",
    ])
    return origins


CORS_ORIGINS = get_cors_origins()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("Starting BizFlow API...")
    try:
        await init_db()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Continuing with app startup anyway...")
    yield
    print("Shutting down BizFlow API...")
    try:
        await close_db()
    except Exception as e:
        print(f"Warning: Database shutdown failed: {e}")


app = FastAPI(
    title="BizFlow API",
    description="Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BizFlow API"
    }


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "BizFlow API",
        "version": "1.0.0",
        "description": "Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    """Handle validation errors"""
    print(f"Validation error on {request.method} {request.url.path}")
    print(exc.errors())
    traceback.print_exc()
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f">>> Incoming {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        print(f"<<< Response {request.method} {request.url.path} -> {response.status_code}")
        return response
    except Exception as e:
        print(f"!!! Error on {request.method} {request.url.path}: {e}")
        raise


from .presentation.api_routes import router as api_router

app.include_router(api_router, prefix="/api", tags=["BizFlow API"])
app.include_router(api_router, tags=["BizFlow API - Root"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
