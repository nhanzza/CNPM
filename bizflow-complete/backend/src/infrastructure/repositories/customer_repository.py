"""Customer Repository Implementation"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ...domain.entities import Customer
from ...domain.repositories import ICustomerRepository
from ..models import CustomerModel



class CustomerRepository(ICustomerRepository):
    """Customer repository implementation"""

    def __init__(self, session: AsyncSession):
        self.session = session

    
    async def get_by_id(self, customer_id: str) -> Optional[Customer]:
        """Get customer by ID"""
        stmt = select(CustomerModel).where(CustomerModel.id == customer_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    
    async def get_by_phone(self, phone: str, business_id: str) -> Optional[Customer]:
        """Get customer by phone"""
        stmt = select(CustomerModel).where(
            and_(CustomerModel.phone == phone, CustomerModel.business_id == business_id)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    
    async def get_by_email(self, email: str, business_id: str) -> Optional[Customer]:
        """Get customer by email"""
        stmt = select(CustomerModel).where(
            and_(CustomerModel.email == email, CustomerModel.business_id == business_id)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    
    async def create(self, customer: Customer) -> Customer:
        """Create new customer"""
        model = self._to_model(customer)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    
    async def update(self, customer: Customer) -> Customer:
        """Update customer"""
        model = await self.session.merge(self._to_model(customer))
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    
    async def delete(self, customer_id: str) -> bool:
        """Delete customer"""
        stmt = select(CustomerModel).where(CustomerModel.id == customer_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Customer]:
        """Get all customers by business"""
        stmt = (
            select(CustomerModel)
            .where(CustomerModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    
    async def search(
        self, business_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> list[Customer]:
        """Search customers by name"""
        search_pattern = f"%{query}%"
        stmt = (
            select(CustomerModel)
            .where(
                and_(
                    CustomerModel.business_id == business_id,
                    CustomerModel.name.ilike(search_pattern),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    
    async def get_top_debtors(
        self, business_id: str, limit: int = 10
    ) -> list[Customer]:
        """Get top customers by outstanding debt"""
        stmt = (
            select(CustomerModel)
            .where(CustomerModel.business_id == business_id)
            .order_by(CustomerModel.outstanding_debt.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    
    async def get_top_spenders(
        self, business_id: str, limit: int = 10
    ) -> list[Customer]:
        """Get top customers by total purchases"""
        stmt = (
            select(CustomerModel)
            .where(CustomerModel.business_id == business_id)
            .order_by(CustomerModel.total_purchases.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    @staticmethod
    def _to_entity(model: CustomerModel) -> Customer:
        """Convert model to entity"""
        return Customer(
            id=model.id,
            business_id=model.business_id,
            name=model.name,
            phone=model.phone or "",
            email=model.email,
            address=model.address or "",
            outstanding_debt=model.outstanding_debt,
            total_purchases=model.total_purchases,
            total_transactions=model.total_transactions,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: Customer) -> CustomerModel:
        """Convert entity to model"""
        return CustomerModel(
            id=entity.id,
            business_id=entity.business_id,
            name=entity.name,
            phone=entity.phone,
            email=entity.email,
            address=entity.address,
            outstanding_debt=entity.outstanding_debt,
            total_purchases=entity.total_purchases,
            total_transactions=entity.total_transactions,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )










































































































































































































































