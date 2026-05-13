import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert

from ..database import get_db
from ..models import Project, Session as SessionModel, View, Component, ViewComponent
from ..schemas import ViewCreate, ViewResponse
from ..auth import get_project

router = APIRouter()


@router.post("/v1/views", response_model=ViewResponse)
async def create_view(
    body: ViewCreate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        insert(SessionModel)
        .values(id=body.session_id, project_id=project.id, created_at=datetime.utcnow())
        .on_conflict_do_nothing(index_elements=["id"])
    )
    await db.execute(stmt)

    for comp in body.components or []:
        stmt = (
            insert(Component)
            .values(
                id=str(uuid.uuid4()),
                project_id=project.id,
                component_id=comp.component_id,
                type=comp.type,
                metadata=comp.metadata or {},
            )
            .on_conflict_do_update(
                constraint="components_project_id_component_id_key",
                set_={"type": comp.type, "metadata": comp.metadata or {}},
            )
        )
        await db.execute(stmt)

    view_id = body.view_id or str(uuid.uuid4())
    view = View(
        id=view_id,
        project_id=project.id,
        session_id=body.session_id,
        intent=body.intent,
        library=body.library,
        c1_message_id=body.c1_message_id,
        thread_id=body.thread_id,
        metadata_=body.metadata or {},
        created_at=body.timestamp or datetime.utcnow(),
    )
    db.add(view)

    for comp in body.components or []:
        db.add(ViewComponent(view_id=view_id, component_id=comp.component_id, path=comp.path))

    await db.commit()
    return {"status": "ok", "view_id": view_id}
