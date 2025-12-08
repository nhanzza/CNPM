# BizFlow Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- Flutter 3.0+
- Docker and Docker Compose
- MySQL 8.0+ (or use Docker)
- PostgreSQL 14+ (or use Docker)
- Redis 7.0+ (or use Docker)

## Step 1: Start Databases

```bash
docker-compose up -d
```

This will start MySQL, PostgreSQL, and Redis containers.

## Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# Set database credentials, API keys, etc.

# Run database migrations (when Alembic is set up)
# alembic upgrade head

# Start the server
python run.py
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/api/docs`

## Step 3: Web Frontend Setup

```bash
cd frontend-web

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

The web app will be available at `http://localhost:3000`

## Step 4: Mobile Frontend Setup

```bash
cd frontend-mobile

# Get dependencies
flutter pub get

# Run on connected device/emulator
flutter run
```

## Step 5: Initial Setup

1. **Create Admin User**: You'll need to create an admin user directly in the database or through a setup script.

2. **Create Business**: Create a business account through the admin interface.

3. **Create Owner**: Create an owner user associated with the business.

4. **Create Products**: Add products to the catalog.

5. **Start Using**: Employees and owners can now log in and use the system.

## Environment Variables

### Backend (.env)

- `SECRET_KEY`: JWT secret key (use a strong random string)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `GEMINI_API_KEY`: Google Gemini API key (optional)
- Database credentials matching docker-compose.yml

### Frontend Web (.env.local)

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## Troubleshooting

### Database Connection Issues

- Ensure Docker containers are running: `docker-compose ps`
- Check database credentials in `.env` match `docker-compose.yml`
- Verify ports 3306 (MySQL), 5432 (PostgreSQL), 6379 (Redis) are not in use

### API Errors

- Check backend logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure database migrations have been run

### Frontend Issues

- Clear browser cache
- Check browser console for errors
- Verify API URL is correct in `.env.local`

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when added)
cd frontend-web
npm test
```

### Code Formatting

```bash
# Backend
black app/
isort app/

# Frontend
cd frontend-web
npm run lint
```

## Production Deployment

1. Set `DEBUG=False` in backend `.env`
2. Use strong `SECRET_KEY`
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use production database (not Docker)
6. Configure proper file storage
7. Set up monitoring and logging

