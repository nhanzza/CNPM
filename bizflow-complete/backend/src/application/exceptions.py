"""Custom exceptions for the application"""
from typing import Any, Dict, Optional


class BizFlowException(Exception):
    """Base exception for BizFlow application"""
    
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        detail: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.detail = detail or {}
        super().__init__(self.message)


class ValidationException(BizFlowException):
    """Raised when validation fails"""
    
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            detail=detail
        )


class AuthenticationException(BizFlowException):
    """Raised when authentication fails"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=401
        )


class AuthorizationException(BizFlowException):
    """Raised when user is not authorized"""
    
    def __init__(self, message: str = "Not authorized to perform this action"):
        super().__init__(
            message=message,
            code="AUTHORIZATION_FAILED",
            status_code=403
        )


class ResourceNotFoundException(BizFlowException):
    """Raised when resource is not found"""
    
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} with id {resource_id} not found",
            code="RESOURCE_NOT_FOUND",
            status_code=404,
            detail={"resource_type": resource_type, "resource_id": resource_id}
        )


class ResourceAlreadyExistsException(BizFlowException):
    """Raised when resource already exists"""
    
    def __init__(self, resource_type: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=f"{resource_type} already exists",
            code="RESOURCE_ALREADY_EXISTS",
            status_code=409,
            detail=detail
        )


class DatabaseException(BizFlowException):
    """Raised when database operation fails"""
    
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="DATABASE_ERROR",
            status_code=500,
            detail=detail
        )


class InvalidCredentialsException(AuthenticationException):
    """Raised when credentials are invalid"""
    
    def __init__(self):
        super().__init__("Invalid email or password")


class TokenExpiredException(AuthenticationException):
    """Raised when token has expired"""
    
    def __init__(self):
        super().__init__("Token has expired")


class InvalidTokenException(AuthenticationException):
    """Raised when token is invalid"""
    
    def __init__(self):
        super().__init__("Invalid token")


class UserInactiveException(AuthenticationException):
    """Raised when user is inactive"""
    
    def __init__(self):
        super().__init__("User account is inactive")


class BusinessNotFoundException(ResourceNotFoundException):
    """Raised when business is not found"""
    
    def __init__(self, business_id: str):
        super().__init__("Business", business_id)


class UserNotFoundException(ResourceNotFoundException):
    """Raised when user is not found"""
    
    def __init__(self, user_id: str):
        super().__init__("User", user_id)


class ProductNotFoundException(ResourceNotFoundException):
    """Raised when product is not found"""
    
    def __init__(self, product_id: str):
        super().__init__("Product", product_id)


class OrderNotFoundException(ResourceNotFoundException):
    """Raised when order is not found"""
    
    def __init__(self, order_id: str):
        super().__init__("Order", order_id)


class CustomerNotFoundException(ResourceNotFoundException):
    """Raised when customer is not found"""
    
    def __init__(self, customer_id: str):
        super().__init__("Customer", customer_id)


class InsufficientInventoryException(BizFlowException):
    """Raised when product inventory is insufficient"""
    
    def __init__(self, product_id: str, required: int, available: int):
        super().__init__(
            message=f"Insufficient inventory for product {product_id}",
            code="INSUFFICIENT_INVENTORY",
            status_code=400,
            detail={
                "product_id": product_id,
                "required": required,
                "available": available
            }
        )


class InvalidOperationException(BizFlowException):
    """Raised when operation is invalid for current state"""
    
    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="INVALID_OPERATION",
            status_code=400,
            detail=detail
        )
