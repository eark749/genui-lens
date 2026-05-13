"""
Run once after adding DATABASE_URL to .env:
  cd backend && python seed.py
"""
import asyncio
import hashlib
import secrets
import uuid
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from app.database import engine, AsyncSessionLocal, Base
from app.models import Project


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    api_key = "glens_" + secrets.token_hex(24)
    project_id = str(uuid.uuid4())

    async with AsyncSessionLocal() as db:
        project = Project(
            id=project_id,
            name="Default Project",
            api_key_hash=hash_key(api_key),
        )
        db.add(project)
        await db.commit()

    print("\n✅ Project seeded successfully")
    print(f"   PROJECT_ID = {project_id}")
    print(f"   API_KEY    = {api_key}")
    print("\nSave these — API key is not stored in plaintext and cannot be recovered.")


asyncio.run(seed())
