"""Application Layer - Commands (Input DTOs)"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ Order Commands ============
class CreateOrderCommand(BaseModel):
    """Create order command"""
    business_id: str
    employee_id: str
    customer_name: str
    items: List[dict] = Field(..., min_items=1)
    customer_id: Optional[str] = None
    is_credit: bool = False
    notes: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "business_id": "biz_123",
                "employee_id": "emp_123",
                "customer_name": "Nguyễn Văn A",
                "items": [
                    {
                        "product_id": "prod_123",
                        "quantity": 2,
                        "unit_price": 50000,
                        "unit": "cái"
                    }
                ],
                "is_credit": False,
                "notes": "Giao hàng nhanh"
            }
        }


class ConfirmOrderCommand(BaseModel):
    """Confirm order command"""
    order_id: str


# ============ Customer Commands ============
class CreateCustomerCommand(BaseModel):
    """Create customer command"""
    business_id: str
    name: str = Field(..., min_length=1)
    phone: str = ""
    email: Optional[str] = None
    address: str = ""


class UpdateCustomerCommand(BaseModel):
    """Update customer command"""
    business_id: str
    name: str = Field(..., min_length=1)
    phone: str = ""
    email: Optional[str] = None
    address: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "business_id": "biz_123",
                "name": "Cửa hàng ABC",
                "phone": "0912345678",
                "email": "abc@gmail.com",
                "address": "123 Đường XYZ, TP HCM"
            }
        }


# ============ Debt Commands ============
class RecordDebtCommand(BaseModel):
    """Record debt command"""
    business_id: str
    customer_id: str
    order_id: str
    amount: float = Field(..., gt=0)
    due_date: Optional[datetime] = None


class PayDebtCommand(BaseModel):
    """Pay debt command"""
    debt_id: str
    payment_amount: float = Field(..., gt=0)


# ============ Product Commands ============
class CreateProductCommand(BaseModel):
    """Create product command"""
    business_id: str
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    cost: float = Field(default=0, ge=0)
    description: Optional[str] = None
    category: str = ""
    barcode: Optional[str] = None
    units: Optional[List[dict]] = None
    quantity_in_stock: float = Field(default=0, ge=0)
    unit_of_measure: str = "cái"
    min_quantity_alert: float = Field(default=0, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "business_id": "biz_123",
                "name": "Nước lọc 1.5L",
                "sku": "NL-1.5L",
                "price": 15000,
                "cost": 10000,
                "description": "Nước lọc tinh khiết",
                "category": "Thức uống",
                "barcode": "1234567890",
                "quantity_in_stock": 100,
                "unit_of_measure": "chai",
                "min_quantity_alert": 20
            }
        }


class UpdateProductCommand(BaseModel):
    """Update product command"""
    business_id: str
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    cost: float = Field(default=0, ge=0)
    description: Optional[str] = None
    category: str = ""
    barcode: Optional[str] = None
    units: Optional[List[dict]] = None
    quantity_in_stock: float = Field(default=0, ge=0)
    unit_of_measure: str = "cái"
    min_quantity_alert: float = Field(default=0, ge=0)


# ============ User Commands ============
class LoginCommand(BaseModel):
    """Login command"""
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")


class RegisterCommand(BaseModel):
    """Register command"""
    email: str = Field(...)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    business_id: str
    username: Optional[str] = None
