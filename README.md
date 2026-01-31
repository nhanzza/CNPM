# BizFlow - Hệ thống Quản lý Hộ Kinh Doanh

**Digital Transformation Platform for Household Businesses**

Nền tảng chuyển đổi số toàn diện cho hộ kinh doanh, hỗ trợ quản lý bán hàng, tồn kho, công nợ và kế toán tự động.

---

## Hướng dẫn Chạy nhanh

### 1. Backend (FastAPI + Python)
```bash
cd bizflow-complete/backend
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
```
✅ Truy cập: http://localhost:8000/docs

### 2. Web Frontend (Next.js + React)
```bash
cd bizflow-complete/web
npm install
npm run dev
```
✅ Truy cập: http://localhost:3000

---

## Cấu trúc Dự án

```
bizflow-complete/
├── backend/                    # Python FastAPI Backend
│   ├── src/
│   │   ├── domain/            # Business entities & repositories
│   │   ├── application/       # Use cases & business logic
│   │   ├── infrastructure/    # Database & ORM models
│   │   ├── presentation/      # API routes & validators
│   │   ├── ai/               # AI/LLM services
│   │   └── main.py           # FastAPI application
│   ├── tests/                # Unit & integration tests
│   ├── scripts/              # Database init & utilities
│   └── requirements.txt      # Python dependencies
│
└── web/                       # Next.js Web Frontend
    ├── src/
    │   ├── app/              # Next.js App Router (pages)
    │   ├── components/       # React components (UI & providers)
    │   ├── hooks/            # Custom React hooks
    │   ├── services/         # API clients & services
    │   ├── store/            # Zustand state management
    │   └── types/            # TypeScript type definitions
    ├── public/               # Static assets
    └── package.json          # Node.js dependencies
```

---

## Tính năng Chính

### Dành cho Nhân viên
- ✅ Đăng nhập & xác thực
- ✅ Tạo đơn hàng bán tại quầy
- ✅ Quản lý công nợ khách hàng
- ✅ In đơn hàng
- ✅ Nhận thông báo đơn hàng từ AI
- ✅ Xem và xác nhận đơn hàng AI

### Dành cho Chủ hộ kinh doanh
- ✅ Tất cả chức năng của nhân viên
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý tồn kho (nhập/xuất)
- ✅ Quản lý khách hàng
- ✅ Xem báo cáo và phân tích
- ✅ Quản lý tài khoản nhân viên

### Tính năng AI
- ✅ Tạo đơn hàng từ ngôn ngữ tự nhiên
- ✅ Chuyển giọng nói thành văn bản
- ✅ Tự động hoàn thành với RAG
- ✅ Tìm kiếm sản phẩm thông minh

### Kế toán Tự động
- ✅ Ghi sổ tự động
- ✅ Báo cáo thuế (Thông tư 88/2021/TT-BTC)
- ✅ Phân tích tài chính
- ✅ Theo dõi công nợ

---
## 🛠️ Công nghệ Sử dụng

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (demo), PostgreSQL/MySQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **AI/LLM**: OpenAI API, Google Gemini
- **Vector DB**: ChromaDB (RAG)
- **Speech-to-Text**: Google Speech API, Whisper
- **Validation**: Pydantic

### Web Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Chart.js, Recharts
- **Forms**: React Hook Form

---

## Tài liệu API

- **Swagger UI**: http://localhost:8000/docs (Interactive API docs)
- **ReDoc**: http://localhost:8000/redoc (API documentation)

### Các endpoint chính:
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký chủ hộ
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Thêm sản phẩm mới
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/inventory/import` - Nhập hàng

---

## Cấu hình

### Backend (.env)
```env
DATABASE_URL=sqlite:///./bizflow.db
JWT_SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-key
ENVIRONMENT=development
```

### Web Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=BizFlow
```

---

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Web Tests
```bash
cd web
npm test

**Cập nhật lần cuối**: 31/01/2026

