"""API route handlers for FastAPI"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..application.dtos import (
    LoginRequest, LoginResponse, UserResponse, RegisterRequest,
    ProductCreateRequest, ProductResponse,
    OrderCreateRequest, OrderResponse,
    CustomerCreateRequest, CustomerResponse,
    DraftOrderResponse, AnalyticsResponse
)
from ..application.business_logic import AuthService

router = APIRouter()


# ============ Health & Status ============
@router.get("/status")
async def status():
    """API status endpoint"""
    return {"status": "ok", "service": "BizFlow API"}


# ============ Authentication Endpoints ============
@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login"""
    result = await AuthService.login(
        email=request.email,
        password=request.password
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return LoginResponse(
        access_token=result.get("access_token", ""),
        refresh_token=result.get("refresh_token", ""),
        token_type=result.get("token_type", "bearer"),
        user=result.get("user", {})
    )


@router.post("/auth/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    """User registration"""
    result = await AuthService.register(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        phone=request.phone,
        store_name=request.store_name
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    return LoginResponse(
        access_token=result.get("access_token", ""),
        refresh_token=result.get("refresh_token", ""),
        token_type=result.get("token_type", "bearer"),
        user=result.get("user", {})
    )


# ============ Product Endpoints ============
@router.get("/products", response_model=List[ProductResponse])
async def list_products(business_id: str):
    """List all products"""
    # TODO: Implement product listing
    return []


@router.post("/products", response_model=ProductResponse)
async def create_product(business_id: str, request: ProductCreateRequest):
    """Create new product"""
    # TODO: Implement product creation
    return ProductResponse(
        id="id",
        business_id=business_id,
        name=request.name,
        description=request.description,
        sku=request.sku,
        price=request.price,
        cost=request.cost,
        category=request.category,
        units=request.units,
        is_active=True,
        created_at="2024-01-15T00:00:00"
    )


@router.get("/products/search")
async def search_products(business_id: str, query: str):
    """Search products"""
    # TODO: Implement product search
    return []


# ============ Order Endpoints ============
@router.post("/orders", response_model=OrderResponse)
async def create_order(business_id: str, employee_id: str, request: OrderCreateRequest):
    """Create new order"""
    # TODO: Implement order creation
    return {
        "id": "order_id",
        "business_id": business_id,
        "customer_id": request.customer_id,
        "customer_name": request.customer_name or "",
        "employee_id": employee_id,
        "order_type": request.order_type,
        "status": "draft",
        "items": [],
        "total_amount": 0.0,
        "discount": request.discount,
        "is_credit": request.is_credit,
        "payment_method": request.payment_method,
        "notes": request.notes,
        "created_at": "2024-01-15T00:00:00"
    }


@router.get("/orders", response_model=List[OrderResponse])
async def list_orders(business_id: str, skip: int = 0, limit: int = 100):
    """List orders"""
    # TODO: Implement order listing
    return []


@router.post("/orders/{order_id}/confirm", response_model=OrderResponse)
async def confirm_order(order_id: str):
    """Confirm order"""
    # TODO: Implement order confirmation
    return {}


# ============ Customer Endpoints ============
@router.post("/customers", response_model=CustomerResponse)
async def create_customer(business_id: str, request: CustomerCreateRequest):
    """Create new customer"""
    # TODO: Implement customer creation
    return {
        "id": "customer_id",
        "business_id": business_id,
        "name": request.name,
        "phone": request.phone,
        "email": request.email,
        "address": request.address or "",
        "outstanding_debt": 0.0,
        "total_purchases": 0.0,
        "total_transactions": 0,
        "is_active": True,
        "created_at": "2024-01-15T00:00:00"
    }


@router.get("/customers", response_model=List[CustomerResponse])
async def list_customers(business_id: str):
    """List customers"""
    # TODO: Implement customer listing
    return []


@router.get("/customers/search")
async def search_customers(business_id: str, query: str):
    """Search customers"""
    # TODO: Implement customer search
    return []


# ============ Draft Order Endpoints (AI) ============
@router.post("/draft-orders", response_model=DraftOrderResponse)
async def create_draft_order(business_id: str, request: dict):
    """Create draft order from natural language"""
    # TODO: Implement AI draft order creation
    return {
        "id": "draft_id",
        "business_id": business_id,
        "customer_name": "",
        "items": [],
        "total_amount": 0.0,
        "raw_input": request.get("input", ""),
        "confidence": 0.0,
        "is_confirmed": False,
        "is_rejected": False,
        "created_at": "2024-01-15T00:00:00"
    }


@router.get("/draft-orders", response_model=List[DraftOrderResponse])
async def list_draft_orders(business_id: str):
    """List draft orders"""
    # TODO: Implement draft order listing
    return []


@router.post("/draft-orders/{draft_id}/confirm")
async def confirm_draft_order(draft_id: str):
    """Confirm draft order"""
    # TODO: Implement draft confirmation
    return {"status": "confirmed"}


# ============ Analytics & Reports ============
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(business_id: str):
    """Get business analytics"""
    # TODO: Implement analytics calculation
    return {
        "total_revenue": 0.0,
        "total_orders": 0,
        "total_customers": 0,
        "outstanding_debt": 0.0,
        "average_order_value": 0.0,
        "top_sellers": [],
        "outstanding_debts": []
    }


@router.get("/reports/revenue")
async def get_revenue_report(business_id: str, start_date: str, end_date: str):
    """Get revenue report"""
    # TODO: Implement revenue report
    return {"revenue": 0.0, "orders": 0}


@router.get("/reports/accounting")
async def get_accounting_report(business_id: str, start_date: str, end_date: str):
    """Get accounting report (Circular 88/2021/TT-BTC)"""
    # TODO: Implement accounting report
    return {
        "business_id": business_id,
        "period": f"{start_date} to {end_date}",
        "revenue_ledger": [],
        "debt_ledger": [],
        "inventory_ledger": []
    }
