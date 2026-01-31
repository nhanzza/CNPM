"""Error handlers for FastAPI exceptions"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Dict, Any

from ..application.exceptions import BizFlowException


def register_error_handlers(app: FastAPI) -> None:
    """Register all error handlers for the FastAPI app"""
    
    @app.exception_handler(BizFlowException)
    async def bizflow_exception_handler(request: Request, exc: BizFlowException) -> JSONResponse:
        """Handle BizFlow custom exceptions"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "detail": exc.detail
                },
                "path": str(request.url.path),
                "method": request.method
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """Handle FastAPI validation errors"""
        errors = []
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(loc) for loc in error["loc"][1:]),
                "message": error["msg"],
                "type": error["type"]
            })
        
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "detail": {"errors": errors}
                },
                "path": str(request.url.path),
                "method": request.method
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Handle unexpected exceptions"""
        import traceback
        
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "Internal server error",
                    "detail": str(exc) if str(exc) else "Unknown error"
                },
                "path": str(request.url.path),
                "method": request.method
            }
        )
