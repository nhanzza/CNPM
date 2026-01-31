"""Product Repository Implementation"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...domain.entities import Product
from ...domain.repositories import IProductRepository
from ..models import ProductModel


class ProductRepository(IProductRepository):
    """Product repository implementation"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        stmt = select(ProductModel).where(ProductModel.id == product_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_sku(self, sku: str, business_id: str) -> Optional[Product]:
        """Get product by SKU"""
        stmt = select(ProductModel).where(
            (ProductModel.sku == sku) & (ProductModel.business_id == business_id)
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, product: Product) -> Product:
        """Create new product"""
        model = self._to_model(product)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, product: Product) -> Product:
        """Update product"""
        model = await self.session.merge(self._to_model(product))
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def delete(self, product_id: str) -> bool:
        """Delete product"""
        stmt = select(ProductModel).where(ProductModel.id == product_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Get all products by business"""
        stmt = (
            select(ProductModel)
            .where(ProductModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def get_by_category(
        self, business_id: str, category: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Get products by category"""
        stmt = (
            select(ProductModel)
            .where(
                (ProductModel.business_id == business_id)
                & (ProductModel.category == category)
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    async def search(
        self, business_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Search products by name or description"""
        search_pattern = f"%{query}%"
        stmt = (
            select(ProductModel)
            .where(
                (ProductModel.business_id == business_id)
                & (
                    (ProductModel.name.ilike(search_pattern))
                    | (ProductModel.description.ilike(search_pattern))
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    @staticmethod
    def _to_entity(model: ProductModel) -> Product:
        """Convert model to entity"""
        return Product(
            id=model.id,
            business_id=model.business_id,
            name=model.name,
            description=model.description or "",
            sku=model.sku,
            barcode=model.barcode,
            price=model.price,
            cost=model.cost or 0.0,
            category=model.category or "",
            units=model.units or [],
            images=model.images or [],
            quantity_in_stock=model.quantity_in_stock or 0.0,
            unit_of_measure=model.unit_of_measure or "cái",
            min_quantity_alert=model.min_quantity_alert or 0.0,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: Product) -> ProductModel:
        """Convert entity to model"""
        return ProductModel(
            id=entity.id,
            business_id=entity.business_id,
            name=entity.name,
            description=entity.description,
            sku=entity.sku,
            barcode=entity.barcode,
            price=entity.price,
            cost=entity.cost,
            category=entity.category,
            units=entity.units,
            images=entity.images,
            quantity_in_stock=entity.quantity_in_stock,
            unit_of_measure=entity.unit_of_measure,
            min_quantity_alert=entity.min_quantity_alert,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
