"""Chat message API routes."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, status

from ..schemas import ChatMessageCreate, ChatMessageResponse

router = APIRouter()


@router.get("/project/{project_id}", response_model=List[ChatMessageResponse])
def list_chat_messages(project_id: int) -> List[ChatMessageResponse]:
    """Return all chat messages for the provided project."""
    # TODO: query chat history from persistence
    return []


@router.post("/", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def create_chat_message(payload: ChatMessageCreate) -> ChatMessageResponse:
    """Store a new chat message and return it."""
    # TODO: persist chat message
    return ChatMessageResponse(
        id=0,
        created_at=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
