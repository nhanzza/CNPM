"""User Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities import User


class IUserRepository(ABC):
    """User repository interface"""

    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        """Create new user"""
        pass

    @abstractmethod
    async def update(self, user: User) -> User:
        """Update user"""
        pass

    @abstractmethod
    async def delete(self, user_id: str) -> bool:
        """Delete user"""
        pass

    @abstractmethod
    async def get_all(self, business_id: str, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users by business"""
        pass
