"""Dependency injection and FastAPI dependencies"""
from typing import Optional, Generator
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta
import jwt

from ..config.settings import settings
from ..application.exceptions import (
    InvalidTokenException,
    TokenExpiredException,
    AuthenticationException
)


class TokenPayload:
    """Token payload model"""
    
    def __init__(self, user_id: str, username: str, email: str, role: str):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.role = role


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def verify_token(token: str) -> TokenPayload:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        user_id: str = payload.get("user_id")
        username: str = payload.get("username")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if not all([user_id, username, email, role]):
            raise InvalidTokenException()
        
        return TokenPayload(
            user_id=user_id,
            username=username,
            email=email,
            role=role
        )
    
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException()
    except jwt.InvalidTokenError:
        raise InvalidTokenException()


async def get_current_user(
    token: str = Depends(lambda: None),
) -> Optional[TokenPayload]:
    """Get current authenticated user from token"""
    if not token:
        return None
    
    return verify_token(token)


async def get_current_user_required(
    token: Optional[str] = None,
) -> TokenPayload:
    """Get current authenticated user (required)"""
    if not token:
        raise AuthenticationException("Missing authentication token")
    
    return verify_token(token)


def require_role(*roles: str):
    """Dependency to require specific roles"""
    async def check_role(current_user: TokenPayload = Depends(get_current_user_required)) -> TokenPayload:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized for this operation"
            )
        return current_user
    
    return check_role


def is_owner(current_user: TokenPayload = Depends(get_current_user_required)) -> TokenPayload:
    """Check if user is owner"""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only business owners can perform this action"
        )
    return current_user


def is_admin(current_user: TokenPayload = Depends(get_current_user_required)) -> TokenPayload:
    """Check if user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return current_user
