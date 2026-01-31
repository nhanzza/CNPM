"""Product Use Cases"""
from typing import List, Optional
from ...domain.entities import Product
from ...domain.repositories import IProductRepository


class CreateProductUseCase:
    """Create new product use case"""

    def __init__(self, product_repository: IProductRepository):
        self.product_repo = product_repository

    async def execute(
        self,
        business_id: str,
        name: str,
        sku: str,
        price: float,
        cost: float = 0.0,
        description: str = "",
        category: str = "",
        barcode: str = "",
        units: List[dict] = None,
        quantity_in_stock: float = 0.0,
        unit_of_measure: str = "cái",
        min_quantity_alert: float = 0.0,
    ) -> Product:
        """Create new product"""
        # Check if SKU already exists
        existing = await self.product_repo.get_by_sku(sku, business_id)
        if existing:
            raise ValueError(f"Product with SKU {sku} already exists")

        product = Product(
            business_id=business_id,
            name=name,
            sku=sku,
            price=price,
            cost=cost,
            description=description,
            category=category,
            barcode=barcode,
            units=units or [],
            quantity_in_stock=quantity_in_stock,
            unit_of_measure=unit_of_measure,
            min_quantity_alert=min_quantity_alert,
        )

        return await self.product_repo.create(product)


class GetProductsUseCase:
    """Get products use case"""

    def __init__(self, product_repository: IProductRepository):
        self.product_repo = product_repository

    async def get_all(
        self,
        business_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Product]:
        """Get all products by business"""
        return await self.product_repo.get_all_by_business(business_id, skip, limit)

    async def get_by_category(
        self,
        business_id: str,
        category: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Product]:
        """Get products by category"""
        return await self.product_repo.get_by_category(business_id, category, skip, limit)

    async def search(
        self,
        business_id: str,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Product]:
        """Search products"""
        return await self.product_repo.search(business_id, query, skip, limit)

    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        return await self.product_repo.get_by_id(product_id)


class UpdateProductUseCase:
    """Update product use case"""

    def __init__(self, product_repository: IProductRepository):
        self.product_repo = product_repository

    async def execute(
        self,
        product_id: str,
        business_id: str,
        name: str,
        sku: str,
        price: float,
        cost: float = 0.0,
        description: str = "",
        category: str = "",
        barcode: str = "",
        units: List[dict] = None,
        quantity_in_stock: float = 0.0,
        unit_of_measure: str = "cái",
        min_quantity_alert: float = 0.0,
    ) -> Product:
        """Update existing product"""
        # Get existing product
        existing = await self.product_repo.get_by_id(product_id)
        if not existing:
            raise ValueError(f"Product with ID {product_id} not found")

        # Check if business_id matches
        if existing.business_id != business_id:
            raise ValueError("Cannot update product from different business")

        # Update product fields
        existing.name = name
        existing.sku = sku
        existing.price = price
        existing.cost = cost
        existing.description = description
        existing.category = category
        existing.barcode = barcode
        existing.units = units or []
        existing.quantity_in_stock = quantity_in_stock
        existing.unit_of_measure = unit_of_measure
        existing.min_quantity_alert = min_quantity_alert

        return await self.product_repo.update(existing)
