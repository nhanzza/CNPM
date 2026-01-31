"""Application layer - Business logic and use cases"""
from datetime import datetime
from typing import List, Optional, Dict, Any
import secrets
from ..domain.entities import User, Product, Order, Customer, Debt, OrderItem
from ..infrastructure.models import (
    UserModel, ProductModel, OrderModel, CustomerModel,
    DebtModel, OrderItemModel
)

# Mock database for development
TOKEN_STORE: Dict[str, Dict[str, Any]] = {}

MOCK_USERS_DB = {
    "admin@bizflow.com": {
        "id": "user_123",
        "email": "admin@bizflow.com",
        "password": "Admin@123",
        "full_name": "Admin User",
        "role": "owner",
        "store_id": "store_123",
        "store_name": "BizFlow Store",
        "phone": "0123456789"
    },
    "employee@bizflow.com": {
        "id": "user_456",
        "email": "employee@bizflow.com",
        "password": "Admin@123",
        "full_name": "Employee User",
        "role": "employee",
        "store_id": "store_123",
        "store_name": "BizFlow Store",
        "phone": "0987654321"
    }
}

MOCK_PRODUCTS_DB = {
    "store_123": [
        {
            "id": "prod_001",
            "store_id": "store_123",
            "name": "Nước lọc 1.5L",
            "sku": "NL-1.5L",
            "category": "Thức uống",
            "price": 15000,
            "cost": 10000,
            "quantity_in_stock": 5000,
            "unit": "chai",
            "unit_of_measure": "chai",
            "description": "Nước lọc tinh khiết"
        },
        {
            "id": "prod_002",
            "store_id": "store_123",
            "name": "Bánh mì",
            "sku": "BM-001",
            "category": "Bánh",
            "price": 25000,
            "cost": 15000,
            "quantity_in_stock": 50,
            "unit": "chiếc",
            "unit_of_measure": "chiếc",
            "description": "Bánh mì tươi hàng ngày"
        },
        {
            "id": "prod_003",
            "store_id": "store_123",
            "name": "Phở",
            "sku": "PHO-001",
            "category": "Ăn liền",
            "price": 50000,
            "cost": 30000,
            "quantity_in_stock": 30,
            "unit": "bát",
            "unit_of_measure": "bát",
            "description": "Phở bò tươi ngon"
        },
        {
            "id": "prod_004",
            "store_id": "store_123",
            "name": "Nước ngọt",
            "sku": "NN-001",
            "category": "Thức uống",
            "price": 10000,
            "cost": 6000,
            "quantity_in_stock": 100,
            "unit": "lon",
            "unit_of_measure": "lon",
            "description": "Nước ngọt mát lạnh"
        },
        {
            "id": "prod_005",
            "store_id": "store_123",
            "name": "Cà phê",
            "sku": "CF-001",
            "category": "Thức uống",
            "price": 20000,
            "cost": 12000,
            "quantity_in_stock": 40,
            "unit": "ly",
            "unit_of_measure": "ly",
            "description": "Cà phê đen đậm đà"
        }
    ],
    "1": [
        {
            "id": "prod_001",
            "store_id": "1",
            "name": "Nước lọc 1.5L",
            "sku": "NL-1.5L",
            "category": "Thức uống",
            "price": 15000,
            "cost": 10000,
            "quantity_in_stock": 5000,
            "unit": "chai",
            "unit_of_measure": "chai",
            "description": "Nước lọc tinh khiết"
        },
        {
            "id": "prod_002",
            "store_id": "1",
            "name": "Bánh mì",
            "sku": "BM-001",
            "category": "Bánh",
            "price": 25000,
            "cost": 15000,
            "quantity_in_stock": 50,
            "unit": "chiếc",
            "unit_of_measure": "chiếc",
            "description": "Bánh mì tươi hàng ngày"
        },
        {
            "id": "prod_003",
            "store_id": "1",
            "name": "Phở",
            "sku": "PHO-001",
            "category": "Ăn liền",
            "price": 50000,
            "cost": 30000,
            "quantity_in_stock": 30,
            "unit": "bát",
            "unit_of_measure": "bát",
            "description": "Phở bò tươi ngon"
        },
        {
            "id": "prod_004",
            "store_id": "1",
            "name": "Nước ngọt",
            "sku": "NN-001",
            "category": "Thức uống",
            "price": 10000,
            "cost": 6000,
            "quantity_in_stock": 100,
            "unit": "lon",
            "unit_of_measure": "lon",
            "description": "Nước ngọt mát lạnh"
        },
        {
            "id": "prod_005",
            "store_id": "1",
            "name": "Cà phê",
            "sku": "CF-001",
            "category": "Thức uống",
            "price": 20000,
            "cost": 12000,
            "quantity_in_stock": 40,
            "unit": "ly",
            "unit_of_measure": "ly",
            "description": "Cà phê đen đậm đà"
        }
    ]
}

MOCK_CUSTOMERS_DB = {
    "store_123": [
        {
            "id": "cust_001",
            "store_id": "store_123",
            "name": "Nguyễn Văn A",
            "phone": "0912345678",
            "email": "a@gmail.com",
            "address": "123 Đường ABC, TP HCM",
            "type": "individual",
            "total_purchases": 9000000,
            "created_at": "2024-01-01"
        },
        {
            "id": "cust_002",
            "store_id": "store_123",
            "name": "Trần Thị B",
            "phone": "0987654321",
            "email": "b@gmail.com",
            "address": "456 Đường XYZ, TP HCM",
            "type": "individual",
            "total_purchases": 9000000,
            "created_at": "2024-01-05"
        }
    ],
    "1": [
        {
            "id": "cust_001",
            "store_id": "1",
            "name": "Nguyễn Văn A",
            "phone": "0912345678",
            "email": "a@gmail.com",
            "address": "123 Đường ABC, TP HCM",
            "type": "individual",
            "total_purchases": 9000000,
            "created_at": "2024-01-01",
            "total_debt": 0
        },
        {
            "id": "cust_002",
            "store_id": "1",
            "name": "Trần Thị B",
            "phone": "0987654321",
            "email": "b@gmail.com",
            "address": "456 Đường XYZ, TP HCM",
            "type": "individual",
            "total_purchases": 9000000,
            "created_at": "2024-01-05",
            "total_debt": 0
        }
    ]
}

