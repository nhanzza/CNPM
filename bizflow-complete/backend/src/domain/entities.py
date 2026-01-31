"""Domain Layer - Business Entities and Rules"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import uuid4


class UserRole(str, Enum):
    """User roles"""
    ADMIN = "admin"
    OWNER = "owner"
    EMPLOYEE = "employee"


class OrderStatus(str, Enum):
    """Order status"""
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SubscriptionPlan(str, Enum):
    """Subscription plans"""
    BASIC = "basic"
    PRO = "pro"
    PREMIUM = "premium"


@dataclass
class User:
    """User entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    username: str = ""
    email: str = ""
    password_hash: str = ""
    full_name: str = ""
    role: UserRole = UserRole.EMPLOYEE
    business_id: str = ""
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Business:
    """Business (Owner) entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    owner_id: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    city: str = ""
    province: str = ""
    business_type: str = ""
    tax_id: Optional[str] = None
    is_active: bool = True
    subscription_plan: SubscriptionPlan = SubscriptionPlan.BASIC
    subscription_expires_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Product:
    """Product entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    name: str = ""
    description: str = ""
    sku: str = ""
    barcode: Optional[str] = None
    price: float = 0.0
    cost: float = 0.0
    category: str = ""
    units: List[dict] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Inventory:
    """Inventory entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    product_id: str = ""
    business_id: str = ""
    quantity: float = 0.0
    unit: str = ""
    warning_level: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)


@dataclass
class Customer:
    """Customer entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    name: str = ""
    phone: str = ""
    email: Optional[str] = None
    address: str = ""
    outstanding_debt: float = 0.0
    total_purchases: float = 0.0
    total_transactions: int = 0
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class OrderItem:
    """Order item entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    order_id: str = ""
    product_id: str = ""
    product_name: str = ""
    quantity: float = 0.0
    unit: str = ""
    unit_price: float = 0.0
    subtotal: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class Order:
    """Order entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    customer_id: Optional[str] = None
    customer_name: str = ""
    employee_id: str = ""
    order_type: str = "counter"
    status: OrderStatus = OrderStatus.DRAFT
    items: List[OrderItem] = field(default_factory=list)
    total_amount: float = 0.0
    discount: float = 0.0
    is_credit: bool = False
    payment_method: str = "cash"
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class Debt:
    """Debt entity"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    customer_id: str = ""
    order_id: str = ""
    amount: float = 0.0
    remaining_debt: float = 0.0
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    is_paid: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class DraftOrder:
    """AI-generated draft order"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    customer_name: str = ""
    items: List[dict] = field(default_factory=list)
    total_amount: float = 0.0
    raw_input: str = ""
    confidence: float = 0.0
    is_confirmed: bool = False
    is_rejected: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    confirmed_at: Optional[datetime] = None


@dataclass
class AccountingRecord:
    """Accounting record (Circular 88/2021/TT-BTC)"""
    id: str = field(default_factory=lambda: str(uuid4()))
    business_id: str = ""
    record_type: str = ""
    transaction_id: str = ""
    amount: float = 0.0
    description: str = ""
    recorded_date: datetime = field(default_factory=datetime.now)
    created_at: datetime = field(default_factory=datetime.now)
