"""Requirement management API routes."""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, status

from ..schemas import (
    RequirementCreate,
    RequirementPriority,
    RequirementResponse,
    RequirementStatus,
    RequirementUpdate,
)

router = APIRouter()


@router.get("/project/{project_id}", response_model=List[RequirementResponse])
def list_requirements(project_id: int) -> List[RequirementResponse]:
    """Return the requirements associated with a project."""
    # TODO: query requirements from persistence
    return []


@router.post("/", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(payload: RequirementCreate) -> RequirementResponse:
    """Create a new requirement stub."""
    # TODO: persist requirement data
    now = datetime.now(timezone.utc)
    return RequirementResponse(
        id=0,
        number=0,
        owner_id=0,
        project_id=payload.project_id,
        created_at=now,
        updated_at=now,
        **payload.model_dump(exclude={"project_id"}),
    )


@router.put("/{requirement_id}", response_model=RequirementResponse)
def update_requirement(requirement_id: int, payload: RequirementUpdate) -> RequirementResponse:
    """Update an existing requirement."""
    # TODO: apply requirement update in persistence
    now = datetime.now(timezone.utc)
    return RequirementResponse(
        id=requirement_id,
        number=0,
        owner_id=0,
        project_id=0,
        created_at=now,
        updated_at=now,
        description=payload.description or "placeholder",
        status=payload.status or RequirementStatus.draft,
        category=payload.category,
        priority=payload.priority or RequirementPriority.medium,
        visual_reference=payload.visual_reference,
    )


@router.delete("/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(requirement_id: int) -> None:
    """Delete a requirement by its identifier."""
    # TODO: remove requirement from persistence
    return None


@router.post("/generate", response_model=List[RequirementResponse])
def generate_requirements() -> List[RequirementResponse]:
    """Trigger AI-assisted requirement generation."""
    # TODO: integrate with AI service
    return []
