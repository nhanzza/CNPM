"""Inventory Repository Implementation"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from ...domain.entities import Inventory
from ...domain.repositories import IInventoryRepository
from ..models import InventoryModel, ProductModel


class InventoryRepository(IInventoryRepository):
    """Inventory repository implementation"""

    
    def __init__(self, session: AsyncSession):
        self.session = session

   
    async def get_by_id(self, inventory_id: str) -> Optional[Inventory]:
        """Get inventory by ID"""
        stmt = select(InventoryModel).where(InventoryModel.id == inventory_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    
    async def get_by_product(self, product_id: str) -> Optional[Inventory]:
        """Get inventory by product"""
        stmt = select(InventoryModel).where(InventoryModel.product_id == product_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    
    async def create(self, inventory: Inventory) -> Inventory:
        """Create new inventory"""
        model = self._to_model(inventory)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    
    async def update(self, inventory: Inventory) -> Inventory:
        """Update inventory"""
        model = await self.session.merge(self._to_model(inventory))
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    
    async def delete(self, inventory_id: str) -> bool:
        """Delete inventory"""
        stmt = select(InventoryModel).where(InventoryModel.id == inventory_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    
    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Inventory]:
        """Get all inventory by business"""
        stmt = (
            select(InventoryModel)
            .where(InventoryModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    
    async def get_low_stock(self, business_id: str) -> list[Inventory]:
        """Get products with low stock (below warning level)"""
        stmt = select(InventoryModel).where(
            and_(
                InventoryModel.business_id == business_id,
                InventoryModel.quantity <= InventoryModel.warning_level,
            )
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(model) for model in models]

    
    async def update_quantity(self, product_id: str, quantity_change: float) -> Inventory:
        """Update inventory quantity"""
        stmt = select(InventoryModel).where(InventoryModel.product_id == product_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        
        if model:
            model.quantity += quantity_change
            await self.session.commit()
            await self.session.refresh(model)
            return self._to_entity(model)
        
        raise ValueError(f"Inventory not found for product {product_id}")

    
    async def get_total_stock_value(self, business_id: str) -> float:
        """Calculate total stock value"""
        stmt = select(
            func.sum(InventoryModel.quantity * ProductModel.cost)
        ).select_from(InventoryModel).join(ProductModel).where(
            InventoryModel.business_id == business_id
        )
        result = await self.session.execute(stmt)
        total = result.scalar()
        return float(total or 0)

    
    @staticmethod
    def _to_entity(model: InventoryModel) -> Inventory:
        """Convert model to entity"""
        return Inventory(
            id=model.id,
            product_id=model.product_id,
            business_id=model.business_id,
            quantity=model.quantity,
            unit=model.unit or "",
            warning_level=model.warning_level,
            last_updated=model.last_updated,
        )

    
    @staticmethod
    def _to_model(entity: Inventory) -> InventoryModel:
        """Convert entity to model"""
        return InventoryModel(
            id=entity.id,
            product_id=entity.product_id,
            business_id=entity.business_id,
            quantity=entity.quantity,
            unit=entity.unit,
            warning_level=entity.warning_level,
            last_updated=entity.last_updated,
        )
