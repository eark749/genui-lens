import os
import base64
import hashlib
import json
import jwt
from typing import Optional
from fastapi import Header, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import get_db
from .models import Project, ApiKey, User


def hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def _jwt_header_alg(token: str) -> str:
    try:
        header_b64 = token.split(".")[0]
        padding = 4 - len(header_b64) % 4
        if padding != 4:
            header_b64 += "=" * padding
        header = json.loads(base64.urlsafe_b64decode(header_b64))
        return header.get("alg", "HS256")
    except Exception:
        return "HS256"


async def _decode_supabase_jwt(token: str) -> dict:
    """Verify Supabase JWT, return payload. Raises HTTPException on failure."""
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if not jwt_secret:
        raise HTTPException(status_code=500, detail="JWT secret not configured")

    alg = _jwt_header_alg(token)

    try:
        if alg in ("RS256", "RS384", "RS512", "ES256"):
            supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
            if not supabase_url:
                raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")
            jwks_client = jwt.PyJWKClient(f"{supabase_url}/auth/v1/.well-known/jwks.json")
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(token, signing_key.key, algorithms=[alg], audience="authenticated")
        else:
            try:
                payload = jwt.decode(token, jwt_secret, algorithms=["HS256"], audience="authenticated")
            except jwt.InvalidSignatureError:
                secret_bytes = base64.b64decode(jwt_secret + "==")
                payload = jwt.decode(token, secret_bytes, algorithms=["HS256"], audience="authenticated")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    return payload


# ── SDK auth: API key → Project ───────────────────────────────────────────────

async def get_project(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> Project:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    api_key = authorization[7:]
    key_hash = hash_key(api_key)

    result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None))
    )
    api_key_row = result.scalar_one_or_none()
    if api_key_row:
        result = await db.execute(select(Project).where(Project.id == api_key_row.project_id))
        project = result.scalar_one_or_none()
        if project:
            return project

    result = await db.execute(select(Project).where(Project.api_key_hash == key_hash))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return project


# ── Flexible auth: API key OR JWT+project_id (for dashboard reads) ────────────

async def get_project_flexible(
    authorization: str = Header(...),
    project_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> Project:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[7:]

    # API key path (starts with "lens_")
    if token.startswith("lens_"):
        return await get_project(authorization=authorization, db=db)

    # JWT path
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id query param required")

    payload = await _decode_supabase_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ── Dashboard auth: Supabase JWT → User ───────────────────────────────────────

async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[7:]
    payload = await _decode_supabase_jwt(token)

    user_id = payload.get("sub")
    email = payload.get("email", "")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=user_id, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


# ── Dashboard auth: JWT + project ownership ───────────────────────────────────

async def get_user_project(
    project_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
