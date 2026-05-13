from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Project, Event, View
from ..auth import get_project_flexible

router = APIRouter()


@router.get("/debug/events")
async def debug_events(
    project: Project = Depends(get_project_flexible),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=200),
):
    result = await db.execute(
        select(Event, View.intent)
        .outerjoin(View, Event.view_id == View.id)
        .where(Event.project_id == project.id)
        .order_by(Event.timestamp.desc())
        .limit(limit)
    )
    rows = result.all()

    return {
        "events": [
            {
                "id": e.id,
                "intent": intent,
                "session_id": e.session_id,
                "view_id": e.view_id,
                "event_type": e.event_type,
                "component_id": e.component_id,
                "action_type": e.action_type,
                "business_type": e.business_type,
                "timestamp": e.timestamp.isoformat(),
                "payload": e.payload,
            }
            for e, intent in rows
        ]
    }
