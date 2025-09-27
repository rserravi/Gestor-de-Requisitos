# Gestor de Requisitos – Backend

Esqueleto inicial de la API REST descrita por el frontend. Está construido con [FastAPI](https://fastapi.tiangolo.com/) y agrupa los endpoints en routers modulares.

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --reload --factory --app-dir backend
```

Cada router devuelve respuestas de marcador de posición y contiene comentarios `TODO` para guiar la implementación real.
