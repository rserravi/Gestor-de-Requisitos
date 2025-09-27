"""Project management API routes."""

from typing import List

from fastapi import APIRouter, status

from ..schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
def list_projects() -> List[ProjectResponse]:
    """Return the projects visible to the authenticated user."""
    # TODO: query projects from persistence
    return []


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate) -> ProjectResponse:
    """Create a new project stub."""
    # TODO: create project in persistence layer
    return ProjectResponse(id=0, owner_id=0, **payload.model_dump())


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int) -> ProjectResponse:
    """Retrieve a specific project by its identifier."""
    # TODO: fetch project from persistence
    return ProjectResponse(id=project_id, owner_id=0, name="placeholder", description=None)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, payload: ProjectUpdate) -> ProjectResponse:
    """Update project metadata."""
    # TODO: persist project update
    return ProjectResponse(
        id=project_id,
        owner_id=0,
        name=payload.name or "placeholder",
        description=payload.description,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int) -> None:
    """Delete a project by its identifier."""
    # TODO: remove project from persistence
    return None
