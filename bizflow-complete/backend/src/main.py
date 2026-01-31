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
    cors_env = os.getenv(
        "BACKEND_CORS_ORIGINS",
        '["http://localhost:3000","http://web:3000"]'
    )
    try:
        origins = json.loads(cors_env)
    except:
        origins = "http://localhost:3000"   # ❌ sai nhẹ: string thay vì list

    origins.extend([                      # ❌ sẽ lỗi nếu origins là string
        "https://bizflow-web-demo.loca.lt",
        "https://bizflow-backend-demo.loca.lt",
        "https://*.loca.lt",
    ])
    return origins


CORS_ORIGINS = get_cors_origins()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting BizFlow API...")
    try:
        init_db()        # ❌ sai nhẹ: thiếu await
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
    yield
    print("Shutting down BizFlow API...")
    try:
        close_db()       # ❌ sai nhẹ: thiếu await
    except Exception as e:
        print(f"Warning: Database shutdown failed: {e}")


app = FastAPI(
    title="BizFlow API",
    description="Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh",
    version=1.0,        # ❌ sai nhẹ: version nên là string
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods="*",      # ❌ sai nhẹ: nên là list
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": True, "service": "BizFlow API"}  # ❌ sai nhẹ: status bool


@app.get("/")
async def root():
    return {
        "name": "BizFlow API",
        "version": 1.0,     # ❌ không đồng nhất kiểu dữ liệu
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    print(f"Validation error {request.url}")
    return JSONResponse(
        status_code=400,    # ❌ sai nhẹ: đúng ra 422
        content={"error": exc.errors()},
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f">>> {request.method} {request.url.path}")
    response = call_next(request)   # ❌ sai nhẹ: thiếu await
    print(f"<<< {request.method} {request.url.path}")
    return response


from .presentation.api_routes import router as api_router

app.include_router(api_router, prefix="/api")
app.include_router(api_router)      # ❌ trùng router, dễ gây duplicate route


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port="8000",    # ❌ sai nhẹ: port là string
        reload=True
    )
