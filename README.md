BizFlow – Household Business Management System

Digital Transformation Platform for Household Businesses

An all-in-one digital transformation platform for household businesses, supporting sales management, inventory, receivables, and automated accounting.

Quick Start Guide
1. Backend (FastAPI + Python)
cd bizflow-complete/backend
pip install -r requirements.txt
python -m uvicorn src.main:app --reload


✅ Access: http://localhost:8000/docs

2. Web Frontend (Next.js + React)
cd bizflow-complete/web
npm install
npm run dev


✅ Access: http://localhost:3000

Project Structure
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
│   ├── scripts/              # Database initialization & utilities
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

Key Features
For Staff

✅ Login & authentication
✅ Create counter sales orders
✅ Manage customer receivables
✅ Print invoices
✅ Receive AI-generated order notifications
✅ Review and confirm AI-generated orders

For Business Owners

✅ All staff features
✅ Product catalog management
✅ Inventory management (import/export)
✅ Customer management
✅ Reports and analytics
✅ Staff account management

AI Features

✅ Create orders from natural language
✅ Speech-to-text conversion
✅ Auto-completion with RAG
✅ Intelligent product search

Automated Accounting

✅ Automatic bookkeeping
✅ Tax reports (Circular 88/2021/TT-BTC – Vietnam)
✅ Financial analysis
✅ Receivables tracking

🛠️ Technology Stack
Backend

Framework: FastAPI

Database: SQLite (demo), PostgreSQL/MySQL (production)

ORM: SQLAlchemy

Authentication: JWT (python-jose)

AI/LLM: OpenAI API, Google Gemini

Vector DB: ChromaDB (RAG)

Speech-to-Text: Google Speech API, Whisper

Validation: Pydantic

Web Frontend

Framework: Next.js 14 (App Router)

UI Library: React 18

Language: TypeScript

State Management: Zustand

Styling: Tailwind CSS

HTTP Client: Axios

Charts: Chart.js, Recharts

Forms: React Hook Form

API Documentation

Swagger UI: http://localhost:8000/docs
 (Interactive API docs)

ReDoc: http://localhost:8000/redoc
 (API documentation)

Main Endpoints

POST /api/auth/login – Login

POST /api/auth/register – Register business owner

GET /api/products – Get product list

POST /api/products – Add new product

GET /api/orders – Get orders

POST /api/orders – Create new order

GET /api/customers – Get customer list

POST /api/inventory/import – Import inventory

Configuration
Backend (.env)
DATABASE_URL=sqlite:///./bizflow.db
JWT_SECRET_KEY=your-super-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-key
ENVIRONMENT=development

Web Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=BizFlow

Testing
Backend Tests
cd backend
pytest tests/ -v

Web Tests
cd web
npm test


**Cập nhật lần cuối**: 31/01/2026


