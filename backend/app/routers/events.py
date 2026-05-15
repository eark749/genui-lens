import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert

from ..database import get_db
from ..models import Project, Session as SessionModel, Event
from ..schemas import EventCreate, EventResponse
from ..auth import get_project

router = APIRouter()


@router.post("/v1/events", response_model=EventResponse)
async def create_event(
    body: EventCreate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        insert(SessionModel)
        .values(id=body.session_id, project_id=project.id, created_at=datetime.utcnow())
        .on_conflict_do_nothing(index_elements=["id"])
    )
    await db.execute(stmt)

    event_id = body.event_id or str(uuid.uuid4())
    event = Event(
        id=event_id,
        project_id=project.id,
        session_id=body.session_id,
        view_id=body.view_id,
        component_id=body.component_id,
        event_type=body.event_type,
        action_type=body.action_type,
        business_type=body.business_type,
        payload=body.payload or {},
        timestamp=(body.timestamp.replace(tzinfo=None) if body.timestamp else datetime.utcnow()),
    )
    db.add(event)
    await db.commit()
    return {"status": "ok", "event_id": event_id}
