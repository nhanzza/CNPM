# BizFlow Project Structure

## Overview

BizFlow is a comprehensive platform for digital transformation of household businesses in Vietnam. The project follows clean architecture principles and is divided into three main components: backend, web frontend, and mobile frontend.

## Directory Structure

```
doaan/
├── backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── core/              # Core configurations and utilities
│   │   │   ├── config.py      # Application settings
│   │   │   ├── database.py    # Database connections
│   │   │   ├── security.py    # Authentication & encryption
│   │   │   └── redis_client.py # Redis client
│   │   ├── domain/            # Domain models (SQLAlchemy)
│   │   │   └── models.py      # Database models
│   │   ├── application/       # Application layer (use cases)
│   │   │   └── schemas.py     # Pydantic schemas
│   │   ├── infrastructure/   # External services
│   │   │   ├── repositories/ # Data access layer
│   │   │   │   ├── user_repository.py
│   │   │   │   ├── product_repository.py
│   │   │   │   └── order_repository.py
│   │   │   └── ai/            # AI services
│   │   │       ├── nlp_service.py      # NLP for order parsing
│   │   │       └── bookkeeping_service.py # Auto bookkeeping
│   │   └── presentation/      # API layer
│   │       ├── dependencies.py # Auth dependencies
│   │       ├── routes/        # API routes
│   │       │   ├── auth.py
│   │       │   ├── orders.py
│   │       │   ├── products.py
│   │       │   ├── customers.py
│   │       │   ├── inventory.py
│   │       │   ├── ai.py
│   │       │   └── reports.py
│   │       └── main.py        # FastAPI app
│   ├── alembic.ini            # Database migration config
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Application entry point
│   └── env.example            # Environment variables template
│
├── frontend-web/              # Next.js Web Application
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── layout.tsx    # Root layout
│   │   │   ├── page.tsx      # Home page
│   │   │   ├── login/        # Login page
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── providers.tsx # React Query provider
│   │   │   └── globals.css   # Global styles
│   │   ├── components/       # React components
│   │   │   └── ui/           # UI components (Shadcn)
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts        # API client
│   │   │   └── utils.ts      # Helper functions
│   │   └── store/            # State management
│   │       └── auth-store.ts # Auth state (Zustand)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── frontend-mobile/           # Flutter Mobile Application
│   ├── lib/
│   │   ├── main.dart         # App entry point
│   │   ├── models/           # Data models
│   │   │   └── user.dart
│   │   ├── providers/        # State management
│   │   │   └── auth_provider.dart
│   │   ├── screens/          # UI screens
│   │   │   ├── login_screen.dart
│   │   │   ├── dashboard_screen.dart
│   │   │   ├── orders_screen.dart
│   │   │   └── products_screen.dart
│   │   └── services/         # Services
│   │       ├── api_service.dart
│   │       └── notification_service.dart
│   └── pubspec.yaml
│
├── docker-compose.yml         # Docker services (MySQL, PostgreSQL, Redis)
├── README.md                  # Main project documentation
├── SETUP.md                   # Setup instructions
└── .gitignore                 # Git ignore rules
```

## Architecture

### Backend (Clean Architecture)

1. **Domain Layer** (`app/domain/`)
   - Contains business entities (SQLAlchemy models)
   - No dependencies on other layers
   - Pure business logic

2. **Application Layer** (`app/application/`)
   - Use cases and business logic
   - Pydantic schemas for data validation
   - Interfaces for repositories

3. **Infrastructure Layer** (`app/infrastructure/`)
   - Repository implementations
   - External services (AI, Redis, etc.)
   - Database access

4. **Presentation Layer** (`app/presentation/`)
   - FastAPI routes
   - Request/response handling
   - Authentication middleware

### Frontend Web (Next.js)

- **App Router**: Using Next.js 14 App Router
- **State Management**: Zustand for auth, Tanstack Query for server state
- **UI Components**: Shadcn UI with TailwindCSS
- **API Client**: Axios with interceptors

### Frontend Mobile (Flutter)

- **State Management**: Provider pattern
- **HTTP Client**: Dio with interceptors
- **Notifications**: Firebase Cloud Messaging
- **Local Storage**: SharedPreferences

## Key Features

### Employee Features
- Login system
- Create at-counter orders
- Print sales orders
- Record customer debt
- Real-time notifications
- View and confirm AI draft orders

### Owner Features
- All employee features
- Product catalog management
- Inventory management
- Customer management
- Reports and analytics
- Employee account management

### Administrator Features
- Owner account management
- Subscription pricing management
- Platform analytics
- System configuration

### System Features
- Natural language to draft order conversion (AI)
- Automatic bookkeeping (Circular 88/2021/TT-BTC)
- Real-time notifications
- Multi-channel orders (counter + phone/Zalo)

## Database Schema

### MySQL (Main Database)
- Users
- Businesses
- Products
- Product Units
- Customers
- Orders
- Order Items
- Inventory
- Inventory Transactions
- Debts
- Debt Payments
- Accounting Transactions
- Subscription Plans

### PostgreSQL (Analytics)
- Used for reporting and analytics (can be extended)

### Redis (Cache)
- Session storage
- Real-time notifications
- API rate limiting

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/drafts` - Get draft orders
- `GET /api/orders/{id}` - Get order
- `PATCH /api/orders/{id}` - Update order

### Products
- `POST /api/products` - Create product
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product
- `PATCH /api/products/{id}` - Update product

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - List customers
- `GET /api/customers/{id}` - Get customer
- `PATCH /api/customers/{id}` - Update customer

### Inventory
- `GET /api/inventory` - Get inventory
- `POST /api/inventory/import` - Import stock

### AI
- `POST /api/ai/parse-order` - Parse text to order
- `POST /api/ai/create-draft-order` - Create draft from text
- `POST /api/ai/speech-to-text` - Convert speech to text

### Reports
- `GET /api/reports/revenue-ledger` - Revenue ledger
- `GET /api/reports/outstanding-debt` - Outstanding debt
- `GET /api/reports/business-operations` - Business operations report

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: MySQL, PostgreSQL
- **Cache**: Redis
- **ORM**: SQLAlchemy
- **AI**: OpenAI, ChromaDB, Whisper

### Frontend Web
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI**: Shadcn UI
- **State**: Zustand, Tanstack Query

### Frontend Mobile
- **Framework**: Flutter
- **Language**: Dart
- **State**: Provider
- **Notifications**: Firebase

## Development Workflow

1. Start databases: `docker-compose up -d`
2. Setup backend: Install dependencies, configure .env, run migrations
3. Setup web frontend: Install dependencies, configure .env.local
4. Setup mobile frontend: Run `flutter pub get`
5. Start development servers
6. Access API docs at `http://localhost:8000/api/docs`

## Next Steps

1. Implement database migrations with Alembic
2. Add comprehensive error handling
3. Implement real-time notifications (WebSocket)
4. Add unit and integration tests
5. Implement print functionality
6. Complete mobile app screens
7. Add more UI components
8. Implement file upload for product images
9. Add comprehensive logging
10. Set up CI/CD pipeline

