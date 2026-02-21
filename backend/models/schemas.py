"""
Pydantic schemas for TARS data validation
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class LocationModel(BaseModel):
    """Location coordinates"""
    x: float
    y: float


class Event(BaseModel):
    """Event schema"""
    id: str
    type: str
    location: LocationModel
    severity: str
    description: Optional[str] = None
    detected_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AgentState(BaseModel):
    """Agent state schema"""
    id: str
    name: str
    type: str
    current_state: str
    status: str
    last_updated: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ExecutionTrace(BaseModel):
    """Execution trace schema"""
    id: str
    agent_id: str
    event_type: str
    from_state: Optional[str] = None
    to_state: Optional[str] = None
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class Missile(BaseModel):
    """Missile schema"""
    id: str
    location: LocationModel
    target: LocationModel
    status: str
    interceptor_id: Optional[str] = None
    created_at: Optional[datetime] = None
    intercepted_at: Optional[datetime] = None


class Deployment(BaseModel):
    """Deployment schema"""
    id: str
    location: LocationModel
    unit_size: str
    status: str
    created_at: Optional[datetime] = None
    arrived_at: Optional[datetime] = None


class SystemState(BaseModel):
    """System state schema"""
    agents: list[AgentState]
    events: list[Event]
    missiles: list[Missile]
    deployments: list[Deployment]
    dome_active: bool
    timestamp: datetime


class VoiceCommand(BaseModel):
    """Voice command schema"""
    command: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class VoiceResponse(BaseModel):
    """Voice response schema"""
    status: str
    message: str
    action_taken: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
