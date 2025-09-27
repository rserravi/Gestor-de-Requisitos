"""FastAPI application entry point for the requirements manager backend."""

from fastapi import FastAPI

from .api import auth, chat_messages, files, projects, requirements, state_machine


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(title="Gestor de Requisitos API")

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])
    app.include_router(chat_messages.router, prefix="/chat_messages", tags=["chat"])
    app.include_router(state_machine.router, prefix="/state_machine", tags=["state_machine"])
    app.include_router(requirements.router, prefix="/requirements", tags=["requirements"])
    app.include_router(files.router, prefix="/files", tags=["files"])

    return app


app = create_app()
