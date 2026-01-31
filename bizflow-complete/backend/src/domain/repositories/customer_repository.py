"""Customer Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities import Customer


class ICustomerRepository(ABC):
    """Customer repository interface"""

    @abstractmethod
    async def get_by_id(self, customer_id: str) -> Optional[Customer]:
        """Get customer by ID"""
        pass

    @abstractmethod
    async def get_by_phone(self, phone: str, business_id: str) -> Optional[Customer]:
        """Get customer by phone"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str, business_id: str) -> Optional[Customer]:
        """Get customer by email"""
        pass

    @abstractmethod
    async def create(self, customer: Customer) -> Customer:
        """Create new customer"""
        pass

    @abstractmethod
    async def update(self, customer: Customer) -> Customer:
        """Update customer"""
        pass

    @abstractmethod
    async def delete(self, customer_id: str) -> bool:
        """Delete customer"""
        pass

    @abstractmethod
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Customer]:
        """Get all customers by business"""
        pass

    @abstractmethod
    async def search(
        self, business_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> list[Customer]:
        """Search customers by name"""
        pass

    @abstractmethod
    async def get_top_debtors(
        self, business_id: str, limit: int = 10
    ) -> list[Customer]:
        """Get top customers by outstanding debt"""
        pass

    @abstractmethod
    async def get_top_spenders(
        self, business_id: str, limit: int = 10
    ) -> list[Customer]:
        """Get top customers by total purchases"""
        pass
