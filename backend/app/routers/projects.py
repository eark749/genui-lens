import os
import secrets
import uuid
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..auth import get_current_user, get_user_project, hash_key
from ..models import User, Project, ApiKey

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def generate_api_key() -> str:
    return "lens_" + secrets.token_urlsafe(32)


async def send_welcome_email(email: str, name: str) -> None:
    resend_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM", "GenUI Lens <noreply@genuilens.com>")
    if not resend_key:
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                json={
                    "from": from_email,
                    "to": [email],
                    "subject": "Welcome to GenUI Lens",
                    "html": f"""
                        <h2>Welcome to GenUI Lens, {name}!</h2>
                        <p>Your account is ready. Create your first project and install the SDK:</p>
                        <pre>npm install @genui-lens/sdk</pre>
                        <p>Head to your dashboard to grab your API key.</p>
                        <p>— The GenUI Lens team</p>
                    """,
                },
                timeout=5,
            )
    except Exception:
        pass  # email failure never breaks the flow


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str | None = None


class ProjectCreate(BaseModel):
    name: str


class ApiKeyCreate(BaseModel):
    name: str = "Default"


# ── Auth / register ───────────────────────────────────────────────────────────

@router.post("/v1/auth/register", status_code=201)
async def register(
    body: RegisterRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Call once after Supabase signup completes.
    Creates the user record (get_current_user already upserts it) and sends welcome email.
    """
    await send_welcome_email(user.email, body.name or user.email.split("@")[0])
    return {"user_id": user.id, "email": user.email}


# ── Projects ──────────────────────────────────────────────────────────────────

@router.get("/v1/projects")
async def list_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.user_id == user.id))
    projects = result.scalars().all()
    return {
        "projects": [
            {"id": p.id, "name": p.name, "created_at": p.created_at.isoformat()}
            for p in projects
        ]
    }


@router.post("/v1/projects", status_code=201)
async def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(
        id=str(uuid.uuid4()),
        name=body.name,
        user_id=user.id,
    )
    db.add(project)
    await db.flush()

    # Create a default API key
    raw_key = generate_api_key()
    api_key = ApiKey(
        project_id=project.id,
        user_id=user.id,
        name="Default",
        key_hash=hash_key(raw_key),
        prefix=raw_key[:12],
    )
    db.add(api_key)
    await db.commit()

    return {
        "project": {"id": project.id, "name": project.name, "created_at": project.created_at.isoformat()},
        "api_key": {
            "id": api_key.id,
            "name": api_key.name,
            "key": raw_key,  # shown ONCE — store it now
            "prefix": api_key.prefix,
            "created_at": api_key.created_at.isoformat(),
        },
    }


@router.get("/v1/projects/{project_id}")
async def get_project(
    project: Project = Depends(get_user_project),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.project_id == project.id, ApiKey.revoked_at.is_(None))
    )
    keys = result.scalars().all()
    return {
        "project": {"id": project.id, "name": project.name, "created_at": project.created_at.isoformat()},
        "api_keys": [
            {"id": k.id, "name": k.name, "prefix": k.prefix, "created_at": k.created_at.isoformat()}
            for k in keys
        ],
    }


# ── API keys ──────────────────────────────────────────────────────────────────

@router.post("/v1/projects/{project_id}/api-keys", status_code=201)
async def create_api_key(
    body: ApiKeyCreate,
    project: Project = Depends(get_user_project),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw_key = generate_api_key()
    api_key = ApiKey(
        project_id=project.id,
        user_id=user.id,
        name=body.name,
        key_hash=hash_key(raw_key),
        prefix=raw_key[:12],
    )
    db.add(api_key)
    await db.commit()
    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": raw_key,  # shown ONCE
        "prefix": api_key.prefix,
        "created_at": api_key.created_at.isoformat(),
    }


@router.get("/v1/projects/{project_id}/api-keys")
async def list_api_keys(
    project: Project = Depends(get_user_project),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.project_id == project.id, ApiKey.revoked_at.is_(None))
    )
    keys = result.scalars().all()
    return {
        "api_keys": [
            {"id": k.id, "name": k.name, "prefix": k.prefix, "created_at": k.created_at.isoformat()}
            for k in keys
        ]
    }


@router.delete("/v1/projects/{project_id}/api-keys/{key_id}", status_code=200)
async def revoke_api_key(
    key_id: str,
    project: Project = Depends(get_user_project),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.project_id == project.id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    api_key.revoked_at = datetime.utcnow()
    await db.commit()
    return {"status": "revoked"}
