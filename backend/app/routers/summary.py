from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, distinct

from ..database import get_db
from ..models import Project, View, Event, Component, ViewComponent
from ..auth import get_project_flexible

router = APIRouter()


@router.get("/v1/summary/views")
async def summary_views(
    project: Project = Depends(get_project_flexible),
    db: AsyncSession = Depends(get_db),
    from_: Optional[datetime] = Query(None, alias="from"),
    to: Optional[datetime] = Query(None),
):
    query = (
        select(
            View.intent,
            func.count(View.id.distinct()).label("view_count"),
            func.count(
                case((Event.event_type == "business", Event.id), else_=None)
            ).label("success_events"),
        )
        .outerjoin(Event, Event.view_id == View.id)
        .where(View.project_id == project.id)
        .group_by(View.intent)
    )

    if from_:
        query = query.where(View.created_at >= from_)
    if to:
        query = query.where(View.created_at <= to)

    result = await db.execute(query)
    rows = result.all()

    return {
        "project_id": project.id,
        "from": from_.isoformat() if from_ else None,
        "to": to.isoformat() if to else datetime.utcnow().isoformat(),
        "intents": [
            {
                "intent": row.intent,
                "view_count": row.view_count,
                "success_events": row.success_events,
                "success_rate": min(1.0, row.success_events / row.view_count) if row.view_count > 0 else 0,
            }
            for row in rows
        ],
    }


@router.get("/v1/summary/components")
async def summary_components(
    project: Project = Depends(get_project_flexible),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(
            Component.component_id,
            Component.type,
            func.count(ViewComponent.view_id.distinct()).label("view_count"),
            func.count(
                distinct(case((Event.event_type == "action", Event.id), else_=None))
            ).label("action_count"),
            func.count(
                distinct(case((Event.event_type == "error", Event.id), else_=None))
            ).label("error_count"),
        )
        .outerjoin(ViewComponent, ViewComponent.component_id == Component.component_id)
        .outerjoin(
            Event,
            (Event.component_id == Component.component_id)
            & (Event.project_id == Component.project_id),
        )
        .where(Component.project_id == project.id)
        .group_by(Component.component_id, Component.type)
    )

    result = await db.execute(query)
    rows = result.all()

    return {
        "project_id": project.id,
        "components": [
            {
                "component_id": row.component_id,
                "type": row.type,
                "view_count": row.view_count,
                "action_count": row.action_count,
                "error_count": row.error_count,
            }
            for row in rows
        ],
    }
