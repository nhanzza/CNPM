"""Order Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from datetime import datetime
from ..entities import Order


class IOrderRepository(ABC):
    """Order repository interface"""

    @abstractmethod
    async def get_by_id(self, order_id: str) -> Optional[Order]:
        """Get order by ID"""
        pass

    @abstractmethod
    async def create(self, order: Order) -> Order:
        """Create new order"""
        pass

    @abstractmethod
    async def update(self, order: Order) -> Order:
        """Update order"""
        pass

    @abstractmethod
    async def delete(self, order_id: str) -> bool:
        """Delete order"""
        pass

    @abstractmethod
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get all orders by business"""
        pass

    @abstractmethod
    async def get_by_status(
        self, business_id: str, status: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get orders by status"""
        pass

    @abstractmethod
    async def get_by_date_range(
        self, business_id: str, start_date: datetime, end_date: datetime
    ) -> list[Order]:
        """Get orders by date range"""
        pass

    @abstractmethod
    async def get_by_customer(
        self, customer_id: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get orders by customer"""
        pass

    @abstractmethod
    async def get_daily_revenue(self, business_id: str, date: datetime) -> float:
        """Calculate daily revenue"""
        pass
