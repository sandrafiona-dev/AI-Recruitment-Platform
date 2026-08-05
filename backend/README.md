# AI Recruitment Platform API

## Table of Contents

- [Overview](#overview)
- [Backend Architecture](#backend-architecture)
- [FastAPI Structure](#fastapi-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Logging](#logging)
- [CORS](#cors)
- [Planned APIs](#planned-apis)

## Overview

This directory contains the FastAPI foundation for the AI Recruitment Platform.
The current API exposes a root route and a health route, with automatic Swagger
documentation. Recruitment APIs are intentionally not implemented yet.

## Backend Architecture

```text
app/main.py
  ├── FastAPI application setup
  ├── CORS middleware
  ├── logging initialization
  └── route registration

app/api/       HTTP route modules
app/core/      environment configuration and logging
app/services/  future business services
app/schemas/   future request and response contracts
app/models/    future domain or persistence models
app/database/  future database integration
app/utils/     future shared helpers
```

## FastAPI Structure

| Path | Purpose |
| --- | --- |
| `app/main.py` | Creates the FastAPI application and registers middleware and routes. |
| `app/api/health.py` | Provides the `GET /health` health-check route. |
| `app/core/config.py` | Loads environment settings using `python-dotenv`. |
| `app/core/logging.py` | Configures application console logging. |
| `app/database/` | Reserved for database configuration and access. |
| `app/models/` | Reserved for domain and persistence models. |
| `app/schemas/` | Reserved for request and response schemas. |
| `app/services/` | Reserved for business logic. |
| `app/utils/` | Reserved for shared utilities. |

## Environment Variables

Copy `.env.example` to `.env` before running locally.

| Variable | Description | Example |
| --- | --- | --- |
| `APP_NAME` | FastAPI application title | `AI Recruitment Platform API` |
| `APP_ENV` | Runtime environment label | `development` |
| `DEBUG` | Enables FastAPI debug mode | `true` |
| `CORS_ORIGINS` | Comma-separated allowed browser origins | `http://localhost:5173` |
| `LOG_LEVEL` | Root logging level | `INFO` |

Do not commit `.env` files or credentials.

## Running Locally

From `backend/`, create and activate a virtual environment, then install and
run the service:

```bash
python -m venv .venv
```

```bash
# Windows
.venv\Scripts\activate

# macOS or Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`; Swagger UI is available at
`http://127.0.0.1:8000/docs`.

## Logging

The application configures concise console logging during startup. Set
`LOG_LEVEL` to a standard Python logging level, such as `DEBUG`, `INFO`,
`WARNING`, or `ERROR`, to control verbosity.

## CORS

CORS middleware is configured from `CORS_ORIGINS`. Provide a comma-separated
list of approved frontend origins. Local Vite origins are included in
`.env.example`; production origins should be explicit and restricted.

## Planned APIs

The following API areas are planned only:

- Authentication and authorization
- Candidate management
- Job management
- Application management
- Resume ingestion and parsing
- Candidate-job matching
- Candidate ranking and recommendations
- Reporting and audit access
