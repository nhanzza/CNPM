"""User Use Cases"""
import secrets
from typing import Optional, Tuple
from datetime import datetime, timedelta
import hashlib
from ...domain.entities import User, UserRole
from ...domain.repositories import IUserRepository


class LoginUseCase:
    """User login use case"""

    def __init__(self, user_repository: IUserRepository):
        self.user_repo = user_repository

    async def execute(self, email: str, password: str) -> Tuple[User, str]:
        """Login user and return user + token"""
        user = await self.user_repo.get_by_email(email)
        if not user:
            # For development/testing: create user if it doesn't exist with hardcoded credentials
            if email == "admin@bizflow.com" and password == "Admin@123":
                from datetime import datetime as dt
                user = User(
                    id=secrets.token_urlsafe(16),
                    email=email,
                    password_hash=self._hash_password(password),
                    full_name="Admin User",
                    username="admin",
                    business_id=secrets.token_urlsafe(16),
                    role=UserRole.OWNER,
                    is_active=True,
                    created_at=dt.now(),
                    updated_at=dt.now()
                )
                await self.user_repo.create(user)
            else:
                raise ValueError("Invalid credentials")

        # Verify password (simple hash comparison)
        password_hash = self._hash_password(password)
        if user.password_hash != password_hash:
            raise ValueError("Invalid credentials")

        # Generate token
        token = self._generate_token()

        # Update last login
        user.last_login = datetime.now()
        await self.user_repo.update(user)

        return user, token

    @staticmethod
    def _hash_password(password: str) -> str:
        """Simple password hashing"""
        return hashlib.sha256(password.encode()).hexdigest()

    @staticmethod
    def _generate_token() -> str:
        """Generate token"""
        return secrets.token_urlsafe(32)


class RegisterUseCase:
    """User registration use case"""

    def __init__(self, user_repository: IUserRepository):
        self.user_repo = user_repository

    async def execute(
        self,
        email: str,
        password: str,
        full_name: str,
        business_id: str,
        username: str = "",
    ) -> User:
        """Register new user"""
        # Check if user already exists
        existing_email = await self.user_repo.get_by_email(email)
        if existing_email:
            raise ValueError("Email already registered")

        if username:
            existing_username = await self.user_repo.get_by_username(username)
            if existing_username:
                raise ValueError("Username already exists")

        # Create user
        user = User(
            email=email,
            password_hash=self._hash_password(password),
            full_name=full_name,
            business_id=business_id,
            username=username or email.split("@")[0],
            role=UserRole.EMPLOYEE,
        )

        return await self.user_repo.create(user)

    @staticmethod
    def _hash_password(password: str) -> str:
        """Simple password hashing"""
        return hashlib.sha256(password.encode()).hexdigest()
