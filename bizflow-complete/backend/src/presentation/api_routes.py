"""Complete API route implementations with business logic"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header, Body
from datetime import datetime
from typing import List, Optional
from ..application.business_logic import (
    AuthService, ProductService, OrderService, CustomerService,
    DebtService, ReportService, DraftOrderService, AccountingService,
    MOCK_ORDERS_DB, MOCK_USERS_DB
)
from ..application.dtos import (
    LoginRequest, LoginResponse, UserResponse, RegisterRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    ProductCreateRequest, ProductResponse,
    OrderCreateRequest, OrderResponse, OrderItemResponse,
    CustomerCreateRequest, CustomerResponse,
    DebtResponse, DraftOrderResponse, AnalyticsResponse
)

router = APIRouter()

# ============ DEPENDENCIES ============
async def get_optional_user(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Soft auth; returns user if token present, otherwise None."""
    if not authorization:
        return None
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    return await AuthService.get_current_user(token)

async def get_current_user(authorization: Optional[str] = Header(None, alias="Authorization")):
    """Dependency to get current user from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Validate token using AuthService
    user = await AuthService.get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user


def require_roles(allowed_roles: List[str]):
    async def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return current_user
    return checker


def resolve_store_id(store_id: Optional[str], business_id: Optional[str], current_user: Optional[dict]) -> str:
    sid = store_id or business_id or (current_user.get("store_id") if current_user else None)
    if not sid:
        raise HTTPException(status_code=400, detail="store_id or business_id is required")
    if current_user and current_user.get("role") != "admin" and current_user.get("store_id") not in [None, sid]:
        raise HTTPException(status_code=403, detail="Store mismatch")
    return sid

# ============ AUTHENTICATION ENDPOINTS ============
@router.post("/auth/login", tags=["Authentication"])
async def login(request: LoginRequest):
    """User login with email and password"""
    result = await AuthService.login(request.email, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@router.post("/auth/register", tags=["Authentication"])
async def register(request: RegisterRequest):
    """Register new user and store"""
    try:
        result = await AuthService.register(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            phone=request.phone,
            store_name=request.store_name
        )
        if not result:
            raise HTTPException(status_code=400, detail="Email already registered or registration failed")
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Registration error: {str(e)}")

@router.post("/auth/logout", tags=["Authentication"])
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user"""
    return {"message": "Logged out successfully"}

@router.get("/auth/profile", response_model=UserResponse, tags=["Authentication"])
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.post("/auth/refresh", tags=["Authentication"])
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    refreshed = await AuthService.refresh(refresh_token)
    if not refreshed:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return refreshed

