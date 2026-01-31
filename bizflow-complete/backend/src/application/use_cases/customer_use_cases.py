"""Customer Use Cases"""
from typing import List
from datetime import datetime
from ...domain.entities import Customer
from ...domain.repositories import ICustomerRepository


class CreateCustomerUseCase:
    """Create new customer use case"""

    def __init__(self, customer_repository: ICustomerRepository):
        self.customer_repo = customer_repository

    async def execute(
        self,
        business_id: str,
        name: str,
        phone: str = "",
        email: str = "",
        address: str = "",
    ) -> Customer:
        """Create new customer"""
        # Check if customer with same phone already exists
        if phone:
            existing = await self.customer_repo.get_by_phone(phone, business_id)
            if existing:
                raise ValueError(f"Customer with phone {phone} already exists")

        customer = Customer(
            business_id=business_id,
            name=name,
            phone=phone,
            email=email,
            address=address,
        )

        return await self.customer_repo.create(customer)


class UpdateCustomerUseCase:
    """Update customer use case"""

    def __init__(self, customer_repository: ICustomerRepository):
        self.customer_repo = customer_repository

    async def execute(
        self,
        customer_id: str,
        business_id: str,
        name: str,
        phone: str = "",
        email: str = "",
        address: str = "",
    ) -> Customer:
        """Update customer"""
        # Get existing customer
        existing = await self.customer_repo.get_by_id(customer_id)
        if not existing:
            raise ValueError(f"Customer with id {customer_id} not found")
        
        # Verify business_id matches
        if existing.business_id != business_id:
            raise ValueError(f"Customer does not belong to business {business_id}")

        # Update customer fields
        updated_customer = Customer(
            id=customer_id,
            business_id=business_id,
            name=name,
            phone=phone,
            email=email,
            address=address,
            outstanding_debt=existing.outstanding_debt,
            total_purchases=existing.total_purchases,
            total_transactions=existing.total_transactions,
            is_active=existing.is_active,
            created_at=existing.created_at,
            updated_at=datetime.now(),
        )

        return await self.customer_repo.update(updated_customer)


class GetCustomersUseCase:
    """Get customers use case"""

    def __init__(self, customer_repository: ICustomerRepository):
        self.customer_repo = customer_repository

    async def get_all(
        self,
        business_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Customer]:
        """Get all customers by business"""
        return await self.customer_repo.get_all_by_business(business_id, skip, limit)

    async def search(
        self,
        business_id: str,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Customer]:
        """Search customers by name"""
        return await self.customer_repo.search(business_id, query, skip, limit)

    async def get_top_debtors(
        self,
        business_id: str,
        limit: int = 10,
    ) -> List[Customer]:
        """Get top debtors"""
        return await self.customer_repo.get_top_debtors(business_id, limit)

    async def get_top_spenders(
        self,
        business_id: str,
        limit: int = 10,
    ) -> List[Customer]:
        """Get top spenders"""
        return await self.customer_repo.get_top_spenders(business_id, limit)