MOCK_ORDERS_DB = {
    "store_123": [
        {
            "id": "ORD001",
            "order_number": "#001",
            "business_id": "store_123",
            "customer_id": "cust_001",
            "customer_name": "Nguyễn Văn A",
            "employee_id": "emp_001",
            "order_type": "retail",
            "status": "delivered",
            "items": [
                {
                    "id": "item_001",
                    "product_id": "prod_001",
                    "product_name": "Bánh mì",
                    "quantity": 2,
                    "unit": "cái",
                    "unit_price": 15000,
                    "subtotal": 30000
                },
                {
                    "id": "item_002",
                    "product_id": "prod_002",
                    "product_name": "Nước ngọt",
                    "quantity": 1,
                    "unit": "lon",
                    "unit_price": 10000,
                    "subtotal": 10000
                }
            ],
            "total_amount": 40000,
            "discount": 0,
            "is_credit": False,
            "payment_method": "cash",
            "payment_status": "paid",
            "notes": None,
            "created_at": "2026-01-15T10:30:00",
            "completed_at": "2026-01-15T11:00:00"
        },
        {
            "id": "ORD002",
            "order_number": "#002",
            "business_id": "store_123",
            "customer_id": "cust_002",
            "customer_name": "Trần Thị B",
            "employee_id": "emp_001",
            "order_type": "retail",
            "status": "delivered",
            "items": [
                {
                    "id": "item_003",
                    "product_id": "prod_002",
                    "product_name": "Phở",
                    "quantity": 1,
                    "unit": "bát",
                    "unit_price": 35000,
                    "subtotal": 35000
                }
            ],
            "total_amount": 35000,
            "discount": 0,
            "is_credit": False,
            "payment_method": "cash",
            "payment_status": "paid",
            "notes": None,
            "created_at": "2026-01-16T09:15:00",
            "completed_at": "2026-01-16T14:45:00"
        }
    ],
    "1": [
        {
            "id": "ORD001",
            "order_number": "#001",
            "business_id": "1",
            "customer_id": "cust_001",
            "customer_name": "Nguyễn Văn A",
            "employee_id": "emp_001",
            "order_type": "retail",
            "status": "delivered",
            "items": [
                {
                    "id": "item_001",
                    "product_id": "prod_001",
                    "product_name": "Bánh mì",
                    "quantity": 2,
                    "unit": "cái",
                    "unit_price": 15000,
                    "subtotal": 30000
                },
                {
                    "id": "item_002",
                    "product_id": "prod_002",
                    "product_name": "Nước ngọt",
                    "quantity": 1,
                    "unit": "lon",
                    "unit_price": 10000,
                    "subtotal": 10000
                }
            ],
            "total_amount": 40000,
            "discount": 0,
            "is_credit": False,
            "payment_method": "cash",
            "payment_status": "paid",
            "notes": None,
            "created_at": "2026-01-15T10:30:00",
            "completed_at": "2026-01-15T11:00:00"
        },
        {
            "id": "ORD002",
            "order_number": "#002",
            "business_id": "1",
            "customer_id": "cust_002",
            "customer_name": "Trần Thị B",
            "employee_id": "emp_001",
            "order_type": "retail",
            "status": "delivered",
            "items": [
                {
                    "id": "item_003",
                    "product_id": "prod_002",
                    "product_name": "Phở",
                    "quantity": 1,
                    "unit": "bát",
                    "unit_price": 35000,
                    "subtotal": 35000
                }
            ],
            "total_amount": 35000,
            "discount": 0,
            "is_credit": False,
            "payment_method": "cash",
            "payment_status": "paid",
            "notes": None,
            "created_at": "2026-01-16T09:15:00",
            "completed_at": "2026-01-16T14:45:00"
        }
    ]
}

MOCK_DEBTS_DB = {
    "store_123": [
        {
            "id": "debt_001",
            "store_id": "store_123",
            "customer_id": "cust_001",
            "amount": 500000,
            "created_at": "2024-01-01",
            "due_date": "2024-02-01",
            "status": "pending"  # pending, partial, paid
        }
    ]
}

# AI draft order and bookkeeping mock stores
MOCK_DRAFT_ORDERS_DB: Dict[str, List[Dict[str, Any]]] = {}
MOCK_JOURNAL_DB: Dict[str, List[Dict[str, Any]]] = {}

# Minimal chart of accounts for TT88-lite demos
CHART_OF_ACCOUNTS: Dict[str, str] = {
    "1000": "Tiền Mặt",
    "1100": "Tiền Gửi Ngân Hàng",
    "1200": "Hàng Tồn Kho",
    "2000": "Nợ Phải Trả",
    "3000": "Vốn Chủ Sở Hữu",
    "4000": "Doanh Thu Bán Hàng",
    "5000": "Giá Vốn Hàng Bán",
    "6000": "Chi Phí Nhân Công",
    "6100": "Chi Phí Vận Chuyển",
    "6200": "Chi Phí Khác"
}


