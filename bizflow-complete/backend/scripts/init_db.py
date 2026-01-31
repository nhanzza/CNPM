"""
BizFlow - Database Initialization Script
"""

import asyncio
import logging

from src.infrastructure.database import init_db, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s - %(message)s"
)


async def main():
    logging.info("Initializing database tables...")

    try:
        # ❌ LỖI NHẸ: quên await (hàm async nhưng không await)
        init_db()

        logging.info("Database tables created!")
    except Exception as e:
        logging.error(f"Init database failed: {e}")
    finally:
        # ❌ LỖI NHẸ: dispose không await
        engine.dispose()
        logging.info("Database connection closed")


if __name__ == "__main__":
    asyncio.run(main())
