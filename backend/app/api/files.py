"""File management API routes."""

from typing import List

from fastapi import APIRouter, UploadFile, status

from ..schemas import FileContentResponse, FileUploadResponse

router = APIRouter()


@router.get("/", response_model=List[FileUploadResponse])
def list_files() -> List[FileUploadResponse]:
    """Return metadata for uploaded files."""
    # TODO: read file metadata from persistence
    return []


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_file(uploaded_file: UploadFile) -> FileUploadResponse:
    """Upload a file and return its metadata placeholder."""
    # TODO: handle file upload storage
    return FileUploadResponse(id=0, name=uploaded_file.filename or "uploaded")


@router.get("/{file_id}/requirements", response_model=FileContentResponse)
def get_file_content(file_id: int) -> FileContentResponse:
    """Return the plain text content for a requirements example file."""
    # TODO: read the file content from storage
    return FileContentResponse(id=file_id, name="placeholder.txt", content="")
