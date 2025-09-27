"""Pydantic schemas for authentication and user profile endpoints."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    """Response returned after a successful authentication request."""

    access_token: str
    token_type: str = "bearer"


class UserPreferences(BaseModel):
    """User configurable preferences."""

    language: Optional[str] = None
    theme: Optional[str] = None
    timezone: Optional[str] = None
    notifications: Optional[bool] = None


class UserBase(BaseModel):
    """Base representation of a user."""

    id: int
    username: str
    email: EmailStr
    avatar: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserResponse(UserBase):
    """Complete representation of the authenticated user."""

    preferences: Optional[UserPreferences] = None


class UserUpdate(BaseModel):
    """Payload for updating basic user information."""

    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None


class UserPreferencesUpdate(UserPreferences):
    """Payload for updating user preferences."""

    pass


class UserRegister(BaseModel):
    """Payload for registering a new user."""

    username: str
    email: EmailStr
    password: str
    avatar: Optional[str] = None


class UserLogin(BaseModel):
    """Payload for performing a login request."""

    username: str
    password: str
