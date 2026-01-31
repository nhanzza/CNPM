"""Domain Layer - Repository Interfaces"""
from .user_repository import IUserRepository
from .product_repository import IProductRepository
from .order_repository import IOrderRepository
from .customer_repository import ICustomerRepository
from .debt_repository import IDebtRepository
from .inventory_repository import IInventoryRepository

__all__ = [
    "IUserRepository",
    "IProductRepository",
    "IOrderRepository",
    "ICustomerRepository",
    "IDebtRepository",
    "IInventoryRepository",
]
