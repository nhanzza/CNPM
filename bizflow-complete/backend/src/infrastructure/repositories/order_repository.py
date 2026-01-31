"""Order Repository Implementation"""
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from ...domain.entities import Order, OrderStatus, OrderItem
from ...domain.repositories import IOrderRepository
from ..models import OrderModel, OrderItemModel


class OrderRepository(IOrderRepository):
    """Order repository implementation"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, order_id: str) -> Optional[Order]:
        """Get order by ID"""
        stmt = select(OrderModel).where(OrderModel.id == order_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        
        # Get order items
        items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == order_id)
        items_result = await self.session.execute(items_stmt)
        items_models = items_result.scalars().all()
        
        return self._to_entity(model, items_models)

    async def create(self, order: Order) -> Order:
        """Create new order"""
        model = self._to_model(order)
        self.session.add(model)
        await self.session.flush()
        
        # Add order items
        for item in order.items:
            item_model = OrderItemModel(
                id=item.id,
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            self.session.add(item_model)
        
        await self.session.commit()
        await self.session.refresh(model)
        return await self.get_by_id(model.id)

    async def update(self, order: Order) -> Order:
        """Update order"""
        # Update order
        model = await self.session.merge(self._to_model(order))
        
        # Delete existing items
        items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == order.id)
        items_result = await self.session.execute(items_stmt)
        items_models = items_result.scalars().all()
        for item_model in items_models:
            await self.session.delete(item_model)
        
        # Add new items
        for item in order.items:
            item_model = OrderItemModel(
                id=item.id,
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            self.session.add(item_model)
        
        await self.session.commit()
        return await self.get_by_id(order.id)

    async def delete(self, order_id: str) -> bool:
        """Delete order"""
        stmt = select(OrderModel).where(OrderModel.id == order_id)
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        if model:
            # Delete items first
            items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == order_id)
            items_result = await self.session.execute(items_stmt)
            items_models = items_result.scalars().all()
            for item_model in items_models:
                await self.session.delete(item_model)
            
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False

    async def get_all_by_business(
        self, business_id: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get all orders by business"""
        stmt = (
            select(OrderModel)
            .where(OrderModel.business_id == business_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        orders = []
        for model in models:
            items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == model.id)
            items_result = await self.session.execute(items_stmt)
            items_models = items_result.scalars().all()
            orders.append(self._to_entity(model, items_models))
        
        return orders

    async def get_by_status(
        self, business_id: str, status: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get orders by status"""
        stmt = (
            select(OrderModel)
            .where(
                (OrderModel.business_id == business_id)
                & (OrderModel.status == status)
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        orders = []
        for model in models:
            items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == model.id)
            items_result = await self.session.execute(items_stmt)
            items_models = items_result.scalars().all()
            orders.append(self._to_entity(model, items_models))
        
        return orders

    async def get_by_date_range(
        self, business_id: str, start_date: datetime, end_date: datetime
    ) -> list[Order]:
        """Get orders by date range"""
        stmt = select(OrderModel).where(
            and_(
                OrderModel.business_id == business_id,
                OrderModel.created_at >= start_date,
                OrderModel.created_at <= end_date,
            )
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        orders = []
        for model in models:
            items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == model.id)
            items_result = await self.session.execute(items_stmt)
            items_models = items_result.scalars().all()
            orders.append(self._to_entity(model, items_models))
        
        return orders

    async def get_by_customer(
        self, customer_id: str, skip: int = 0, limit: int = 100
    ) -> list[Order]:
        """Get orders by customer"""
        stmt = (
            select(OrderModel)
            .where(OrderModel.customer_id == customer_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        
        orders = []
        for model in models:
            items_stmt = select(OrderItemModel).where(OrderItemModel.order_id == model.id)
            items_result = await self.session.execute(items_stmt)
            items_models = items_result.scalars().all()
            orders.append(self._to_entity(model, items_models))
        
        return orders

    async def get_daily_revenue(self, business_id: str, date: datetime) -> float:
        """Calculate daily revenue"""
        start_of_day = datetime(date.year, date.month, date.day)
        end_of_day = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        stmt = select(func.sum(OrderModel.total_amount)).where(
            and_(
                OrderModel.business_id == business_id,
                OrderModel.status == OrderStatus.COMPLETED.value,
                OrderModel.created_at >= start_of_day,
                OrderModel.created_at <= end_of_day,
            )
        )
        result = await self.session.execute(stmt)
        total = result.scalar()
        return float(total or 0)

    @staticmethod
    def _to_entity(model: OrderModel, items_models: list[OrderItemModel]) -> Order:
        """Convert model to entity"""
        items = [
            OrderItem(
                id=item_model.id,
                order_id=item_model.order_id,
                product_id=item_model.product_id,
                product_name=item_model.product_name,
                quantity=item_model.quantity,
                unit=item_model.unit,
                unit_price=item_model.unit_price,
                subtotal=item_model.subtotal,
            )
            for item_model in items_models
        ]
        
        return Order(
            id=model.id,
            order_number=model.order_number,
            business_id=model.business_id,
            customer_id=model.customer_id,
            customer_name=model.customer_name or "",
            employee_id=model.employee_id or "",
            order_type=model.order_type or "counter",
            status=OrderStatus(model.status),
            items=items,
            total_amount=model.total_amount,
            discount=model.discount,
            is_credit=model.is_credit,
            payment_method=model.payment_method or "cash",
            notes=model.notes or "",
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: Order) -> OrderModel:
        """Convert entity to model"""
        return OrderModel(
            id=entity.id,
            order_number=entity.order_number,
            business_id=entity.business_id,
            customer_id=entity.customer_id,
            customer_name=entity.customer_name,
            employee_id=entity.employee_id,
            order_type=entity.order_type,
            status=entity.status.value,
            total_amount=entity.total_amount,
            discount=entity.discount,
            is_credit=entity.is_credit,
            payment_method=entity.payment_method,
            notes=entity.notes,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
