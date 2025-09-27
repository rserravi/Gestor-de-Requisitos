"""Schemas for chat messages and AI interactions."""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class ChatSender(str, Enum):
    user = "user"
    ai = "ai"


class ChatMessageBase(BaseModel):
    """Common fields for chat messages."""

    content: str
    sender: ChatSender
    project_id: int
    state: Optional[str] = None
    language: Optional[str] = None
    example_samples: Optional[List[int]] = None


class ChatMessageCreate(ChatMessageBase):
    """Payload for creating a new chat message."""

    pass


class ChatMessageResponse(ChatMessageBase):
    """Chat message representation returned by the API."""

    id: int
    created_at: datetime
