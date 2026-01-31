"""Application Layer - DTOs and Services"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRoleEnum(str, Enum):
    admin = "admin"
    owner = "owner"
    employee = "employee"


class OrderStatusEnum(str, Enum):
    draft = "draft"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


# ============ Auth DTOs ============
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict  # User object with id, email, full_name, role, etc


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)  # Min 6 chars for now
    full_name: str
    phone: str
    store_name: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: UserRoleEnum
    business_id: Optional[str]
    is_active: bool
    created_at: datetime


# ============ Product DTOs ============
class ProductUnitDTO(BaseModel):
    name: str
    value: float


class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    price: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    category: str
    units: Optional[List[ProductUnitDTO]] = None
    quantity_in_stock: float = Field(default=0, ge=0)
    unit_of_measure: str = "cái"
    min_quantity_alert: float = Field(default=0, ge=0)


class ProductResponse(BaseModel):
    id: str
    business_id: str
    name: str
    description: Optional[str]
    sku: str
    barcode: Optional[str]
    price: float
    cost: float
    category: str
    units: List[ProductUnitDTO]
    quantity_in_stock: float = 0
    unit_of_measure: str = "cái"
    min_quantity_alert: float = 0
    is_active: bool
    created_at: datetime


# ============ Order DTOs ============
class OrderItemRequest(BaseModel):
    product_id: str
    quantity: float = Field(..., gt=0)
    unit: str
    price: Optional[float] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    subtotal: float


class OrderCreateRequest(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    order_type: str = "counter"
    status: str = "draft"
    items: List[OrderItemRequest]
    discount: float = 0.0
    is_credit: bool = False
    payment_method: str = "cash"
    payment_status: str = "pending"
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: str
    business_id: str
    customer_id: Optional[str]
    customer_name: str
    employee_id: str
    order_type: str
    status: OrderStatusEnum
    items: List[OrderItemResponse]
    total_amount: float
    discount: float
    is_credit: bool
    payment_method: str
    payment_status: str
    notes: Optional[str]
    created_at: datetime


# ============ Customer DTOs ============
class CustomerCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None


class CustomerResponse(BaseModel):
    id: str
    business_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    outstanding_debt: Optional[float] = 0.0
    total_purchases: Optional[float] = 0.0
    total_transactions: Optional[int] = 0
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None


# ============ Debt DTOs ============
class DebtResponse(BaseModel):
    id: str
    business_id: str
    customer_id: str
    order_id: str
    amount: float
    remaining_debt: float
    due_date: Optional[datetime]
    is_paid: bool
    paid_date: Optional[datetime]
    created_at: datetime


# ============ Draft Order DTOs ============
class DraftOrderItemDTO(BaseModel):
    product_id: Optional[str]
    product_name: str
    quantity: float
    unit: str
    unit_price: float


class DraftOrderResponse(BaseModel):
    id: str
    business_id: str
    customer_name: str
    items: List[DraftOrderItemDTO]
    total_amount: float
    raw_input: str
    confidence: float
    is_confirmed: bool
    is_rejected: bool
    created_at: datetime


# ============ Report DTOs ============
class TopSellerResponse(BaseModel):
    product_id: str
    product_name: str
    quantity_sold: float
    revenue: float


class DebtReportResponse(BaseModel):
    customer_id: str
    customer_name: str
    outstanding_debt: float
    total_orders: int


class AnalyticsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    outstanding_debt: float
    average_order_value: float
    top_sellers: List[TopSellerResponse]
    outstanding_debts: List[DebtReportResponse]
