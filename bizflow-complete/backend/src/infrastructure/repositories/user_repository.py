"""User Repository Implementation"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...domain.entities import User, UserRole
from ...domain.repositories import IUserRepository
from ..models import UserModel


class UserRepository(IUserRepository):
    """User repository implementation"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        stmt = select(UserModel).where(UserModel.username == username)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, user: User) -> User:
        """Create new user"""
        model = self._to_model(user)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, user: User) -> User:
        """Update user"""
        model = await self.session.merge(self._to_model(user))
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def delete(self, user_id: str) -> bool:
        """Delete user"""
        stmt = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all(self, business_id: str, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users by business"""
        stmt = (
            select(UserModel)
            .where(UserModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        """Convert model to entity"""
        return User(
            id=model.id,
            username=model.username,
            email=model.email,
            password_hash=model.password_hash,
            full_name=model.full_name or "",
            role=UserRole(model.role),
            business_id=model.business_id or "",
            is_active=model.is_active,
            last_login=model.last_login,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: User) -> UserModel:
        """Convert entity to model"""
        return UserModel(
            id=entity.id,
            username=entity.username,
            email=entity.email,
            password_hash=entity.password_hash,
            full_name=entity.full_name,
            role=entity.role.value,
            business_id=entity.business_id,
            is_active=entity.is_active,
            last_login=entity.last_login,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
