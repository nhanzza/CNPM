# BizFlow - Platform for Digital Transformation of Household Businesses

**English**: Platform to support digital transformation for household businesses.

**Vietnamese**: Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh.

## Project Structure

```
doaan/
├── backend/              # Python backend with clean architecture
│   ├── app/
│   │   ├── core/        # Core configurations
│   │   ├── domain/      # Domain models
│   │   ├── application/ # Use cases
│   │   ├── infrastructure/ # External services, repositories
│   │   └── presentation/ # API routes
│   ├── tests/
│   └── requirements.txt
├── frontend-web/         # Next.js web application
│   ├── src/
│   ├── public/
│   └── package.json
├── frontend-mobile/      # Flutter mobile application
│   ├── lib/
│   └── pubspec.yaml
├── docker-compose.yml    # Docker setup for databases
└── README.md
```

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Architecture**: Clean Architecture
- **Databases**: MySQL, PostgreSQL
- **Cache**: Redis
- **AI**: 
  - RAG: ChromaDB, text-embedding-3-small
  - LLM: OpenAI/Gemini
  - Speech-to-Text: Google Speech-to-Text/Whisper

### Frontend Web
- **Framework**: Next.js
- **State Management**: Tanstack Query
- **UI Components**: Shadcn UI
- **Styling**: TailwindCSS

### Frontend Mobile
- **Framework**: Flutter
- **Notifications**: Firebase Cloud Messaging

## Features

### Employee
- Login system
- Create at-counter orders
- Print sales orders
- Record customer debt
- Real-time notifications
- View and confirm AI draft orders

### Owner
- All Employee features
- Product catalog management
- Inventory management
- Customer management
- Reports and analytics
- Employee account management

### Administrator
- Owner account management
- Subscription pricing management
- Platform analytics
- System configuration

### System
- Natural language to draft order conversion
- Automatic bookkeeping (Circular 88/2021/TT-BTC)

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Flutter 3.0+
- Docker and Docker Compose
- MySQL 8.0+
- PostgreSQL 14+
- Redis 7.0+

### Setup

1. **Start databases**:
```bash
docker-compose up -d
```

2. **Backend setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Web frontend setup**:
```bash
cd frontend-web
npm install
```

4. **Mobile frontend setup**:
```bash
cd frontend-mobile
flutter pub get
```

## License

This project is part of a university thesis project.

