"""Authentication and user profile API routes."""

from fastapi import APIRouter, status

from ..schemas import (
    TokenResponse,
    UserLogin,
    UserPreferencesUpdate,
    UserRegister,
    UserResponse,
    UserUpdate,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister) -> TokenResponse:
    """Register a new user and return an authentication token placeholder."""
    # TODO: implement user registration logic
    return TokenResponse(access_token="dummy-token")


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin) -> TokenResponse:
    """Authenticate a user and return a token placeholder."""
    # TODO: implement authentication logic
    return TokenResponse(access_token="dummy-token")


@router.get("/me", response_model=UserResponse)
def get_current_user() -> UserResponse:
    """Return information about the authenticated user."""
    # TODO: fetch the current user from persistence
    return UserResponse(
        id=0,
        username="placeholder",
        email="placeholder@example.com",
        avatar=None,
        is_active=True,
        preferences=None,
    )


@router.put("/me", response_model=UserResponse)
def update_current_user(payload: UserUpdate) -> UserResponse:
    """Update user profile information."""
    # TODO: persist the update in the data layer
    return UserResponse(
        id=0,
        username=payload.username or "placeholder",
        email=payload.email or "placeholder@example.com",
        avatar=payload.avatar,
        is_active=True,
        preferences=None,
    )


@router.put("/preferences", response_model=UserResponse)
def update_user_preferences(payload: UserPreferencesUpdate) -> UserResponse:
    """Update user preferences and return the updated user."""
    # TODO: persist preferences and return updated user data
    return UserResponse(
        id=0,
        username="placeholder",
        email="placeholder@example.com",
        avatar=None,
        is_active=True,
        preferences=payload,
    )