class AuthService:
    """User authentication and authorization service"""
    
    @staticmethod
    def _issue_tokens(user: dict) -> dict:
        """Create short-lived mock tokens and persist in memory."""
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        TOKEN_STORE[access_token] = {
            **user,
            "token_type": "access"
        }
        TOKEN_STORE[refresh_token] = {
            **user,
            "token_type": "refresh"
        }
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    async def login(email: str, password: str) -> Optional[dict]:
        """Authenticate user with email and password."""
        email_lower = email.lower()

        # Check if user exists in mock database
        if email_lower in MOCK_USERS_DB:
            user = MOCK_USERS_DB[email_lower]
            # Check password (plain text for now, TODO: use bcrypt in production)
            if user["password"] == password:
                tokens = AuthService._issue_tokens(user)
                return {
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "full_name": user["full_name"],
                        "role": user["role"],
                        "store_id": user["store_id"],
                        "store_name": user.get("store_name", "Store"),
                        "phone": user["phone"]
                    },
                    **tokens
                }

        return None
    
    @staticmethod
    async def register(email: str, password: str, full_name: str,
                       phone: str, store_name: str) -> Optional[dict]:
        """Register new user"""
        email_lower = email.lower()
        
        # Check if email already exists
        if email_lower in MOCK_USERS_DB:
            return None  # Email already registered
        
        # Create new user in mock database
        user_id = f"user_{len(MOCK_USERS_DB) + 100}"
        store_id = f"store_{len(MOCK_USERS_DB) + 100}"
        
        new_user = {
            "id": user_id,
            "email": email_lower,
            "password": password,  # TODO: Hash with bcrypt in production
            "full_name": full_name,
            "role": "owner",  # New registrations are owners
            "store_id": store_id,
            "store_name": store_name,
            "phone": phone
        }
        
        # Save to mock database
        MOCK_USERS_DB[email_lower] = new_user
        
        # Initialize demo data for new store
        AuthService._initialize_store_data(store_id, store_name)
        
        tokens = AuthService._issue_tokens(new_user)

        return {
            "user": {
                "id": user_id,
                "email": email_lower,
                "full_name": full_name,
                "role": "owner",
                "store_id": store_id,
                "store_name": store_name,
                "phone": phone
            },
            **tokens
        }
    
    @staticmethod
    def _initialize_store_data(store_id: str, store_name: str):
        """Initialize demo data for new store"""
        # Create demo products
        MOCK_PRODUCTS_DB[store_id] = [
            {
                "id": f"prod_{store_id}_001",
                "store_id": store_id,
                "name": "Nước lọc 1.5L",
                "sku": "NL-1.5L",
                "category": "Thức uống",
                "price": 15000,
                "cost": 10000,
                "quantity_in_stock": 100,
                "unit": "chai",
                "unit_of_measure": "chai",
                "description": "Nước lọc tinh khiết"
            },
            {
                "id": f"prod_{store_id}_002",
                "store_id": store_id,
                "name": "Bánh mì",
                "sku": "BM-001",
                "category": "Bánh",
                "price": 25000,
                "cost": 15000,
                "quantity_in_stock": 50,
                "unit": "chiếc",
                "unit_of_measure": "chiếc",
                "description": "Bánh mì tươi hàng ngày"
            },
            {
                "id": f"prod_{store_id}_003",
                "store_id": store_id,
                "name": "Cà phê",
                "sku": "CF-001",
                "category": "Thức uống",
                "price": 20000,
                "cost": 12000,
                "quantity_in_stock": 40,
                "unit": "ly",
                "unit_of_measure": "ly",
                "description": "Cà phê đen đậm đà"
            }
        ]
        
        # Create demo customers
        MOCK_CUSTOMERS_DB[store_id] = [
            {
                "id": f"cust_{store_id}_001",
                "store_id": store_id,
                "name": "Khách hàng mẫu 1",
                "phone": "0912345678",
                "email": "khach1@example.com",
                "address": "123 Đường ABC",
                "type": "individual",
                "total_purchases": 0,
                "created_at": "2024-01-01",
                "total_debt": 0
            }
        ]
        
        # Initialize empty orders
        MOCK_ORDERS_DB[store_id] = []
        
        # Initialize empty debts
        MOCK_DEBTS_DB[store_id] = []
        
        # Initialize empty draft orders
        MOCK_DRAFT_ORDERS_DB[store_id] = []
        
        # Initialize empty journal entries
        MOCK_JOURNAL_DB[store_id] = []
    
    @staticmethod
    async def get_current_user(token: str) -> Optional[dict]:
        """Resolve user from issued token."""
        if not token or token == "Bearer":
            return None

        token = token.strip()
        user = TOKEN_STORE.get(token)
        if not user:
            return None

        return {
            "id": user.get("id"),
            "email": user.get("email"),
            "full_name": user.get("full_name"),
            "role": user.get("role", "employee"),
            "store_id": user.get("store_id"),
            "store_name": user.get("store_name", "Store"),
            "phone": user.get("phone", "")
        }

    @staticmethod
    async def refresh(refresh_token: str) -> Optional[dict]:
        """Issue a new access token using a stored refresh token."""
        user = TOKEN_STORE.get(refresh_token)
        if not user or user.get("token_type") != "refresh":
            return None
        tokens = AuthService._issue_tokens(user)
        return {"user": user, **tokens}

    @staticmethod
    async def request_password_reset(email: str) -> Optional[dict]:
        """Generate a password reset token for the given email.

        In this demo implementation, we don't send emails. Instead, we return
        the reset token so it can be used directly from the UI.
        """
        if not email:
            return None
        email_lower = email.lower()
        user = MOCK_USERS_DB.get(email_lower)
        # Always generate a token to avoid user enumeration patterns in real apps
        if not user:
            # Still generate a throwaway token for parity
            token = secrets.token_urlsafe(24)
            TOKEN_STORE[token] = {"token_type": "reset", "email": email_lower}
            return {"reset_token": token, "expires_in": 900}

        token = secrets.token_urlsafe(24)
        TOKEN_STORE[token] = {**user, "token_type": "reset", "email": email_lower}
        return {"reset_token": token, "expires_in": 900}

    @staticmethod
    async def reset_password(token: str, new_password: str) -> bool:
        """Reset a user's password using a previously issued token."""
        if not token or not new_password:
            return False
        payload = TOKEN_STORE.get(token)
        if not payload or payload.get("token_type") != "reset":
            return False

        email = payload.get("email")
        if not email or email not in MOCK_USERS_DB:
            return False

        # Update password (plain text for demo; hash in production)
        MOCK_USERS_DB[email]["password"] = new_password

        # Invalidate token after use
        try:
            del TOKEN_STORE[token]
        except Exception:
            pass

        return True


