"""Product, Customer, Order, Debt endpoints"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List
from ..application.business_logic import (
    AuthService, ProductService, CustomerService, OrderService, 
    DebtService, ReportService, MOCK_PRODUCTS_DB,
    MOCK_CUSTOMERS_DB, MOCK_ORDERS_DB, MOCK_DEBTS_DB
)
from ..application.dtos import LoginRequest, RegisterRequest, ProductCreateRequest

router = APIRouter()

# ============ AUTHENTICATION ============
@router.post("/auth/login", tags=["Authentication"])
async def login(request: LoginRequest):
    """User login"""
    result = await AuthService.login(request.email, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result

@router.post("/auth/register", tags=["Authentication"])
async def register(request: RegisterRequest):
    """User register"""
    result = await AuthService.register(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        phone=request.phone,
        store_name=request.store_name
    )
    if not result:
        raise HTTPException(status_code=400, detail="Registration failed")
    return result

# ============ PRODUCTS ============
@router.get("/products", tags=["Products"])
async def list_products(store_id: str = Query(...), skip: int = Query(0), limit: int = Query(50)):
    """List all products"""
    products = await ProductService.list_products(store_id, skip, limit)
    return {"products": products, "total": len(MOCK_PRODUCTS_DB.get(store_id, []))}

@router.get("/products/{product_id}", tags=["Products"])
async def get_product(product_id: str, store_id: str = Query(...)):
    """Get single product"""
    product = await ProductService.get_product(product_id, store_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", tags=["Products"])
async def create_product(request: ProductCreateRequest, store_id: str = Query(...)):
    """Create new product"""
    product = await ProductService.create_product(store_id, request.dict())
    return product

@router.put("/products/{product_id}", tags=["Products"])
async def update_product(product_id: str, request: ProductCreateRequest, store_id: str = Query(...)):
    """Update product"""
    product = await ProductService.update_product(product_id, store_id, request.dict())
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/products/{product_id}", tags=["Products"])
async def delete_product(product_id: str, store_id: str = Query(...)):
    """Delete product"""
    success = await ProductService.delete_product(product_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ============ CUSTOMERS ============
@router.get("/customers", tags=["Customers"])
async def list_customers(store_id: str = Query(...), skip: int = Query(0), limit: int = Query(50)):
    """List all customers"""
    customers = await CustomerService.list_customers(store_id, skip, limit)
    return {"customers": customers, "total": len(MOCK_CUSTOMERS_DB.get(store_id, []))}

@router.get("/customers/{customer_id}", tags=["Customers"])
async def get_customer(customer_id: str, store_id: str = Query(...)):
    """Get single customer"""
    customer = await CustomerService.get_customer(customer_id, store_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/customers", tags=["Customers"])
async def create_customer(request: dict, store_id: str = Query(...)):
    """Create new customer"""
    customer = await CustomerService.create_customer(store_id, request)
    return customer

@router.put("/customers/{customer_id}", tags=["Customers"])
async def update_customer(customer_id: str, request: dict, store_id: str = Query(...)):
    """Update customer"""
    customer = await CustomerService.update_customer(customer_id, store_id, request)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.delete("/customers/{customer_id}", tags=["Customers"])
async def delete_customer(customer_id: str, store_id: str = Query(...)):
    """Delete customer"""
    success = await CustomerService.delete_customer(customer_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}

# ============ ORDERS ============
@router.get("/orders", tags=["Orders"])
async def list_orders(store_id: str = Query(...), skip: int = Query(0), limit: int = Query(50), status: str = Query(None)):
    """List all orders with optional status filter"""
    orders = await OrderService.list_orders(store_id, skip, limit)
    
    # Filter by status if provided
    if status:
        orders = [o for o in orders if o.get("status") == status]
    
    return {"orders": orders, "total": len(orders)}

@router.get("/orders/{order_id}", tags=["Orders"])
async def get_order(order_id: str, store_id: str = Query(...)):
    """Get single order"""
    order = await OrderService.get_order(order_id, store_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders", tags=["Orders"])
async def create_order(request: dict = Body(...), store_id: str = Query(...)):
    """Create new order"""
    print(f"DEBUG: Received request body: {request}")
    print(f"DEBUG: Received status: {request.get('status')}")
    order = await OrderService.create_order(
        store_id=store_id,
        customer_id=request.get("customer_id"),
        items=request.get("items", []),
        customer_name=request.get("customer_name"),
        order_type=request.get("order_type", "counter"),
        status=request.get("status", "draft"),
        discount=request.get("discount", 0),
        is_credit=request.get("is_credit", False),
        payment_method=request.get("payment_method", "cash"),
        payment_status=request.get("payment_status", "pending"),
        notes=request.get("notes")
    )
    print(f"DEBUG: Created order with status: {order.get('status')}")
    return order

@router.put("/orders/{order_id}", tags=["Orders"])
async def update_order(order_id: str, request: dict = Body(...), store_id: str = Query(...)):
    """Update order status"""
    order = await OrderService.update_order(order_id, store_id, request)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.delete("/orders/{order_id}", tags=["Orders"])
async def delete_order(order_id: str, store_id: str = Query(...)):
    """Delete order"""
    success = await OrderService.delete_order(order_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

# ============ DEBTS ============
@router.get("/debts", tags=["Debts"])
async def list_debts(store_id: str, skip: int = 0, limit: int = 50):
    """List all debts"""
    debts = await DebtService.list_debts(store_id, skip, limit)
    return {"debts": debts, "total": len(MOCK_DEBTS_DB.get(store_id, []))}

@router.get("/debts/{debt_id}", tags=["Debts"])
async def get_debt(debt_id: str, store_id: str):
    """Get single debt"""
    debt = await DebtService.get_debt(debt_id, store_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return debt

@router.post("/debts", tags=["Debts"])
async def create_debt(store_id: str, customer_id: str, amount: float, due_date: str = "", note: str = ""):
    """Create new debt record"""
    debt = await DebtService.create_debt(store_id, {
        "customer_id": customer_id,
        "amount": amount,
        "due_date": due_date,
        "note": note
    })
    return debt

@router.put("/debts/{debt_id}", tags=["Debts"])
async def update_debt(debt_id: str, store_id: str, status: str = None, amount: float = None):
    """Update debt"""
    data = {}
    if status: data["status"] = status
    if amount is not None: data["amount"] = amount
    
    debt = await DebtService.update_debt(debt_id, store_id, data)
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return debt

@router.delete("/debts/{debt_id}", tags=["Debts"])
async def delete_debt(debt_id: str, store_id: str):
    """Delete debt"""
    success = await DebtService.delete_debt(debt_id, store_id)
    if not success:
        raise HTTPException(status_code=404, detail="Debt not found")
    return {"message": "Debt deleted"}

# ============ EMPLOYEE MANAGEMENT ============
@router.get("/users", tags=["Employee Management"])
async def list_employees(store_id: str):
    """Get all employees for a store"""
    # For now, return mock data - would connect to users table
    mock_users = [
        {
            "id": "user_001",
            "name": "Nguyễn Văn B (Nhân Viên)",
            "email": "employee@bizflow.local",
            "phone": "0912345670",
            "role": "employee",
            "status": "active",
            "created_at": "2024-01-10"
        }
    ]
    return {"users": mock_users, "total": len(mock_users)}

@router.post("/users", tags=["Employee Management"])
async def create_employee(store_id: str = Body(...), name: str = Body(...), 
                         email: str = Body(...), phone: str = Body(None),
                         password: str = Body(...), role: str = Body(...),
                         status: str = Body(...)):
    """Create new employee"""
    # TODO: Save to database, hash password
    employee = {
        "id": f"user_{len([]) + 1:03d}",
        "name": name,
        "email": email,
        "phone": phone,
        "role": role,
        "status": status,
        "created_at": "2024-01-20"
    }
    return {"message": "Employee created", "employee": employee}

@router.put("/users/{user_id}", tags=["Employee Management"])
async def update_employee(user_id: str, store_id: str = Body(...), 
                         name: str = Body(...), email: str = Body(...),
                         phone: str = Body(None), role: str = Body(...),
                         status: str = Body(...)):
    """Update employee info"""
    # TODO: Update in database
    return {"message": "Employee updated", "user_id": user_id}

@router.put("/users/{user_id}/password", tags=["Employee Management"])
async def reset_password(user_id: str, store_id: str = Body(...),
                        new_password: str = Body(...)):
    """Reset employee password"""
    # TODO: Update password in database, hash it
    return {"message": "Password reset", "user_id": user_id}

@router.delete("/users/{user_id}", tags=["Employee Management"])
async def delete_employee(user_id: str, store_id: str):
    """Delete employee"""
    # TODO: Delete from database
    return {"message": "Employee deleted", "user_id": user_id}

    """Get daily report"""
    report = await ReportService.get_daily_report(store_id, date)
    return report

@router.get("/reports/monthly", tags=["Reports"])
async def get_monthly_report(store_id: str, year: int, month: int):
    """Get monthly report"""
    report = await ReportService.get_monthly_report(store_id, year, month)
    return report
