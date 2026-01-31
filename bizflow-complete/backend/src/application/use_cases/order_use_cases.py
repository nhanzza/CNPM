"""Order Use Cases"""
from datetime import datetime
from typing import List, Optional
from ...domain.entities import Order, OrderItem, OrderStatus
from ...domain.repositories import IOrderRepository, IProductRepository


class CreateOrderUseCase:
    """Create new order use case"""

    def __init__(
        self,
        order_repository: IOrderRepository,
        product_repository: IProductRepository,
    ):
        self.order_repo = order_repository
        self.product_repo = product_repository

    async def execute(
        self,
        business_id: str,
        employee_id: str,
        customer_name: str,
        items: List[dict],
        customer_id: Optional[str] = None,
        is_credit: bool = False,
        notes: str = "",
    ) -> Order:
        """Create order with items"""
        # Validate items and calculate total
        order_items = []
        total_amount = 0.0

        for item_data in items:
            product = await self.product_repo.get_by_id(item_data["product_id"])
            if not product:
                raise ValueError(f"Product not found: {item_data['product_id']}")

            quantity = item_data["quantity"]
            unit_price = item_data.get("unit_price", product.price)
            subtotal = quantity * unit_price

            order_items.append(
                OrderItem(
                    order_id="",  # Will be set after order creation
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    unit=item_data.get("unit", "cái"),
                    unit_price=unit_price,
                    subtotal=subtotal,
                )
            )
            total_amount += subtotal

        # Create order
        order = Order(
            business_id=business_id,
            customer_id=customer_id,
            customer_name=customer_name,
            employee_id=employee_id,
            items=order_items,
            total_amount=total_amount,
            is_credit=is_credit,
            status=OrderStatus.DRAFT,
            notes=notes,
        )

        # Save to repository
        saved_order = await self.order_repo.create(order)
        return saved_order


class ConfirmOrderUseCase:
    """Confirm order use case"""

    def __init__(self, order_repository: IOrderRepository):
        self.order_repo = order_repository

    async def execute(self, order_id: str) -> Order:
        """Confirm draft order"""
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError(f"Order not found: {order_id}")

        if order.status != OrderStatus.DRAFT:
            raise ValueError(f"Cannot confirm order with status: {order.status}")

        order.status = OrderStatus.CONFIRMED
        order.updated_at = datetime.now()

        return await self.order_repo.update(order)


class GetOrdersUseCase:
    """Get orders use case"""

    def __init__(self, order_repository: IOrderRepository):
        self.order_repo = order_repository

    async def get_all(
        self,
        business_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Order]:
        """Get all orders by business"""
        return await self.order_repo.get_all_by_business(business_id, skip, limit)

    async def get_by_status(
        self,
        business_id: str,
        status: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Order]:
        """Get orders by status"""
        return await self.order_repo.get_by_status(business_id, status, skip, limit)

    async def get_daily_revenue(
        self,
        business_id: str,
        date: datetime,
    ) -> float:
        """Get daily revenue"""
        return await self.order_repo.get_daily_revenue(business_id, date)
