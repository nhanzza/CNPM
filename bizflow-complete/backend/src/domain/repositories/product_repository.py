"""Product Repository Interface"""
from abc import ABC, abstractmethod
from typing import Optional
from ..entities import Product


class IProductRepository(ABC):
    """Product repository interface"""

    @abstractmethod
    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        pass

    @abstractmethod
    async def get_by_sku(self, sku: str, business_id: str) -> Optional[Product]:
        """Get product by SKU"""
        pass

    @abstractmethod
    async def create(self, product: Product) -> Product:
        """Create new product"""
        pass

    @abstractmethod
    async def update(self, product: Product) -> Product:
        """Update product"""
        pass

    @abstractmethod
    async def delete(self, product_id: str) -> bool:
        """Delete product"""
        pass

    @abstractmethod
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Get all products by business"""
        pass

    @abstractmethod
    async def get_by_category(
        self, business_id: str, category: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Get products by category"""
        pass

    @abstractmethod
    async def search(
        self, business_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Search products by name or description"""
        pass
