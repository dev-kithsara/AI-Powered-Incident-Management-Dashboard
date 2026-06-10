import asyncio
import os
from db.database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as db:
        res1 = await db.execute(text("SELECT count(*) FROM incidents WHERE status='CLOSED'"))
        res2 = await db.execute(text("SELECT count(*) FROM incidents WHERE ai_processed=TRUE"))
        res3 = await db.execute(text("SELECT count(*) FROM ai_embeddings"))
        
        print(f"Closed Incidents: {res1.scalar()}")
        print(f"AI Processed: {res2.scalar()}")
        print(f"Embeddings: {res3.scalar()}")

if __name__ == "__main__":
    asyncio.run(main())
