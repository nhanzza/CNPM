# BizFlow Complete Project

Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh (Digital Transformation Platform for Household Businesses)

## Project Structure

```
bizflow-complete/
├── backend/                    # Python FastAPI Backend
│   ├── src/
│   │   ├── domain/            # Business entities
│   │   ├── application/       # Use cases & DTOs
│   │   ├── infrastructure/    # Database & repositories
│   │   ├── presentation/      # API routes
│   │   ├── ai/               # AI/LLM services
│   │   └── main.py           # FastAPI app
│   ├── tests/                # Unit & integration tests
│   ├── scripts/              # Database utilities
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example         # Environment template
│   └── README.md            # Backend documentation
│
├── web/                       # Next.js Web Frontend
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities & store
│   │   ├── services/        # API clients
│   │   └── types/           # TypeScript types
│   ├── public/              # Static files
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── README.md
│
└── mobile/                   # Flutter Mobile App
    ├── lib/                 # Dart source code
    ├── screens/            # App screens
    ├── services/           # API & storage
    ├── pubspec.yaml       # Flutter dependencies
    └── README.md          # Mobile documentation
```

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python scripts/init_db.py
uvicorn src.main:app --reload
```

### Web Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Mobile App Setup
```bash
cd mobile
flutter pub get
flutter run
```

## Features

### For Employees
- ✅ Fast at-counter orders
- ✅ Customer debt management
- ✅ Order printing
- ✅ Real-time notifications
- ✅ AI-generated draft order confirmation

### For Owners
- ✅ All employee features
- ✅ Product catalog management
- ✅ Inventory management
- ✅ Customer management
- ✅ Business analytics & reports
- ✅ Employee account management

### For Admins
- ✅ Owner account management
- ✅ Subscription management
- ✅ Platform analytics
- ✅ System configuration

### AI Features
- ✅ Natural language order creation
- ✅ Voice-to-text order processing
- ✅ Auto-completion with RAG
- ✅ Smart product search

### Accounting
- ✅ Automatic bookkeeping
- ✅ Tax report generation (Circular 88/2021/TT-BTC)
- ✅ Financial analytics
- ✅ Debt tracking

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL, MySQL
- **Cache**: Redis
- **Auth**: JWT
- **ORM**: SQLAlchemy
- **AI**: OpenAI/Gemini + ChromaDB
- **Speech**: Google Speech-to-Text, Whisper
- **Task Queue**: Celery

### Web Frontend
- **Framework**: Next.js 16
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form
- **UI**: Tailwind CSS
- **Charts**: Chart.js
- **HTTP Client**: Axios

### Mobile
- **Framework**: Flutter 3
- **State Management**: GetX
- **Local Storage**: Hive
- **HTTP Client**: Dio
- **Notifications**: Firebase Cloud Messaging

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/bizflow
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-api-key
```

### Web Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Testing

### Backend
```bash
cd backend
pytest tests/ -v
```

### Web Frontend
```bash
cd web
npm test
```

## Deployment

### Docker
```bash
docker-compose up
```

### Production
- Backend: Deployed on AWS EC2 / Azure VM
- Frontend: Deployed on Vercel
- Mobile: Published on Google Play Store & Apple App Store

## Documentation

- [Requirements Document](docs/requirements.md)
- [System Architecture](docs/architecture.md)
- [API Specification](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Team

- **Product Owner**: [Name]
- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **Mobile Lead**: [Name]

## Contact

- Email: contact@bizflow.vn
- Website: https://bizflow.vn
- Support: support@bizflow.vn

## Changelog

### v1.0.0 (2026-01-15)
- Initial release
- Employee and Owner modules
- AI order generation
- Automatic bookkeeping
- Basic analytics

### v1.0-checkpoint-diagrams-complete (2026-01-22)
- Restored stable checkpoint version due to accumulated code errors
- Fixed API endpoint routing (changed from `/api/v2` to `/api`)
- Implemented optimistic updates with localStorage persistence
- Added inventory import feature with CRUD operations
- Fixed input field zero-prefix bug
- Added bilingual (EN/VI) support for all alert messages
- Enhanced chart color visibility and synchronization
- Cleaned up TypeScript compilation warnings

---

**Last Updated**: January 22, 2026
