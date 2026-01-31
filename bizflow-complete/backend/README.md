# BizFlow Backend - Clean Architecture

**Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh**

Backend API sử dụng FastAPI với kiến trúc Clean Architecture, hỗ trợ quản lý bán hàng, tồn kho, công nợ và tích hợp AI.

---

## 🚀 Chạy nhanh

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python -m uvicorn src.main:app --reload
```

✅ Truy cập API docs: http://localhost:8000/docs

---

## ✨ Tính năng

### Module Nhân viên
- ✅ Đăng nhập/Xác thực
- ✅ Tạo đơn hàng tại quầy
- ✅ Ghi nhận công nợ khách hàng
- ✅ In đơn hàng
- ✅ Nhận thông báo đơn hàng AI
- ✅ Xem và xác nhận đơn hàng AI

### Module Chủ hộ
- ✅ Tất cả chức năng nhân viên
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý tồn kho
- ✅ Quản lý khách hàng
- ✅ Xem báo cáo phân tích
- ✅ Quản lý tài khoản nhân viên

### Module AI
- ✅ Chuyển đổi ngôn ngữ tự nhiên sang đơn hàng
- ✅ Hỗ trợ giọng nói (Speech-to-text)
- ✅ Tự động hoàn thành với RAG

### Module Kế toán
- ✅ Ghi sổ tự động
- ✅ Tạo báo cáo (Thông tư 88/2021/TT-BTC)
- ✅ Phân tích tài chính

---

## 📁 Cấu trúc Dự án

```
backend/
├── src/
│   ├── domain/              # Business entities & repository interfaces
│   │   ├── entities.py      # Domain models (Product, Order, Customer, etc.)
│   │   └── repositories/    # Repository interfaces
│   │
│   ├── application/         # Business logic & use cases
│   │   ├── services.py      # Application services
│   │   ├── dtos.py         # Data Transfer Objects
│   │   ├── business_logic.py # Core business logic
│   │   └── use_cases/      # Specific use cases
│   │
│   ├── infrastructure/      # External implementations
│   │   ├── database.py     # Database configuration
│   │   ├── models.py       # SQLAlchemy ORM models
│   │   └── repositories/   # Concrete repository implementations
│   │
│   ├── presentation/        # API layer
│   │   ├── routes.py       # Main API routes
│   │   ├── dependencies.py # FastAPI dependencies
│   │   ├── validators.py   # Request validators
│   │   └── error_handlers.py # Exception handlers
│   │
│   ├── ai/                 # AI/ML services
│   │   └── services.py     # LLM integration
│   │
│   └── main.py             # FastAPI application entry point
│
├── tests/                  # Test suite
│   ├── test_auth.py
│   └── test_orders.py
│
├── scripts/                # Utility scripts
│   └── init_db.py         # Database initialization
│
└── requirements.txt        # Python dependencies
```

---

## 🔧 Cài đặt

### 1. Cài đặt Dependencies
```bash
pip install -r requirements.txt
```

### 2. Cấu hình Environment
```bash
# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
```

### 3. Khởi tạo Database
```bash
python scripts/init_db.py
```

### 4. Chạy Server
```bash
# Development mode (auto-reload)
uvicorn src.main:app --reload

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### 5. Truy cập API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🛠️ Công nghệ

- **Framework**: FastAPI
- **Database**: SQLite (demo), PostgreSQL/MySQL (production)
- **ORM**: SQLAlchemy
- **Auth**: JWT (python-jose)
- **AI/LLM**: OpenAI API, Gemini
- **Vector DB**: ChromaDB (RAG)
- **Speech**: Google Speech-to-Text, Whisper
- **Validation**: Pydantic
- **Testing**: pytest, pytest-asyncio

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký chủ hộ mới
- `POST /api/auth/refresh` - Làm mới token
- `POST /api/auth/logout` - Đăng xuất

### Products (Sản phẩm)
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm
- `GET /api/products/search?query=` - Tìm kiếm sản phẩm

### Orders (Đơn hàng)
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders/{id}/confirm` - Xác nhận đơn hàng
- `POST /api/orders/{id}/print` - In đơn hàng
- `GET /api/orders/{id}/items` - Chi tiết đơn hàng

### Customers (Khách hàng)
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/{id}` - Cập nhật khách hàng
- `GET /api/customers/{id}` - Chi tiết khách hàng
- `GET /api/customers/search?query=` - Tìm kiếm khách hàng

### Inventory (Tồn kho)
- `GET /api/inventory` - Danh sách tồn kho
- `POST /api/inventory/import` - Nhập hàng
- `PUT /api/inventory/{product_id}` - Cập nhật số lượng

### Debt Management (Quản lý công nợ)
- `GET /api/debts` - Danh sách công nợ
- `POST /api/debts` - Ghi nhận công nợ
- `PUT /api/debts/{id}/pay` - Ghi nhận thanh toán
- `GET /api/debts/outstanding` - Công nợ chưa thanh toán

### Draft Orders AI (Đơn hàng AI)
- `POST /api/draft-orders` - Tạo đơn từ ngôn ngữ tự nhiên
- `GET /api/draft-orders` - Danh sách đơn nháp
- `POST /api/draft-orders/{id}/confirm` - Xác nhận đơn nháp
- `POST /api/draft-orders/{id}/reject` - Từ chối đơn nháp
- `POST /api/draft-orders/voice` - Tạo đơn từ giọng nói

### Reports & Analytics (Báo cáo)
- `GET /api/analytics` - Dashboard analytics
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/inventory` - Báo cáo tồn kho
- `GET /api/reports/debt` - Báo cáo công nợ
- `GET /api/reports/accounting` - Báo cáo kế toán

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL=sqlite:///./bizflow.db
# hoặc PostgreSQL: postgresql+asyncpg://user:password@localhost/bizflow
# hoặc MySQL: mysql+aiomysql://user:password@localhost/bizflow

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/LLM (Optional - cho tính năng AI)
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-api-key

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

## 🧪 Testing

```bash
# Chạy tất cả tests
pytest tests/ -v

# Chạy tests với coverage
pytest tests/ --cov=src

# Chạy test cụ thể
pytest tests/test_auth.py -v
```

---

## 🚢 Deployment

### Docker
```bash
docker build -t bizflow-backend .
docker run -p 8000:8000 bizflow-backend
```

### Production
```bash
# Sử dụng Gunicorn với Uvicorn workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.main:app --bind 0.0.0.0:8000
```

---

## 📝 Ghi chú

- Sử dụng SQLite cho development và testing
- Khuyến nghị PostgreSQL/MySQL cho production
- Cấu hình CORS đã được thiết lập cho frontend
- JWT token expires sau 30 phút (có thể điều chỉnh)

---

**Cập nhật**: 31/01/2026
