"""Debt Repository Implementation"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from ...domain.entities import Debt
from ...domain.repositories import IDebtRepository
from ..models import DebtModel


class DebtRepository(IDebtRepository):
    """Debt repository implementation"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, debt_id: str) -> Optional[Debt]:
        """Get debt by ID"""
        stmt = select(DebtModel).where(DebtModel.id == debt_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, debt: Debt) -> Debt:
        """Create new debt"""
        model = self._to_model(debt)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, debt: Debt) -> Debt:
        """Update debt"""
        model = await self.session.merge(self._to_model(debt))
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def delete(self, debt_id: str) -> bool:
        """Delete debt"""
        stmt = select(DebtModel).where(DebtModel.id == debt_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all_by_customer(self, customer_id: str) -> list[Debt]:
        """Get all debts by customer"""
        stmt = select(DebtModel).where(DebtModel.customer_id == customer_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_unpaid_by_customer(self, customer_id: str) -> list[Debt]:
        """Get unpaid debts by customer"""
        stmt = select(DebtModel).where(
            and_(DebtModel.customer_id == customer_id, DebtModel.is_paid == False)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Debt]:
        """Get all debts by business"""
        stmt = (
            select(DebtModel)
            .where(DebtModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_unpaid_by_business(self, business_id: str) -> list[Debt]:
        """Get all unpaid debts by business"""
        stmt = select(DebtModel).where(
            and_(DebtModel.business_id == business_id, DebtModel.is_paid == False)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_total_outstanding_debt(self, business_id: str) -> float:
        """Calculate total outstanding debt"""
        stmt = select(func.sum(DebtModel.remaining_debt)).where(
            and_(DebtModel.business_id == business_id, DebtModel.is_paid == False)
        )
        result = await self.session.execute(stmt)
        total = result.scalar()
        return float(total or 0)

    async def get_total_outstanding_by_customer(self, customer_id: str) -> float:
        """Calculate total outstanding debt for customer"""
        stmt = select(func.sum(DebtModel.remaining_debt)).where(
            and_(DebtModel.customer_id == customer_id, DebtModel.is_paid == False)
        )
        result = await self.session.execute(stmt)
        total = result.scalar()
        return float(total or 0)

    @staticmethod
    def _to_entity(model: DebtModel) -> Debt:
        """Convert model to entity"""
        return Debt(
            id=model.id,
            business_id=model.business_id,
            customer_id=model.customer_id,
            order_id=model.order_id or "",
            amount=model.amount,
            remaining_debt=model.remaining_debt,
            due_date=model.due_date,
            paid_date=model.paid_date,
            is_paid=model.is_paid,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: Debt) -> DebtModel:
        """Convert entity to model"""
        return DebtModel(
            id=entity.id,
            business_id=entity.business_id,
            customer_id=entity.customer_id,
            order_id=entity.order_id,
            amount=entity.amount,
            remaining_debt=entity.remaining_debt,
            due_date=entity.due_date,
            paid_date=entity.paid_date,
            is_paid=entity.is_paid,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
