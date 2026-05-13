from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class ComponentInput(BaseModel):
    component_id: str
    type: str
    path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ViewCreate(BaseModel):
    project_id: Optional[str] = None
    view_id: Optional[str] = None
    session_id: str
    intent: str
    library: str
    c1_message_id: Optional[str] = None
    thread_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    components: Optional[List[ComponentInput]] = []
    timestamp: Optional[datetime] = None


class ViewResponse(BaseModel):
    status: str
    view_id: str


class EventCreate(BaseModel):
    project_id: Optional[str] = None
    session_id: str
    view_id: Optional[str] = None
    event_id: Optional[str] = None
    event_type: str
    component_id: Optional[str] = None
    action_type: Optional[str] = None
    business_type: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class EventResponse(BaseModel):
    status: str
    event_id: str
