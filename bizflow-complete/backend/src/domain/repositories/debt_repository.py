"""Debt Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities import Debt


class IDebtRepository(ABC):
    """Debt repository interface"""

    @abstractmethod
    async def get_by_id(self, debt_id: str) -> Optional[Debt]:
        """Get debt by ID"""
        pass

    @abstractmethod
    async def create(self, debt: Debt) -> Debt:
        """Create new debt"""
        pass

    @abstractmethod
    async def update(self, debt: Debt) -> Debt:
        """Update debt"""
        pass

    @abstractmethod
    async def delete(self, debt_id: str) -> bool:
        """Delete debt"""
        pass

    @abstractmethod
    async def get_all_by_customer(self, customer_id: str) -> list[Debt]:
        """Get all debts by customer"""
        pass

    @abstractmethod
    async def get_unpaid_by_customer(self, customer_id: str) -> list[Debt]:
        """Get unpaid debts by customer"""
        pass

    @abstractmethod
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Debt]:
        """Get all debts by business"""
        pass

    @abstractmethod
    async def get_unpaid_by_business(self, business_id: str) -> list[Debt]:
        """Get all unpaid debts by business"""
        pass

    @abstractmethod
    async def get_total_outstanding_debt(self, business_id: str) -> float:
        """Calculate total outstanding debt"""
        pass

    @abstractmethod
    async def get_total_outstanding_by_customer(self, customer_id: str) -> float:
        """Calculate total outstanding debt for customer"""
        pass
