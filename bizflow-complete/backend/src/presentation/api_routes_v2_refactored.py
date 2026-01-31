"""Refactored API Routes - Clean Architecture Version"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from ..infrastructure.database import get_session
from ..infrastructure.repositories import (
    UserRepository, ProductRepository, OrderRepository,
    CustomerRepository, DebtRepository, InventoryRepository
)
from ..application.use_cases import (
    LoginUseCase, RegisterUseCase,
    CreateProductUseCase, GetProductsUseCase, UpdateProductUseCase,
    CreateOrderUseCase, ConfirmOrderUseCase, GetOrdersUseCase,
    CreateCustomerUseCase, GetCustomersUseCase, UpdateCustomerUseCase,
    RecordDebtUseCase, PayDebtUseCase
)
from ..application.commands import (
    LoginCommand, RegisterCommand,
    CreateProductCommand, UpdateProductCommand, CreateOrderCommand, ConfirmOrderCommand,
    CreateCustomerCommand, UpdateCustomerCommand, RecordDebtCommand, PayDebtCommand
)
from ..application.responses import (
    LoginResponse, UserResponse, ProductResponse, OrderResponse,
    CustomerResponse, DebtResponse, AnalyticsResponse
)

router = APIRouter(tags=["API v2"])

# ============ DEPENDENCY INJECTION ============
async def get_current_user(
    session: AsyncSession = Depends(get_session),
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Get current authenticated user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    # TODO: Implement token validation
    # For now, return mock user
    return {
        "id": "user_123",
        "email": "admin@bizflow.com",
        "business_id": "biz_123",
        "role": "owner"
    }


async def get_business_id(current_user: dict = Depends(get_current_user)) -> str:
    """Extract business_id from current user"""
    business_id = current_user.get("business_id")
    if not business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business ID not found in user"
        )
    return business_id


# ============ AUTHENTICATION ENDPOINTS ============
@router.post("/auth/login", response_model=LoginResponse, tags=["Authentication"])
async def login(
    command: LoginCommand,
    session: AsyncSession = Depends(get_session)
):
    """User login"""
    try:
        user_repo = UserRepository(session)
        use_case = LoginUseCase(user_repo)
        user, token = await use_case.execute(command.email, command.password)
        
        return LoginResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                username=user.username,
                role=user.role.value,
                business_id=user.business_id,
                is_active=user.is_active,
                created_at=user.created_at
            )
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/auth/register", response_model=UserResponse, tags=["Authentication"])
async def register(
    command: RegisterCommand,
    session: AsyncSession = Depends(get_session)
):
    """User registration"""
    try:
        user_repo = UserRepository(session)
        use_case = RegisterUseCase(user_repo)
        user = await use_case.execute(
            email=command.email,
            password=command.password,
            full_name=command.full_name,
            business_id=command.business_id,
            username=command.username or ""
        )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            username=user.username,
            role=user.role.value,
            business_id=user.business_id,
            is_active=user.is_active,
            created_at=user.created_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PRODUCT ENDPOINTS ============
@router.post("/products", response_model=ProductResponse, tags=["Products"])
async def create_product(
    command: CreateProductCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create new product"""
    try:
        product_repo = ProductRepository(session)
        use_case = CreateProductUseCase(product_repo)
        
        product = await use_case.execute(
            business_id=command.business_id,
            name=command.name,
            sku=command.sku,
            price=command.price,
            cost=command.cost,
            description=command.description or "",
            category=command.category,
            barcode=command.barcode or "",
            units=command.units,
            quantity_in_stock=command.quantity_in_stock,
            unit_of_measure=command.unit_of_measure,
            min_quantity_alert=command.min_quantity_alert,
        )
        
        return ProductResponse.from_orm(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/products", response_model=List[ProductResponse], tags=["Products"])
async def get_products(
    business_id: str = Query(...),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get products"""
    try:
        product_repo = ProductRepository(session)
        use_case = GetProductsUseCase(product_repo)
        
        if category:
            products = await use_case.get_by_category(business_id, category, skip, limit)
        else:
            products = await use_case.get_all(business_id, skip, limit)
        
        return [ProductResponse.from_orm(p) for p in products]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
async def get_product(
    product_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get product by ID"""
    try:
        product_repo = ProductRepository(session)
        use_case = GetProductsUseCase(product_repo)
        
        product = await use_case.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return ProductResponse.from_orm(product)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
async def update_product(
    product_id: str,
    command: UpdateProductCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Update product"""
    try:
        product_repo = ProductRepository(session)
        use_case = UpdateProductUseCase(product_repo)
        
        product = await use_case.execute(
            product_id=product_id,
            business_id=command.business_id,
            name=command.name,
            sku=command.sku,
            price=command.price,
            cost=command.cost,
            description=command.description or "",
            category=command.category,
            barcode=command.barcode or "",
            units=command.units,
            quantity_in_stock=command.quantity_in_stock,
            unit_of_measure=command.unit_of_measure,
            min_quantity_alert=command.min_quantity_alert,
        )
        
        return ProductResponse.from_orm(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Products"])
async def delete_product(
    product_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Delete product"""
    try:
        product_repo = ProductRepository(session)
        deleted = await product_repo.delete(product_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ ORDER ENDPOINTS ============
@router.post("/orders", response_model=OrderResponse, tags=["Orders"])
async def create_order(
    command: CreateOrderCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create new order"""
    try:
        order_repo = OrderRepository(session)
        product_repo = ProductRepository(session)
        use_case = CreateOrderUseCase(order_repo, product_repo)
        
        order = await use_case.execute(
            business_id=command.business_id,
            employee_id=command.employee_id,
            customer_name=command.customer_name,
            items=command.items,
            customer_id=command.customer_id,
            is_credit=command.is_credit,
            notes=command.notes
        )
        
        return OrderResponse.from_orm(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/orders/{order_id}/confirm", response_model=OrderResponse, tags=["Orders"])
async def confirm_order(
    order_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Confirm order"""
    try:
        order_repo = OrderRepository(session)
        use_case = ConfirmOrderUseCase(order_repo)
        
        order = await use_case.execute(order_id)
        return OrderResponse.from_orm(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/orders", response_model=List[OrderResponse], tags=["Orders"])
async def get_orders(
    business_id: str = Query(...),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get orders"""
    try:
        order_repo = OrderRepository(session)
        use_case = GetOrdersUseCase(order_repo)
        
        if status:
            orders = await use_case.get_by_status(business_id, status, skip, limit)
        else:
            orders = await use_case.get_all(business_id, skip, limit)
        
        return [OrderResponse.from_orm(o) for o in orders]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/orders/{order_id}", response_model=OrderResponse, tags=["Orders"])
async def get_order(
    order_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get order by ID"""
    try:
        order_repo = OrderRepository(session)
        order = await order_repo.get_by_id(order_id)
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return OrderResponse.from_orm(order)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/orders/{business_id}/daily-revenue", tags=["Orders"])
async def get_daily_revenue(
    business_id: str,
    date: datetime = Query(...),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get daily revenue"""
    try:
        order_repo = OrderRepository(session)
        use_case = GetOrdersUseCase(order_repo)
        
        revenue = await use_case.get_daily_revenue(business_id, date)
        return {"date": date, "revenue": revenue}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ CUSTOMER ENDPOINTS ============
@router.post("/customers", response_model=CustomerResponse, tags=["Customers"])
async def create_customer(
    command: CreateCustomerCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Create new customer"""
    try:
        customer_repo = CustomerRepository(session)
        use_case = CreateCustomerUseCase(customer_repo)
        
        customer = await use_case.execute(
            business_id=command.business_id,
            name=command.name,
            phone=command.phone,
            email=command.email,
            address=command.address
        )
        
        return CustomerResponse.from_orm(customer)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/customers", response_model=List[CustomerResponse], tags=["Customers"])
async def get_customers(
    business_id: str = Query(...),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get customers"""
    try:
        customer_repo = CustomerRepository(session)
        use_case = GetCustomersUseCase(customer_repo)
        
        if search:
            customers = await use_case.search(business_id, search, skip, limit)
        else:
            customers = await use_case.get_all(business_id, skip, limit)
        
        return [CustomerResponse.from_orm(c) for c in customers]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/customers/top-debtors", response_model=List[CustomerResponse], tags=["Customers"])
async def get_top_debtors(
    business_id: str = Query(...),
    limit: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get top debtors"""
    try:
        customer_repo = CustomerRepository(session)
        use_case = GetCustomersUseCase(customer_repo)
        
        customers = await use_case.get_top_debtors(business_id, limit)
        return [CustomerResponse.from_orm(c) for c in customers]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/customers/{customer_id}", response_model=CustomerResponse, tags=["Customers"])
async def update_customer(
    customer_id: str,
    command: UpdateCustomerCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Update customer"""
    try:
        customer_repo = CustomerRepository(session)
        use_case = UpdateCustomerUseCase(customer_repo)
        
        customer = await use_case.execute(
            customer_id=customer_id,
            business_id=command.business_id,
            name=command.name,
            phone=command.phone or "",
            email=command.email or "",
            address=command.address or "",
        )
        return CustomerResponse.from_orm(customer)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ DEBT ENDPOINTS ============
@router.post("/debts", response_model=DebtResponse, tags=["Debts"])
async def record_debt(
    command: RecordDebtCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Record customer debt"""
    try:
        debt_repo = DebtRepository(session)
        customer_repo = CustomerRepository(session)
        use_case = RecordDebtUseCase(debt_repo, customer_repo)
        
        debt = await use_case.execute(
            business_id=command.business_id,
            customer_id=command.customer_id,
            order_id=command.order_id,
            amount=command.amount,
            due_date=command.due_date
        )
        
        return DebtResponse.from_orm(debt)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/debts/{debt_id}/pay", response_model=DebtResponse, tags=["Debts"])
async def pay_debt(
    debt_id: str,
    command: PayDebtCommand,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Pay debt"""
    try:
        debt_repo = DebtRepository(session)
        customer_repo = CustomerRepository(session)
        use_case = PayDebtUseCase(debt_repo, customer_repo)
        
        debt = await use_case.execute(debt_id, command.payment_amount)
        return DebtResponse.from_orm(debt)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/debts", response_model=List[DebtResponse], tags=["Debts"])
async def get_debts(
    business_id: str = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get debts"""
    try:
        debt_repo = DebtRepository(session)
        debts = await debt_repo.get_all_by_business(business_id, skip, limit)
        
        return [DebtResponse.from_orm(d) for d in debts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ ANALYTICS ENDPOINTS ============
@router.get("/analytics", response_model=AnalyticsResponse, tags=["Analytics"])
async def get_analytics(
    business_id: str = Query(...),
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    """Get business analytics"""
    try:
        order_repo = OrderRepository(session)
        customer_repo = CustomerRepository(session)
        debt_repo = DebtRepository(session)
        
        # Get data
        orders = await order_repo.get_all_by_business(business_id)
        customers = await customer_repo.get_all_by_business(business_id)
        total_debt = await debt_repo.get_total_outstanding_debt(business_id)
        
        # Calculate metrics
        completed_orders = [o for o in orders if o.status.value == "completed"]
        total_revenue = sum(o.total_amount for o in completed_orders)
        avg_order = total_revenue / len(completed_orders) if completed_orders else 0
        
        return AnalyticsResponse(
            total_revenue=total_revenue,
            total_orders=len(completed_orders),
            total_customers=len(customers),
            outstanding_debt=total_debt,
            average_order_value=avg_order
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
