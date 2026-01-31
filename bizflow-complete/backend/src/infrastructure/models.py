"""Database Models using SQLAlchemy"""
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class UserModel(Base):
    """User database model"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200))
    role = Column(String(20), default="employee")
    business_id = Column(String(36), ForeignKey("businesses.id"))
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class BusinessModel(Base):
    """Business database model"""
    __tablename__ = "businesses"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(200), nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id"))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(String(255))
    city = Column(String(100))
    province = Column(String(100))
    business_type = Column(String(100))
    tax_id = Column(String(50))
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(String(50), default="basic")
    subscription_expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class ProductModel(Base):
    """Product database model"""
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sku = Column(String(50), nullable=False)
    barcode = Column(String(50))
    price = Column(Float, nullable=False)
    cost = Column(Float)
    category = Column(String(100))
    units = Column(JSON)
    images = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class InventoryModel(Base):
    """Inventory database model"""
    __tablename__ = "inventory"
    
    id = Column(String(36), primary_key=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    quantity = Column(Float, default=0)
    unit = Column(String(50))
    warning_level = Column(Float, default=0)
    last_updated = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class CustomerModel(Base):
    """Customer database model"""
    __tablename__ = "customers"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    name = Column(String(200), nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(String(255))
    outstanding_debt = Column(Float, default=0)
    total_purchases = Column(Float, default=0)
    total_transactions = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class OrderModel(Base):
    """Order database model"""
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"))
    customer_name = Column(String(200))
    employee_id = Column(String(36), ForeignKey("users.id"))
    order_type = Column(String(50), default="counter")
    status = Column(String(50), default="draft")
    total_amount = Column(Float, default=0)
    discount = Column(Float, default=0)
    is_credit = Column(Boolean, default=False)
    payment_method = Column(String(50), default="cash")
    payment_status = Column(String(50), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class OrderItemModel(Base):
    """Order item database model"""
    __tablename__ = "order_items"
    
    id = Column(String(36), primary_key=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"))
    product_name = Column(String(200))
    quantity = Column(Float, nullable=False)
    unit = Column(String(50))
    unit_price = Column(Float)
    subtotal = Column(Float)
    created_at = Column(DateTime, default=datetime.now)


class DebtModel(Base):
    """Debt database model"""
    __tablename__ = "debts"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    order_id = Column(String(36), ForeignKey("orders.id"))
    amount = Column(Float, nullable=False)
    remaining_debt = Column(Float, nullable=False)
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class DraftOrderModel(Base):
    """Draft order database model"""
    __tablename__ = "draft_orders"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    customer_name = Column(String(200))
    items = Column(JSON)
    total_amount = Column(Float, default=0)
    raw_input = Column(Text)
    confidence = Column(Float, default=0)
    is_confirmed = Column(Boolean, default=False)
    is_rejected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    confirmed_at = Column(DateTime)


class AccountingRecordModel(Base):
    """Accounting record database model"""
    __tablename__ = "accounting_records"
    
    id = Column(String(36), primary_key=True)
    business_id = Column(String(36), ForeignKey("businesses.id"), nullable=False)
    record_type = Column(String(50))
    transaction_id = Column(String(36))
    amount = Column(Float)
    description = Column(Text)
    recorded_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
