"""Database initialization script"""
import asyncio
from src.infrastructure.database import init_db, engine
from src.infrastructure.models import Base


async def main():
    """Initialize database tables"""
    print("🗄️  Initializing database tables...")
    
    try:
        await init_db()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