@router.post("/auth/forgot-password", tags=["Authentication"])
async def forgot_password(request: ForgotPasswordRequest):
    """Issue a password reset token for the provided email.

    For demo purposes, returns the token directly instead of sending email.
    """
    try:
        result = await AuthService.request_password_reset(request.email)
        if not result:
            # Always return success message to avoid user enumeration
            return {"message": "If the email exists, a reset token was issued."}
        return {"message": "Reset token created", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/reset-password", tags=["Authentication"])
async def reset_password(request: ResetPasswordRequest):
    """Reset a user's password using the token from /forgot-password."""
    ok = await AuthService.reset_password(request.token, request.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid token or request")
    return {"message": "Password reset successfully"}


# ============ STORE INFORMATION ============
@router.get("/store/info", tags=["Store"])
async def get_store_info(
    store_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get store information (public endpoint, optional auth)"""
    if not store_id and not current_user:
        raise HTTPException(status_code=400, detail="store_id is required when not authenticated")
    
    resolved_store = store_id or (current_user.get("store_id") if current_user else None)
    if not resolved_store:
        raise HTTPException(status_code=400, detail="store_id is required")
    
    # Return store info - use current user's data if authenticated, otherwise return generic store info
    if current_user:
        return {
            "store_id": resolved_store,
            "store_name": current_user.get("store_name", "BizFlow Store"),
            "owner_name": current_user.get("full_name", "Store Owner"),
            "email": current_user.get("email", ""),
            "phone": current_user.get("phone", ""),
            "address": current_user.get("address", ""),
            "created_at": "2024-01-01"
        }
    else:
        # Fallback for unauthenticated requests
        return {
            "store_id": resolved_store,
            "store_name": "BizFlow Store",
            "owner_name": "Store Owner",
            "email": "",
            "phone": "",
            "address": "",
            "created_at": "2024-01-01"
        }


@router.put("/store/info", tags=["Store"])
async def update_store_info(
    store_id: Optional[str] = Query(None),
    store_name: Optional[str] = Body(None),
    owner_name: Optional[str] = Body(None),
    email: Optional[str] = Body(None),
    phone: Optional[str] = Body(None),
    address: Optional[str] = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """Update store information (for registered accounts only)"""
    resolved_store = resolve_store_id(store_id, None, current_user)
    
    # Update the user's store info in MOCK_USERS_DB
    user_email = current_user.get("email", "").lower()
    
    if user_email in MOCK_USERS_DB:
        user = MOCK_USERS_DB[user_email]
        
        # Update fields
        if store_name is not None:
            user["store_name"] = store_name
        if owner_name is not None:
            user["full_name"] = owner_name
        if email is not None:
            user["email"] = email
        if phone is not None:
            user["phone"] = phone
        if address is not None:
            user["address"] = address
        
        return {
            "message": "Store information updated successfully",
            "store_id": resolved_store,
            "store_name": user.get("store_name", "BizFlow Store"),
            "owner_name": user.get("full_name", "Store Owner"),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "created_at": "2024-01-01"
        }
    else:
        raise HTTPException(status_code=403, detail="Store information cannot be updated for test accounts")


# ============ PRODUCT ENDPOINTS ============
@router.get("/products", tags=["Products"])
async def list_products(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """List all products for store"""
    try:
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        products = await ProductService.list_products(resolved_store, skip, limit)
        result = products if products else []
        print(f"DEBUG: Returning {len(result)} products for store {resolved_store}")
        print(f"DEBUG: Sample product: {result[0] if result else 'empty'}")
        return {"products": result, "total": len(result)}
    except Exception as e:
        print(f"ERROR in list_products: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty list instead of crashing
        return {"products": [], "total": 0}

@router.post("/products", tags=["Products"])
async def create_product(
    request: ProductCreateRequest,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Create new product"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    product = await ProductService.create_product(resolved_store, request.dict())
    return product

@router.get("/products/{product_id}", tags=["Products"])
async def get_product(
    product_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get product details"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    product = await ProductService.get_product(product_id, resolved_store)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ============ USER/EMPLOYEE ENDPOINTS ============
@router.get("/users", tags=["Users"])
async def list_users(
    store_id: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """List all users/employees for store"""
    try:
        # Mock users data - in a real app, would query database
        users = [
            {
                "id": "emp_001",
                "store_id": store_id,
                "email": "employee1@bizflow.com",
                "full_name": "Nguyễn Văn Nhân Viên",
                "phone": "0912345678",
                "role": "employee",
                "status": "active",
                "created_at": "2024-01-01",
            },
            {
                "id": "emp_002",
                "store_id": store_id,
                "email": "employee2@bizflow.com",
                "full_name": "Trần Thị Nhân Viên",
                "phone": "0987654321",
                "role": "employee",
                "status": "active",
                "created_at": "2024-01-05",
            }
        ]
        print(f"DEBUG: Returning {len(users)} users for store {store_id}")
        return users
    except Exception as e:
        print(f"ERROR in list_users: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

@router.put("/products/{product_id}", tags=["Products"])
async def update_product(
    product_id: str,
    request: ProductCreateRequest,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Update product details including inventory"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    product = await ProductService.update_product(product_id, resolved_store, request.dict())
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/products/{product_id}", tags=["Products"])
async def delete_product(
    product_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Delete product"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    success = await ProductService.delete_product(product_id, resolved_store)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@router.get("/products/search/{query}", tags=["Products"])
async def search_products(
    query: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Search products by name or SKU"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    products = await ProductService.search_products(resolved_store, query)
    return products

@router.get("/inventory/low-stock", tags=["Products"])
async def get_low_stock(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get products below minimum stock"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    products = await ProductService.get_low_stock_products(resolved_store)
    return products

@router.get("/inventory/expiring", tags=["Products"])
async def get_expiring(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get products expiring soon"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    products = await ProductService.get_expiring_products(resolved_store, days)
    return products


# ============ ORDER ENDPOINTS ============
@router.get("/orders", tags=["Orders"])
async def list_orders(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """List all orders"""
    try:
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        orders = await OrderService.list_orders(resolved_store, skip, limit)
        if status:
            orders = [o for o in orders if o.get("status") == status]
        result = orders if orders else []
        print(f"DEBUG: Returning {len(result)} orders for store {resolved_store}")
        
        # Debug: Show all orders with payment_status
        paid_count = sum(1 for o in result if o.get("payment_status") == "paid")
        pending_count = sum(1 for o in result if o.get("payment_status") != "paid")
        paid_total = sum(o.get("total_amount", 0) for o in result if o.get("payment_status") == "paid")
        pending_total = sum(o.get("total_amount", 0) for o in result if o.get("payment_status") != "paid")
        print(f"DEBUG: Paid orders: {paid_count}, total={paid_total}")
        print(f"DEBUG: Unpaid orders: {pending_count}, total={pending_total}")
        for o in result:
            print(f"  - {o.get('order_number')}: {o.get('payment_status', 'unknown')}, {o.get('total_amount', 0)}đ")
        
        return {"orders": result, "total": len(result)}
    except Exception as e:
        print(f"ERROR in list_orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"orders": [], "total": 0}

@router.post("/orders", tags=["Orders"])
async def create_order(
    request: OrderCreateRequest,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Create new order"""
    try:
        print(f"=== CREATE ORDER REQUEST ===")
        print(f"DEBUG: status from request: {request.status}")
        print(f"DEBUG: payment_status from request: {request.payment_status}")
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        
        # Convert Pydantic OrderItemRequest objects to dicts
        items_as_dicts = [item.dict() if hasattr(item, 'dict') else item for item in request.items]
        
        order = await OrderService.create_order(
            store_id=resolved_store,
            customer_id=request.customer_id,
            items=items_as_dicts,
            customer_name=request.customer_name,
            order_type=request.order_type,
            status=request.status,
            discount=request.discount,
            is_credit=request.is_credit,
            payment_method=request.payment_method,
            payment_status=request.payment_status,
            notes=request.notes
        )
        
        print(f"SUCCESS: Order created with status={order.get('status')}, payment_status={order.get('payment_status')}")
        return order
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/{order_id}", tags=["Orders"])
async def get_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get order details"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    order = await OrderService.get_order(order_id, resolved_store)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders/{order_id}/confirm", tags=["Orders"])
async def confirm_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Confirm pending order"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    order = await OrderService.confirm_order(order_id, resolved_store)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders/{order_id}/ship", tags=["Orders"])
async def ship_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    shipping_info: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Mark order as shipped"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    order = await OrderService.ship_order(order_id, resolved_store, shipping_info)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders/{order_id}/deliver", tags=["Orders"])
async def deliver_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Mark order as delivered"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    order = await OrderService.deliver_order(order_id, resolved_store)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/orders/{order_id}", tags=["Orders"])
async def delete_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Delete order"""
    print(f"=== DELETE /orders/{order_id} called with store_id={store_id} ===")
    try:
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        print(f"DEBUG: order_id type={type(order_id)}, value='{order_id}'")
        print(f"DEBUG: store_id type={type(store_id)}, value='{store_id}'")
        print(f"DEBUG: MOCK_ORDERS_DB keys: {list(MOCK_ORDERS_DB.keys())}")
        
        # Get orders for this store
        if resolved_store not in MOCK_ORDERS_DB:
            print(f"ERROR: Store {resolved_store} not found in MOCK_ORDERS_DB")
            raise HTTPException(status_code=404, detail="Store not found")
        
        orders = MOCK_ORDERS_DB[resolved_store]
        print(f"DEBUG: Found {len(orders)} orders for store {resolved_store}")
        print(f"DEBUG: Order IDs: {[o.get('id') for o in orders]}")
        
        # Find and remove the order
        original_count = len(orders)
        MOCK_ORDERS_DB[resolved_store] = [o for o in orders if o.get("id") != order_id]
        
        if len(MOCK_ORDERS_DB[resolved_store]) == original_count:
            print(f"ERROR: Order {order_id} not found")
            raise HTTPException(status_code=404, detail="Order not found")
        
        print(f"SUCCESS: Deleted order {order_id}. Orders count: {original_count} -> {len(MOCK_ORDERS_DB[resolved_store])}")
        return {"message": "Order deleted successfully", "id": order_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in delete_order: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}", tags=["Orders"])
async def update_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    request: dict = Body(...),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Update order"""
    try:
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        order = await OrderService.update_order(order_id, resolved_store, request)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/orders/{order_id}/cancel", tags=["Orders"])
async def cancel_order(
    order_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    reason: str = "",
    current_user: dict = Depends(get_current_user)
):
    """Cancel order and restore inventory"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    success = await OrderService.cancel_order(order_id, resolved_store, reason)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order cancelled successfully"}


# ============ CUSTOMER ENDPOINTS ============
@router.get("/customers", tags=["Customers"])
async def list_customers(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """List all customers"""
    try:
        resolved_store = resolve_store_id(store_id, business_id, current_user)
        customers = await CustomerService.list_customers(resolved_store, skip, limit)
        result = customers if customers else []
        print(f"DEBUG: Returning {len(result)} customers for store {resolved_store}")
        print(f"DEBUG: Sample customer: {result[0] if result else 'empty'}")
        return {"customers": result, "total": len(result)}
    except Exception as e:
        print(f"ERROR in list_customers: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"customers": [], "total": 0}

@router.post("/customers", response_model=CustomerResponse, tags=["Customers"])
async def create_customer(
    request: CustomerCreateRequest,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Create new customer"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    customer = await CustomerService.create_customer(resolved_store, request.dict())
    return customer

@router.get("/customers/{customer_id}", response_model=CustomerResponse, tags=["Customers"])
async def get_customer(
    customer_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get customer details"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    customer = await CustomerService.get_customer(customer_id, resolved_store)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=CustomerResponse, tags=["Customers"])
async def update_customer(
    customer_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    name: str = Body(...),
    phone: str = Body(...),
    email: Optional[str] = Body(None),
    address: Optional[str] = Body(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Update customer information"""
    customer = await CustomerService.update_customer(
        customer_id, 
        resolve_store_id(store_id, business_id, current_user),
        {
            "name": name, 
            "phone": phone,
            "email": email or "",
            "address": address or ""
        }
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/customers/{customer_id}", tags=["Customers"])
async def delete_customer(
    customer_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Delete customer"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    success = await CustomerService.delete_customer(customer_id, resolved_store)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}


@router.get("/customers/search/{query}", tags=["Customers"])
async def search_customers(
    query: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Search customers by name or phone"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    customers = await CustomerService.search_customers(resolved_store, query)
    return customers

@router.get("/customers/{customer_id}/history", tags=["Customers"])
async def get_customer_history(
    customer_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get customer purchase history"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    history = await CustomerService.get_customer_history(customer_id, resolved_store)
    return history


# ============ DEBT & PAYMENT ENDPOINTS ============
@router.get("/debts", response_model=List[DebtResponse], tags=["Debts"])
async def list_debts(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List customer debts"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    debts = await DebtService.list_debts(resolved_store, skip, limit)
    if status:
        debts = [d for d in debts if d.status == status]
    return debts

@router.post("/debts", response_model=DebtResponse, tags=["Debts"])
async def create_debt(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    customer_id: str = Body(...),
    order_id: str = Body(...),
    amount: float = Body(...),
    due_date: datetime = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Record customer debt"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    debt = await DebtService.create_debt(resolved_store, customer_id, order_id, amount, due_date)
    return debt

@router.post("/debts/{debt_id}/payment", tags=["Debts"])
async def pay_debt(
    debt_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    payment_amount: float = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Record debt payment"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    debt = await DebtService.record_debt_payment(debt_id, resolved_store, payment_amount)
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return debt

@router.get("/debts/summary", tags=["Debts"])
async def get_debt_summary(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get total debt summary"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    summary = await DebtService.get_debt_summary(resolved_store)
    return summary


# ============ REPORTS & ANALYTICS ============
@router.get("/reports/daily", tags=["Reports"])
async def get_daily_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    date: datetime = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Get daily sales report"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await ReportService.get_daily_report(resolved_store, date)
    return report

@router.get("/reports/monthly", tags=["Reports"])
async def get_monthly_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    year: int = Query(...),
    month: int = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Get monthly report"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await ReportService.get_monthly_report(resolved_store, year, month)
    return report

@router.get("/reports/revenue", tags=["Reports"])
async def get_revenue_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Get revenue report"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await ReportService.get_revenue_report(resolved_store, start_date, end_date)
    return report

@router.get("/reports/inventory", tags=["Reports"])
async def get_inventory_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get inventory report"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await ReportService.get_inventory_report(resolved_store)
    return report

@router.get("/reports/customers", tags=["Reports"])
async def get_customer_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get customer analytics"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await ReportService.get_customer_report(resolved_store)
    return report

@router.get("/reports/debt", tags=["Reports"])
async def get_debt_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get debt status report"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await DebtService.get_debt_summary(resolved_store)
    return report


# ============ BOOKKEEPING / ACCOUNTING (TT88-lite) ============
@router.get("/bookkeeping/journal", tags=["Bookkeeping"])
async def list_journal(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    entries = await AccountingService.list_journal_entries(resolved_store, start_date, end_date)
    return {"entries": entries, "total": len(entries)}


@router.post("/bookkeeping/journal", tags=["Bookkeeping"])
async def add_journal_entry(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    payload: dict = Body(...),
    current_user: dict = Depends(require_roles(["owner", "admin"]))
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    entry = await AccountingService.add_journal_entry(resolved_store, payload)
    return entry


@router.get("/bookkeeping/ledger", tags=["Bookkeeping"])
async def get_ledger(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    ledger = await AccountingService.ledger_summary(resolved_store)
    return {"ledger": ledger}


@router.get("/reports/accounting", tags=["Reports"])
async def accounting_report(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    report = await AccountingService.accounting_report(resolved_store, start_date, end_date)
    return report


# ============ DRAFT ORDERS (AI stub) ============
@router.get("/draft-orders", tags=["Draft Orders"])
async def list_draft_orders(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    drafts = await DraftOrderService.list_draft_orders(resolved_store)
    return {"draft_orders": drafts, "total": len(drafts)}


@router.post("/draft-orders", tags=["Draft Orders"])
async def create_draft_order_from_ai(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    raw_input = payload.get("input") or payload.get("speech_text") or ""
    draft = await DraftOrderService.create_draft_order(resolved_store, raw_input)
    draft.update({"customer_id": payload.get("customer_id")})
    return draft


@router.post("/draft-orders/{draft_id}/confirm", tags=["Draft Orders"])
async def confirm_draft_order(
    draft_id: str,
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    draft = await DraftOrderService.confirm_draft_order(draft_id, resolved_store)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft order not found")
    return draft


# ============ AI FEATURES ============
@router.post("/ai/draft-order", tags=["AI"])
async def create_draft_order(
    store_id: Optional[str] = Query(None),
    business_id: Optional[str] = Query(None),
    customer_id: str = Body(...),
    speech_text: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Create draft order from voice/text using AI"""
    resolved_store = resolve_store_id(store_id, business_id, current_user)
    draft = await DraftOrderService.create_draft_order(resolved_store, speech_text)
    draft.update({"customer_id": customer_id})
    return draft

@router.post("/ai/recommendations", tags=["AI"])
async def get_ai_recommendations(
    store_id: str = Query(...),
    customer_id: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Get AI recommendations for customer"""
    # TODO: Query customer history
    # TODO: Use ChromaDB for similar products
    # TODO: Apply collaborative filtering
    # TODO: Use LLM for personalized suggestions
    return {
        "products": [],
        "strategies": [],
        "insights": []
    }

@router.post("/ai/auto-categorize", tags=["AI"])
async def auto_categorize(
    store_id: str = Query(...),
    description: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Auto-categorize transaction using AI"""
    # TODO: Use LLM to analyze description
    # TODO: Suggest category and tags
    # TODO: Extract key information
    return {
        "category": "sales",
        "tags": [],
        "confidence": 0.92
    }

@router.post("/ai/price-suggestion", tags=["AI"])
async def suggest_price(
    store_id: str = Query(...),
    product_id: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Get AI suggested price for product"""
    # TODO: Query market data
    # TODO: Analyze competitor prices
    # TODO: Consider demand trends
    # TODO: Calculate optimal price
    return {
        "current_price": 0.0,
        "suggested_price": 0.0,
        "confidence": 0.85,
        "reasoning": ""
    }

@router.get("/ai/insights", tags=["AI"])
async def get_business_insights(
    store_id: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered business insights"""
    # TODO: Analyze sales trends
    # TODO: Identify opportunities
    # TODO: Detect anomalies
    # TODO: Predict future trends
    return {
        "insights": [],
        "alerts": [],
        "opportunities": []
    }