class ProductService:
    """Product management service"""
    
    @staticmethod
    async def list_products(store_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        """Get all products for a store"""
        products = MOCK_PRODUCTS_DB.get(store_id, [])
        return products[skip:skip+limit]
    
    @staticmethod
    async def get_product(product_id: str, store_id: str) -> Optional[dict]:
        """Get single product with details"""
        products = MOCK_PRODUCTS_DB.get(store_id, [])
        for product in products:
            if product["id"] == product_id:
                return product
        return None
    
    @staticmethod
    async def create_product(store_id: str, data: dict) -> dict:
        """Create new product"""
        if store_id not in MOCK_PRODUCTS_DB:
            MOCK_PRODUCTS_DB[store_id] = []
        
        # Generate ID
        product_id = f"prod_{len(MOCK_PRODUCTS_DB[store_id]) + 100}"
        
        product = {
            "id": product_id,
            "store_id": store_id,
            "name": data.get("name"),
            "sku": data.get("sku"),
            "category": data.get("category", ""),
            "price": float(data.get("price", 0)),
            "cost": float(data.get("cost", 0)),
            "quantity_in_stock": float(data.get("quantity_in_stock", 0)),
            "unit_of_measure": data.get("unit_of_measure", "cái"),
            "min_quantity_alert": float(data.get("min_quantity_alert", 0)),
            "description": data.get("description", ""),
            "created_at": datetime.now().isoformat()
        }
        
        MOCK_PRODUCTS_DB[store_id].append(product)
        return product
    
    @staticmethod
    async def update_product(product_id: str, store_id: str, data: dict) -> Optional[dict]:
        """Update product"""
        products = MOCK_PRODUCTS_DB.get(store_id, [])
        for i, product in enumerate(products):
            if product["id"] == product_id:
                # Update fields
                for key, value in data.items():
                    if key not in ["id", "store_id", "created_at"]:
                        product[key] = value
                MOCK_PRODUCTS_DB[store_id][i] = product
                return product
        return None
    
    @staticmethod
    async def delete_product(product_id: str, store_id: str) -> bool:
        """Delete product"""
        products = MOCK_PRODUCTS_DB.get(store_id, [])
        for i, product in enumerate(products):
            if product["id"] == product_id:
                del MOCK_PRODUCTS_DB[store_id][i]
                return True
        return False

    @staticmethod
    async def search_products(store_id: str, query: str) -> List[Product]:
        """Search products by name or SKU"""
        # TODO: Full-text search in database
        # TODO: Return matching products
        return []
    
    @staticmethod
    async def get_low_stock_products(store_id: str) -> List[Product]:
        """Get products below minimum stock"""
        # TODO: Query products where current_stock <= minimum_stock
        return []
    
    @staticmethod
    async def get_expiring_products(store_id: str, days: int = 30) -> List[Product]:
        """Get products expiring within days"""
        # TODO: Query from inventory
        # TODO: Filter by expiration date
        return []


class OrderService:
    """Order management service"""
    
    @staticmethod
    async def list_orders(store_id: str, skip: int = 0, limit: int = 50) -> List[Order]:
        """Get all orders for store"""
        # TODO: Query orders with status filter
        # TODO: Sort by date descending
        return []
    
    @staticmethod
    async def get_order(order_id: str, store_id: str) -> Optional[Order]:
        """Get order with items"""
        # TODO: Query order
        # TODO: Include order items with product info
        # TODO: Include customer info
        return None
    
    @staticmethod
    async def confirm_order(order_id: str, store_id: str) -> Order:
        """Confirm pending order"""
        # TODO: Query order
        # TODO: Verify status is pending
        # TODO: Update status to confirmed
        # TODO: Trigger notification
        return None
    
    @staticmethod
    async def ship_order(order_id: str, store_id: str, shipping_info: dict) -> Order:
        """Mark order as shipped"""
        # TODO: Update status
        # TODO: Record shipping details
        # TODO: Notify customer
        return None
    
    @staticmethod
    async def deliver_order(order_id: str, store_id: str) -> Order:
        """Mark order as delivered"""
        # TODO: Update status
        # TODO: Record delivery date
        # TODO: Close order
        return None
    
    @staticmethod
    async def cancel_order(order_id: str, store_id: str, reason: str) -> bool:
        """Cancel order and restore inventory"""
        # TODO: Verify status
        # TODO: Restore inventory quantities
        # TODO: Record cancellation reason
        # TODO: Update status to cancelled
        return True


class CustomerService:
    """Customer management service"""
    
    @staticmethod
    async def list_customers(store_id: str, skip: int = 0, limit: int = 50) -> List[Customer]:
        """Get all customers"""
        # TODO: Query from database
        # TODO: Include debt summary
        return []
    
    @staticmethod
    async def get_customer(customer_id: str, store_id: str) -> Optional[Customer]:
        """Get customer with details"""
        # TODO: Query customer
        # TODO: Include purchase history
        # TODO: Include total debt
        # TODO: Include payment history
        return None
    
    @staticmethod
    async def create_customer(store_id: str, data: dict) -> Customer:
        """Create new customer"""
        # TODO: Validate data
        # TODO: Check phone uniqueness
        # TODO: Create in database
        customer = Customer(
            id="cust_123",
            name=data.get("name"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address"),
            total_purchases=0,
            total_debt=0.0,
            store_id=store_id,
            created_at=datetime.now()
        )
        return customer
    
    @staticmethod
    async def update_customer(customer_id: str, store_id: str, data: dict) -> Customer:
        """Update customer info"""
        # TODO: Verify customer exists
        # TODO: Update in database
        return None
    
    @staticmethod
    async def search_customers(store_id: str, query: str) -> List[Customer]:
        """Search customers by name or phone"""
        # TODO: Full-text search
        return []
    
    @staticmethod
    async def get_customer_history(customer_id: str, store_id: str) -> dict:
        """Get customer purchase history"""
        # TODO: Query all orders from customer
        # TODO: Calculate statistics
        return {
            "total_orders": 0,
            "total_spent": 0.0,
            "last_order": None
        }


class DebtService:
    """Debt and credit management"""
    
    @staticmethod
    async def list_debts(store_id: str, skip: int = 0, limit: int = 50) -> List[Debt]:
        """Get all customer debts"""
        # TODO: Query from database
        # TODO: Filter by status
        # TODO: Sort by amount descending
        return []
    
    @staticmethod
    async def create_debt(store_id: str, customer_id: str, order_id: str, 
                         amount: float, due_date: datetime) -> Debt:
        """Record customer debt"""
        # TODO: Create debt entry
        # TODO: Link to order and customer
        return Debt(
            id="debt_123",
            customer_id=customer_id,
            order_id=order_id,
            amount=amount,
            paid_amount=0.0,
            status="unpaid",
            due_date=due_date,
            created_at=datetime.now(),
            store_id=store_id
        )
    
    @staticmethod
    async def record_debt_payment(debt_id: str, store_id: str, payment_amount: float) -> Debt:
        """Record payment toward debt"""
        # TODO: Create payment record
        # TODO: Update debt paid_amount
        # TODO: Mark as paid if complete
        return None
    
    @staticmethod
    async def get_debt_summary(store_id: str) -> dict:
        """Get total debt status"""
        # TODO: Sum all unpaid debts
        # TODO: Group by customer
        # TODO: Identify overdue
        return {
            "total_debt": 0.0,
            "overdue_debt": 0.0,
            "customer_count": 0
        }


class ReportService:
    """Analytics and reporting service"""
    
    @staticmethod
    async def get_daily_report(store_id: str, date: datetime) -> dict:
        """Get daily sales report"""
        # TODO: Query orders from date
        # TODO: Calculate revenue
        # TODO: Count transactions
        return {
            "date": date.isoformat(),
            "total_revenue": 0.0,
            "total_orders": 0,
            "total_items": 0,
            "total_customers": 0,
            "payment_methods": {}
        }
    
    @staticmethod
    async def get_monthly_report(store_id: str, year: int, month: int) -> dict:
        """Get monthly report"""
        # TODO: Query month data
        # TODO: Daily breakdown
        # TODO: Category breakdown
        return {}
    
    @staticmethod
    async def get_revenue_report(store_id: str, start_date: datetime, end_date: datetime) -> dict:
        """Get revenue summary"""
        # TODO: Query orders in range
        # TODO: Calculate total revenue
        # TODO: Calculate profit (revenue - cost)
        # TODO: Group by day/week/month
        return {
            "period": f"{start_date} to {end_date}",
            "total_revenue": 0.0,
            "total_cost": 0.0,
            "total_profit": 0.0
        }
    
    @staticmethod
    async def get_inventory_report(store_id: str) -> dict:
        """Get inventory status"""
        # TODO: Count total items
        # TODO: Calculate inventory value
        # TODO: Identify low stock
        # TODO: List slow-moving items
        return {
            "total_items": 0,
            "total_value": 0.0,
            "low_stock_count": 0
        }
    
    @staticmethod
    async def get_customer_report(store_id: str) -> dict:
        """Get customer analytics"""
        # TODO: Total customers
        # TODO: New customers this month
        # TODO: Top customers by spending
        # TODO: Customer retention
        return {}

# ============ CUSTOMER SERVICE ============
class CustomerService:
    @staticmethod
    async def list_customers(store_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        customers = MOCK_CUSTOMERS_DB.get(store_id, [])
        # Ensure response has all optional fields expected by CustomerResponse
        normalized = [CustomerService._normalize_customer(c, store_id) for c in customers]
        return normalized[skip:skip+limit]
    
    @staticmethod
    async def get_customer(customer_id: str, store_id: str) -> Optional[dict]:
        customers = MOCK_CUSTOMERS_DB.get(store_id, [])
        found = next((c for c in customers if c["id"] == customer_id), None)
        return CustomerService._normalize_customer(found, store_id) if found else None
    
    @staticmethod
    async def create_customer(store_id: str, data: dict) -> dict:
        if store_id not in MOCK_CUSTOMERS_DB:
            MOCK_CUSTOMERS_DB[store_id] = []
        customer_id = f"cust_{len(MOCK_CUSTOMERS_DB[store_id]) + 100}"
        customer = {
            "id": customer_id,
            "store_id": store_id,
            "name": data.get("name"),
            "phone": data.get("phone"),
            "email": data.get("email", ""),
            "address": data.get("address", ""),
            "type": data.get("type", "individual"),
            "total_purchases": 0,
            "outstanding_debt": data.get("outstanding_debt", 0.0),
            "total_transactions": data.get("total_transactions", 0),
            "is_active": data.get("is_active", True),
            "created_at": datetime.now().isoformat()
        }
        MOCK_CUSTOMERS_DB[store_id].append(customer)
        return CustomerService._normalize_customer(customer, store_id)
    
    @staticmethod
    async def update_customer(customer_id: str, store_id: str, data: dict) -> Optional[dict]:
        customers = MOCK_CUSTOMERS_DB.get(store_id, [])
        for i, customer in enumerate(customers):
            if customer["id"] == customer_id:
                customer.update({k: v for k, v in data.items() if k not in ["id", "store_id", "created_at"]})
                MOCK_CUSTOMERS_DB[store_id][i] = customer
                return CustomerService._normalize_customer(customer, store_id)
        return None
    
    @staticmethod
    async def delete_customer(customer_id: str, store_id: str) -> bool:
        customers = MOCK_CUSTOMERS_DB.get(store_id, [])
        for i, customer in enumerate(customers):
            if customer["id"] == customer_id:
                del MOCK_CUSTOMERS_DB[store_id][i]
                return True
        return False

    @staticmethod
    def _normalize_customer(customer: Optional[dict], store_id: str) -> Optional[dict]:
        """Add optional fields with defaults so response_model validation passes."""
        if not customer:
            return None
        
        # Auto-calculate outstanding_debt from unpaid orders
        customer_id = customer.get("id")
        calculated_debt = CustomerService._calculate_outstanding_debt(customer_id, store_id)
        total_purchases = CustomerService._calculate_total_purchases(customer_id, store_id)
        
        return {
            **customer,
            "business_id": customer.get("business_id", store_id),
            "outstanding_debt": calculated_debt,
            "total_transactions": customer.get("total_transactions", 0),
            "is_active": customer.get("is_active", True),
            # Derive total_purchases from paid orders to avoid stale mock values
            "total_purchases": total_purchases,
        }
    
    @staticmethod
    def _calculate_outstanding_debt(customer_id: str, store_id: str) -> float:
        """Calculate outstanding debt as sum of all unpaid orders (payment_status != 'paid')."""
        total_debt = 0.0
        orders = MOCK_ORDERS_DB.get(store_id, [])
        
        for order in orders:
            if order.get("customer_id") == customer_id:
                # Include any order that is NOT fully paid
                if order.get("payment_status") != "paid":
                    total_debt += order.get("total_amount", 0)
        
        return total_debt

    @staticmethod
    def _calculate_total_purchases(customer_id: str, store_id: str) -> float:
        """Sum of total_amount for all paid orders of the customer."""
        orders = MOCK_ORDERS_DB.get(store_id, [])
        return sum(
            order.get("total_amount", 0)
            for order in orders
            if order.get("customer_id") == customer_id and order.get("payment_status") == "paid"
        )


# ============ ORDER SERVICE ============
class OrderService:
    @staticmethod
    async def list_orders(store_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        return orders[skip:skip+limit]
    
    @staticmethod
    async def get_order(order_id: str, store_id: str) -> Optional[dict]:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        return next((o for o in orders if o["id"] == order_id), None)
    
    @staticmethod
    async def create_order(store_id: str, customer_id: str, items: list, **kwargs) -> dict:
        if store_id not in MOCK_ORDERS_DB:
            MOCK_ORDERS_DB[store_id] = []
        
        # Convert Pydantic models to dicts for easier processing
        items_list = []
        for item in items:
            if isinstance(item, dict):
                items_list.append(item)
            else:
                # Convert Pydantic model to dict
                items_list.append(item.dict() if hasattr(item, 'dict') else vars(item))
        
        # Generate order number and ID
        order_count = len(MOCK_ORDERS_DB[store_id]) + 1
        order_id = f"order_{order_count:03d}"
        order_number = f"ORD-{datetime.now().year}-{order_count:03d}"
        
        # Get product prices and build items
        products_in_store = MOCK_PRODUCTS_DB.get(store_id, [])
        processed_items = []
        total_amount = 0
        
        for i, item in enumerate(items_list):
            # Find product to get price
            product_price = 0
            product_name = item.get("product_name", "")
            for product in products_in_store:
                if product.get("id") == item.get("product_id"):
                    product_price = product.get("price", 0)
                    product_name = product.get("name", product_name)
                    break
            
            quantity = item.get("quantity", 0)
            subtotal = quantity * product_price
            total_amount += subtotal
            
            processed_items.append({
                "id": f"item_{i+1:03d}",
                "product_id": item.get("product_id", ""),
                "product_name": product_name,
                "quantity": quantity,
                "unit": item.get("unit", "cái"),
                "unit_price": product_price,
                "subtotal": subtotal
            })
        
        # Create order with all required fields
        order = {
            "id": order_id,
            "order_number": order_number,
            "business_id": store_id,
            "customer_id": customer_id,
            "customer_name": kwargs.get("customer_name", ""),
            "employee_id": kwargs.get("employee_id", "emp_001"),
            "order_type": kwargs.get("order_type", "counter"),
            "status": kwargs.get("status", "draft"),
            "items": processed_items,
            "total_amount": total_amount,
            "discount": kwargs.get("discount", 0),
            "is_credit": kwargs.get("is_credit", False),
            "payment_method": kwargs.get("payment_method", "cash"),
            "payment_status": kwargs.get("payment_status", "pending"),
            "notes": kwargs.get("notes"),
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        MOCK_ORDERS_DB[store_id].append(order)
        
        # Reduce inventory if payment is already made
        if kwargs.get("payment_status") == "paid":
            for item in items_list:
                product_id = item.get("product_id")
                quantity = item.get("quantity", 0)
                if product_id and store_id in MOCK_PRODUCTS_DB:
                    for product in MOCK_PRODUCTS_DB[store_id]:
                        if product.get("id") == product_id:
                            product["quantity_in_stock"] = product.get("quantity_in_stock", 0) - quantity
            
            # Update customer total_purchases
            if customer_id and store_id in MOCK_CUSTOMERS_DB:
                for customer in MOCK_CUSTOMERS_DB[store_id]:
                    if customer.get("id") == customer_id:
                        customer["total_purchases"] = customer.get("total_purchases", 0) + total_amount
                        break
        
        # outstanding_debt is auto-calculated from all unpaid orders, no need to manual update here
        
        return order
    
    @staticmethod
    async def update_order(order_id: str, store_id: str, data: dict) -> Optional[dict]:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        for i, order in enumerate(orders):
            if order["id"] == order_id:
                # Validate: Can only ship/deliver if payment_status is "paid"
                new_status = data.get("status", order.get("status"))
                new_payment_status = data.get("payment_status", order.get("payment_status"))
                
                print(f"=== UPDATE ORDER {order_id} ===")
                print(f"DEBUG: Current status={order.get('status')}, payment_status={order.get('payment_status')}")
                print(f"DEBUG: New status={new_status}, payment_status={new_payment_status}")
                print(f"DEBUG: Data received: {data}")
                
                # Shipping statuses that require payment
                shipping_statuses = ["confirmed", "shipped", "delivered"]
                
                if new_status in shipping_statuses and new_payment_status != "paid":
                    # If trying to change to shipping status without payment, reject or reset
                    print(f"WARNING: Trying to set shipping status {new_status} without payment - keeping old status {order.get('status')}")
                    data["status"] = order.get("status")  # Keep old status
                
                # Validate: Can only ship/deliver if customer has address
                if new_status in ["shipped", "delivered"]:
                    customer_id = data.get("customer_id", order.get("customer_id"))
                    customer = await CustomerService.get_customer(customer_id, store_id)
                    if not customer or not customer.get("address"):
                        # If customer has no address, keep old status
                        print(f"WARNING: Customer {customer_id} has no address - keeping old status {order.get('status')}")
                        data["status"] = order.get("status")
                
                # Handle payment status change to "paid"
                if data.get("payment_status") == "paid" and order.get("payment_status") != "paid":
                    # Reduce inventory for all order items
                    for item in order.get("items", []):
                        products = MOCK_PRODUCTS_DB.get(store_id, [])
                        for j, product in enumerate(products):
                            if product["id"] == item["product_id"]:
                                # Reduce quantity_in_stock
                                reduction = item.get("quantity", 0)
                                product["quantity_in_stock"] = max(0, product.get("quantity_in_stock", 0) - reduction)
                                MOCK_PRODUCTS_DB[store_id][j] = product
                                break
                    
                    # Update customer total_purchases
                    customer_id = data.get("customer_id", order.get("customer_id"))
                    if customer_id and store_id in MOCK_CUSTOMERS_DB:
                        for customer in MOCK_CUSTOMERS_DB[store_id]:
                            if customer.get("id") == customer_id:
                                amount = order.get("total_amount", 0)
                                customer["total_purchases"] = customer.get("total_purchases", 0) + amount
                                # outstanding_debt is auto-calculated from unpaid orders, no manual update needed
                                break
                
                # Update order with new data
                order.update({k: v for k, v in data.items() if k not in ["id", "store_id", "created_at"]})
                MOCK_ORDERS_DB[store_id][i] = order
                return order
        return None
    
    @staticmethod
    async def delete_order(order_id: str, store_id: str) -> bool:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        for i, order in enumerate(orders):
            if order["id"] == order_id:
                del MOCK_ORDERS_DB[store_id][i]
                return True
        return False


# ============ DEBT SERVICE ============
class DebtService:
    @staticmethod
    async def list_debts(store_id: str, skip: int = 0, limit: int = 50) -> List[dict]:
        debts = MOCK_DEBTS_DB.get(store_id, [])
        return debts[skip:skip+limit]
    
    @staticmethod
    async def get_debt(debt_id: str, store_id: str) -> Optional[dict]:
        debts = MOCK_DEBTS_DB.get(store_id, [])
        return next((d for d in debts if d["id"] == debt_id), None)
    
    @staticmethod
    async def create_debt(store_id: str, data: dict) -> dict:
        if store_id not in MOCK_DEBTS_DB:
            MOCK_DEBTS_DB[store_id] = []
        debt_id = f"debt_{len(MOCK_DEBTS_DB[store_id]) + 100}"
        debt = {
            "id": debt_id,
            "store_id": store_id,
            "customer_id": data.get("customer_id"),
            "amount": float(data.get("amount", 0)),
            "created_at": datetime.now().isoformat(),
            "due_date": data.get("due_date"),
            "status": "pending",
            "note": data.get("note", "")
        }
        MOCK_DEBTS_DB[store_id].append(debt)
        return debt
    
    @staticmethod
    async def update_debt(debt_id: str, store_id: str, data: dict) -> Optional[dict]:
        debts = MOCK_DEBTS_DB.get(store_id, [])
        for i, debt in enumerate(debts):
            if debt["id"] == debt_id:
                debt.update({k: v for k, v in data.items() if k not in ["id", "store_id", "created_at"]})
                MOCK_DEBTS_DB[store_id][i] = debt
                return debt
        return None
    
    @staticmethod
    async def delete_debt(debt_id: str, store_id: str) -> bool:
        debts = MOCK_DEBTS_DB.get(store_id, [])
        for i, debt in enumerate(debts):
            if debt["id"] == debt_id:
                del MOCK_DEBTS_DB[store_id][i]
                return True
        return False


# ============ REPORT SERVICE ============
class ReportService:
    @staticmethod
    async def get_daily_report(store_id: str, date: str) -> dict:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        daily_orders = [o for o in orders if o.get("created_at", "").startswith(date)]
        total_revenue = sum(o.get("total", 0) for o in daily_orders if o.get("status") == "completed")
        total_customers = len(set(o.get("customer_id") for o in daily_orders))
        customers = MOCK_CUSTOMERS_DB.get(store_id, [])
        total_debt = sum(c.get("debt", 0) for c in customers)
        return {
            "date": date,
            "metrics": {
                "total_revenue": total_revenue,
                "total_orders": len(daily_orders),
                "unique_customers": total_customers,
                "total_debt": total_debt
            }
        }
    
    @staticmethod
    async def get_monthly_report(store_id: str, year: int, month: int) -> dict:
        orders = MOCK_ORDERS_DB.get(store_id, [])
        month_str = f"{year}-{month:02d}"
        monthly_orders = [o for o in orders if o.get("created_at", "").startswith(month_str)]
        total_revenue = sum(o.get("total", 0) for o in monthly_orders if o.get("status") == "completed")
        return {
            "year": year,
            "month": month,
            "metrics": {
                "total_revenue": total_revenue,
                "total_orders": len(monthly_orders)
            }
        }


# ============ DRAFT ORDER SERVICE (AI stub) ============
class DraftOrderService:
    @staticmethod
    async def list_draft_orders(store_id: str) -> List[Dict[str, Any]]:
        return MOCK_DRAFT_ORDERS_DB.get(store_id, [])

    @staticmethod
    async def create_draft_order(store_id: str, raw_input: str) -> Dict[str, Any]:
        if store_id not in MOCK_DRAFT_ORDERS_DB:
            MOCK_DRAFT_ORDERS_DB[store_id] = []

        draft_id = f"draft_{len(MOCK_DRAFT_ORDERS_DB[store_id]) + 1:03d}"

        # Simple heuristic stub: always return two items so UI can render
        items = [
            {
                "product_id": "prod_001",
                "product_name": "Nước lọc 1.5L",
                "quantity": 1,
                "unit": "chai",
                "unit_price": 15000,
                "subtotal": 15000,
            },
            {
                "product_id": "prod_002",
                "product_name": "Bánh mì",
                "quantity": 2,
                "unit": "cái",
                "unit_price": 25000,
                "subtotal": 50000,
            },
        ]
        total_amount = sum(i.get("subtotal", 0) for i in items)

        draft = {
            "id": draft_id,
            "business_id": store_id,
            "customer_name": "Khách lẻ",
            "items": items,
            "total_amount": total_amount,
            "raw_input": raw_input,
            "confidence": 0.62,
            "is_confirmed": False,
            "is_rejected": False,
            "created_at": datetime.now().isoformat(),
        }

        MOCK_DRAFT_ORDERS_DB[store_id].append(draft)
        return draft

    @staticmethod
    async def confirm_draft_order(draft_id: str, store_id: str) -> Optional[Dict[str, Any]]:
        drafts = MOCK_DRAFT_ORDERS_DB.get(store_id, [])
        for draft in drafts:
            if draft.get("id") == draft_id:
                draft["is_confirmed"] = True
                draft["confirmed_at"] = datetime.now().isoformat()
                return draft
        return None


# ============ ACCOUNTING / BOOKKEEPING (TT88-lite) ============
class AccountingService:
    @staticmethod
    def _ensure_store(store_id: str):
        if store_id not in MOCK_JOURNAL_DB:
            MOCK_JOURNAL_DB[store_id] = []

    @staticmethod
    async def add_journal_entry(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        AccountingService._ensure_store(store_id)
        entry_id = f"entry_{len(MOCK_JOURNAL_DB[store_id]) + 1:05d}"
        debit = float(data.get("debit_amount", 0) or 0)
        credit = float(data.get("credit_amount", 0) or 0)

        entry = {
            "id": entry_id,
            "entry_date": data.get("entry_date") or datetime.now().date().isoformat(),
            "account_code": data.get("account_code"),
            "account_name": CHART_OF_ACCOUNTS.get(data.get("account_code", ""), ""),
            "description": data.get("description", ""),
            "debit_amount": debit,
            "credit_amount": credit,
            "reference_doc": data.get("reference_doc", ""),
            "created_at": datetime.now().isoformat(),
        }
        MOCK_JOURNAL_DB[store_id].insert(0, entry)
        return entry

    @staticmethod
    async def list_journal_entries(store_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        entries = MOCK_JOURNAL_DB.get(store_id, [])
        if not start_date and not end_date:
            return entries

        def within(entry):
            date_val = entry.get("entry_date", "")
            if start_date and date_val < start_date:
                return False
            if end_date and date_val > end_date:
                return False
            return True

        return [e for e in entries if within(e)]

    @staticmethod
    async def ledger_summary(store_id: str) -> List[Dict[str, Any]]:
        entries = MOCK_JOURNAL_DB.get(store_id, [])
        accounts: Dict[str, Dict[str, Any]] = {
            code: {
                "account_code": code,
                "account_name": name,
                "opening_balance": 0,
                "debits": 0,
                "credits": 0,
                "closing_balance": 0,
            }
            for code, name in CHART_OF_ACCOUNTS.items()
        }

        for entry in entries:
            code = entry.get("account_code")
            if code in accounts:
                accounts[code]["debits"] += float(entry.get("debit_amount", 0) or 0)
                accounts[code]["credits"] += float(entry.get("credit_amount", 0) or 0)

        for acc in accounts.values():
            acc["closing_balance"] = acc.get("opening_balance", 0) + acc.get("debits", 0) - acc.get("credits", 0)

        return list(accounts.values())

    @staticmethod
    async def accounting_report(store_id: str, start_date: Optional[str], end_date: Optional[str]) -> Dict[str, Any]:
        entries = await AccountingService.list_journal_entries(store_id, start_date, end_date)
        total_debits = sum(float(e.get("debit_amount", 0) or 0) for e in entries)
        total_credits = sum(float(e.get("credit_amount", 0) or 0) for e in entries)
        revenue = sum(float(e.get("credit_amount", 0) or 0) for e in entries if e.get("account_code") == "4000")
        cogs = sum(float(e.get("debit_amount", 0) or 0) for e in entries if e.get("account_code") == "5000")

        return {
            "period": {
                "start": start_date,
                "end": end_date,
            },
            "total_revenue": revenue,
            "total_expenses": cogs,
            "total_debits": total_debits,
            "total_credits": total_credits,
            "profit_loss": revenue - cogs,
            "entries_count": len(entries),
        }