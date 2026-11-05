from __future__ import annotations
"""Switch Agent Protocol message and event schemas."""

import time
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class SwitchSender(BaseModel):
    """Represents the sender of a message within a Switch room."""
    id: str
    name: str
    type: Literal["human", "agent", "system"] = "human"
    role: Optional[str] = None


class SwitchMessage(BaseModel):
    """Represents a message in a Switch shared conversation room."""
    id: str
    room_id: str
    sender: SwitchSender
    content: str
    mentions: List[str] = Field(default_factory=list)
    timestamp: float = Field(default_factory=time.time)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SwitchEvent(BaseModel):
    """Represents an inbound event received over the Switch SSE stream."""
    event_id: str
    event_type: str = "message.created"
    room_id: str
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: float = Field(default_factory=time.time)


class OutboundMessage(BaseModel):
    """Represents an outbound message dispatched to a Switch room via HTTP POST."""
    room_id: str
    sender_agent_id: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CommandPayload(BaseModel):
    """Represents a parsed slash command or targeted agent instruction."""
    command: str
    args: List[str] = Field(default_factory=list)
    raw_content: str
    room_id: str
    sender: SwitchSender
    target_agent: Optional[str] = None


class AgentBeat(BaseModel):
    """Liveness heartbeat payload reported to Switch via POST /connection/beat."""
    agent_id: str
    status: Literal["idle", "processing", "error"] = "idle"
    cursor: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

