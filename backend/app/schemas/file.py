"""Schemas describing uploaded files and their contents."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    """Metadata returned after uploading a file."""

    id: int
    name: str
    uploaded_at: Optional[datetime] = None


class FileContentResponse(BaseModel):
    """Plain text representation of a requirement example file."""

    id: int
    name: str
    content: str
