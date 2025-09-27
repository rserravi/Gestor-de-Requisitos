"""State machine API routes."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, status

from ..schemas import StateMachineCreate, StateMachineResponse

router = APIRouter()


@router.post("/project/{project_id}", response_model=StateMachineResponse, status_code=status.HTTP_201_CREATED)
def record_state_transition(project_id: int, payload: StateMachineCreate) -> StateMachineResponse:
    """Persist a new state machine transition."""
    # TODO: persist transition in data store
    return StateMachineResponse(
        id=0,
        project_id=project_id,
        state=payload.state,
        extra=payload.extra,
        created_at=datetime.now(timezone.utc),
    )


@router.get("/project/{project_id}", response_model=List[StateMachineResponse])
def list_state_transitions(project_id: int) -> List[StateMachineResponse]:
    """Retrieve the state machine history for a project."""
    # TODO: fetch state machine history
    return []
