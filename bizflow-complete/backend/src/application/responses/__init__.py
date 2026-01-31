"""Application Layer - Responses (Output DTOs)"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ User Responses ============
class UserResponse(BaseModel):
    """User response"""
    id: str
    email: str
    full_name: str
    username: str
    role: str
    business_id: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Login response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ============ Product Responses ============
class ProductResponse(BaseModel):
    """Product response"""
    id: str
    business_id: str
    name: str
    sku: str
    description: Optional[str] = None
    barcode: Optional[str] = None
    price: float
    cost: float
    category: str
    units: List[dict] = []
    images: List[str] = []
    quantity_in_stock: float = 0.0
    unit_of_measure: str = "cái"
    min_quantity_alert: float = 0.0
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Customer Responses ============
class CustomerResponse(BaseModel):
    """Customer response"""
    id: str
    business_id: str
    name: str
    phone: str
    email: Optional[str] = None
    address: str
    outstanding_debt: float
    total_purchases: float
    total_transactions: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Order Responses ============
class OrderItemResponse(BaseModel):
    """Order item response"""
    id: str
    product_id: str
    product_name: str
    quantity: float
    unit: str
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Order response"""
    id: str
    order_number: Optional[str] = None
    business_id: str
    customer_id: Optional[str] = None
    customer_name: str
    employee_id: str
    order_type: str
    status: str
    items: List[OrderItemResponse]
    total_amount: float
    discount: float
    is_credit: bool
    payment_method: str
    notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Debt Responses ============
class DebtResponse(BaseModel):
    """Debt response"""
    id: str
    business_id: str
    customer_id: str
    order_id: str
    amount: float
    remaining_debt: float
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    is_paid: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Analytics Responses ============
class AnalyticsResponse(BaseModel):
    """Analytics response"""
    total_revenue: float
    total_orders: int
    total_customers: int
    outstanding_debt: float
    average_order_value: float


class DailyRevenueResponse(BaseModel):
    """Daily revenue response"""
    date: datetime
    revenue: float
    order_count: int


# ============ Error Responses ============
class ErrorResponse(BaseModel):
    """Error response"""
    status_code: int
    message: str
    detail: Optional[str] = None
