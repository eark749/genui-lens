from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ..database import get_db
from ..auth import get_project_flexible
from ..models import Project

router = APIRouter()


@router.get("/v1/sessions")
async def list_sessions(
    project: Project = Depends(get_project_flexible),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("""
            SELECT
                s.id,
                s.created_at,
                (SELECT v.intent FROM views v
                 WHERE v.session_id = s.id AND v.project_id = :project_id
                 ORDER BY v.created_at ASC LIMIT 1) AS title,
                COUNT(DISTINCT v.id) AS view_count,
                COUNT(DISTINCT CASE WHEN e.event_type = 'business' THEN e.id END) AS success_count
            FROM sessions s
            LEFT JOIN views v ON v.session_id = s.id
            LEFT JOIN events e ON e.session_id = s.id AND e.project_id = :project_id
            WHERE s.project_id = :project_id
            GROUP BY s.id, s.created_at
            ORDER BY s.created_at DESC
            LIMIT 100
        """),
        {"project_id": project.id},
    )
    rows = result.all()

    return {
        "sessions": [
            {
                "session_id": row.id,
                "title": row.title or "Untitled",
                "started_at": row.created_at.isoformat(),
                "view_count": row.view_count,
                "success_count": row.success_count,
                "success_rate": min(1.0, row.success_count / row.view_count)
                if row.view_count > 0
                else 0,
            }
            for row in rows
        ]
    }


@router.get("/v1/sessions/{session_id}")
async def get_session(
    session_id: str,
    project: Project = Depends(get_project_flexible),
    db: AsyncSession = Depends(get_db),
):
    views_result = await db.execute(
        text("""
            SELECT
                v.id AS view_id,
                v.intent,
                v.created_at,
                COUNT(DISTINCT CASE WHEN e.event_type = 'business' THEN e.id END) AS success_count,
                COUNT(DISTINCT CASE WHEN e.event_type = 'action' THEN e.id END) AS action_count
            FROM views v
            LEFT JOIN events e ON e.view_id = v.id
            WHERE v.session_id = :session_id AND v.project_id = :project_id
            GROUP BY v.id, v.intent, v.created_at
            ORDER BY v.created_at ASC
        """),
        {"session_id": session_id, "project_id": project.id},
    )
    views = views_result.all()

    comp_result = await db.execute(
        text("""
            SELECT vc.view_id, c.type
            FROM view_components vc
            JOIN components c
              ON c.component_id = vc.component_id AND c.project_id = :project_id
            JOIN views v ON v.id = vc.view_id
            WHERE v.session_id = :session_id AND v.project_id = :project_id
        """),
        {"session_id": session_id, "project_id": project.id},
    )
    components_by_view: dict[str, list[str]] = {}
    for row in comp_result.all():
        components_by_view.setdefault(row.view_id, []).append(row.type)

    return {
        "session_id": session_id,
        "views": [
            {
                "view_id": v.view_id,
                "intent": v.intent,
                "created_at": v.created_at.isoformat(),
                "success_count": v.success_count,
                "action_count": v.action_count,
                "components": components_by_view.get(v.view_id, []),
            }
            for v in views
        ],
    }
