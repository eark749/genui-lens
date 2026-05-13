import hashlib
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import get_db
from .models import Project


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


async def get_project(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> Project:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    api_key = authorization[7:]
    key_hash = hash_key(api_key)

    result = await db.execute(select(Project).where(Project.api_key_hash == key_hash))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return project
