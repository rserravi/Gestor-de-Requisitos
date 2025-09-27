"""Schemas describing requirement resources."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class RequirementStatus(str, Enum):
    draft = "draft"
    in_progress = "in_progress"
    completed = "completed"


class RequirementPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class RequirementBase(BaseModel):
    """Common fields for requirement requests and responses."""

    description: str
    status: RequirementStatus
    category: Optional[str] = None
    priority: RequirementPriority
    visual_reference: Optional[str] = None


class RequirementCreate(RequirementBase):
    """Payload for creating a new requirement."""

    project_id: int


class RequirementUpdate(BaseModel):
    """Payload for updating an existing requirement."""

    description: Optional[str] = None
    status: Optional[RequirementStatus] = None
    category: Optional[str] = None
    priority: Optional[RequirementPriority] = None
    visual_reference: Optional[str] = None


class RequirementResponse(RequirementBase):
    """Requirement representation returned by the API."""

    id: int
    number: int
    owner_id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
