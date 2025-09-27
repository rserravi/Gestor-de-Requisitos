"""Schemas describing the project state machine."""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel


class ConversationState(str, Enum):
    init = "init"
    software_questions = "software_questions"
    new_requisites = "new_requisites"
    analyze_requisites = "analyze_requisites"
    stall = "stall"


class StateMachineBase(BaseModel):
    """Common fields for state machine transitions."""

    project_id: int
    state: ConversationState
    extra: Optional[Any] = None


class StateMachineCreate(StateMachineBase):
    """Payload for storing a new state machine transition."""

    pass


class StateMachineResponse(StateMachineBase):
    """State machine entry returned by the API."""

    id: int
    created_at: datetime
