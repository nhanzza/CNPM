"""Inventory Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities import Inventory


class IInventoryRepository(ABC):
    """Inventory repository interface"""

    @abstractmethod
    async def get_by_id(self, inventory_id: str) -> Optional[Inventory]:
        """Get inventory by ID"""
        pass

    @abstractmethod
    async def get_by_product(self, product_id: str) -> Optional[Inventory]:
        """Get inventory by product"""
        pass

    @abstractmethod
    async def create(self, inventory: Inventory) -> Inventory:
        """Create new inventory"""
        pass

    @abstractmethod
    async def update(self, inventory: Inventory) -> Inventory:
        """Update inventory"""
        pass

    @abstractmethod
    async def delete(self, inventory_id: str) -> bool:
        """Delete inventory"""
        pass

    @abstractmethod
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Inventory]:
        """Get all inventory by business"""
        pass

    @abstractmethod
    async def get_low_stock(self, business_id: str) -> list[Inventory]:
        """Get products with low stock (below warning level)"""
        pass

    @abstractmethod
    async def update_quantity(self, product_id: str, quantity_change: float) -> Inventory:
        """Update inventory quantity"""
        pass

    @abstractmethod
    async def get_total_stock_value(self, business_id: str) -> float:
        """Calculate total stock value"""
        pass
