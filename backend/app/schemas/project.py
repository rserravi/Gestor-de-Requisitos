"""Schemas describing project resources."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProjectBase(BaseModel):
    """Shared attributes for project representations."""

    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Payload for creating a new project."""

    pass


class ProjectUpdate(ProjectBase):
    """Payload for updating an existing project."""

    name: Optional[str] = None


class ProjectResponse(ProjectBase):
    """Project data returned in API responses."""

    id: int
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
