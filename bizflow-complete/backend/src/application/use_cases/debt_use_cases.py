"""Debt Use Cases"""
from datetime import datetime
from typing import List
from ...domain.entities import Debt
from ...domain.repositories import IDebtRepository, ICustomerRepository


class RecordDebtUseCase:
    """Record customer debt use case"""

    def __init__(
        self,
        debt_repository: IDebtRepository,
        customer_repository: ICustomerRepository,
    ):
        self.debt_repo = debt_repository
        self.customer_repo = customer_repository

    async def execute(
        self,
        business_id: str,
        customer_id: str,
        order_id: str,
        amount: float,
        due_date: datetime = None,
    ) -> Debt:
        """Record customer debt"""
        # Validate customer exists
        customer = await self.customer_repo.get_by_id(customer_id)
        if not customer:
            raise ValueError(f"Customer not found: {customer_id}")

        # Create debt
        debt = Debt(
            business_id=business_id,
            customer_id=customer_id,
            order_id=order_id,
            amount=amount,
            remaining_debt=amount,
            due_date=due_date,
        )

        # Update customer outstanding debt
        customer.outstanding_debt += amount
        await self.customer_repo.update(customer)

        return await self.debt_repo.create(debt)


class PayDebtUseCase:
    """Pay customer debt use case"""

    def __init__(
        self,
        debt_repository: IDebtRepository,
        customer_repository: ICustomerRepository,
    ):
        self.debt_repo = debt_repository
        self.customer_repo = customer_repository

    async def execute(
        self,
        debt_id: str,
        payment_amount: float,
    ) -> Debt:
        """Pay debt"""
        # Get debt
        debt = await self.debt_repo.get_by_id(debt_id)
        if not debt:
            raise ValueError(f"Debt not found: {debt_id}")

        # Get customer
        customer = await self.customer_repo.get_by_id(debt.customer_id)
        if not customer:
            raise ValueError(f"Customer not found: {debt.customer_id}")

        # Process payment
        if payment_amount > 0:
            debt.remaining_debt -= payment_amount
            
            if debt.remaining_debt <= 0:
                debt.remaining_debt = 0
                debt.is_paid = True
                debt.paid_date = datetime.now()
            
            # Update customer outstanding debt
            customer.outstanding_debt -= payment_amount
            await self.customer_repo.update(customer)

        debt.updated_at = datetime.now()
        return await self.debt_repo.update(debt)


class GetDebtsUseCase:
    """Get debts use case"""

    def __init__(self, debt_repository: IDebtRepository):
        self.debt_repo = debt_repository

    async def get_all_by_business(
        self,
        business_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Debt]:
        """Get all debts by business"""
        return await self.debt_repo.get_all_by_business(business_id, skip, limit)

    async def get_unpaid_by_business(self, business_id: str) -> List[Debt]:
        """Get unpaid debts by business"""
        return await self.debt_repo.get_unpaid_by_business(business_id)

    async def get_by_customer(self, customer_id: str) -> List[Debt]:
        """Get debts by customer"""
        return await self.debt_repo.get_all_by_customer(customer_id)

    async def get_total_outstanding_debt(self, business_id: str) -> float:
        """Get total outstanding debt"""
        return await self.debt_repo.get_total_outstanding_debt(business_id)
