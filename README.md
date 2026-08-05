# AI Recruitment Platform

![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-4f46e5)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![License](https://img.shields.io/badge/license-MIT-blue)

AI Recruitment Platform is a modular foundation for an AI-assisted recruitment
application. The current repository provides a React frontend, a FastAPI
backend foundation, dataset governance documentation, and planning areas for
future analysis and machine-learning work. Recruitment workflows and ML
capabilities are not implemented yet.

## Table of Contents

- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Development Workflow](#development-workflow)
- [Future Roadmap](#future-roadmap)
- [License](#license)

## Project Overview

The current repository provides a React frontend, a FastAPI backend foundation,
dataset governance documentation, and planning areas for future analysis and
machine-learning work. Recruitment workflows and ML capabilities are not
implemented yet.

## Architecture

```text
Browser
  │
  ▼
React + Vite + Tailwind CSS
  │  HTTP / JSON
  ▼
FastAPI backend
  ├── API routes
  ├── Core configuration and logging
  └── Future service, database, and ML integrations

Future foundation: datasets → preprocessing / evaluation → inference
```

## Folder Structure

```text
AI-Recruitment-Platform/
├── backend/       FastAPI application and environment configuration
├── frontend/      React, Vite, Tailwind, Router, and Axios foundation
├── datasets/      Governed data folders and schema documentation
├── docs/          Requirements, architecture, and roadmap documents
├── ml/            Reserved ML lifecycle folders
├── notebooks/     Markdown-only EDA planning notebooks
├── reports/       EDA report template
├── scripts/       Reserved data utility stubs
└── tests/         Reserved test suites
```

## Technology Stack

| Area | Current technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Navigation | React Router |
| HTTP client | Axios |
| Backend | Python, FastAPI, Uvicorn |
| Configuration | python-dotenv and environment variables |
| Validation | Pydantic |
| Future data and ML | Python-based preprocessing, training, evaluation, and inference |

## Installation

Clone the repository and open the project directory:

```bash
git clone <repository-url>
cd AI-Recruitment-Platform
```

### Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the environment, then install dependencies:

```bash
# Windows
.venv\Scripts\activate

# macOS or Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy `.env.example` to `.env` and adjust values for the local environment.

### Frontend Setup

```bash
cd frontend
npm install
```

## Environment Variables

The backend reads settings from `backend/.env`. Start from
`backend/.env.example`.

| Variable | Purpose | Default in example |
| --- | --- | --- |
| `APP_NAME` | API title | `AI Recruitment Platform API` |
| `APP_ENV` | Runtime environment label | `development` |
| `DEBUG` | FastAPI debug mode | `true` |
| `CORS_ORIGINS` | Comma-separated allowed browser origins | Local Vite origins |
| `LOG_LEVEL` | Application logging level | `INFO` |

The Axios client supports `VITE_API_BASE_URL` when a frontend API base URL is
needed. It otherwise uses the local backend address configured in the client.

## Running the Project

Run each service in its own terminal.

```bash
# Terminal 1 — from backend/
uvicorn app.main:app --reload
```

The backend is available at `http://127.0.0.1:8000`; Swagger UI is at
`http://127.0.0.1:8000/docs`.

```bash
# Terminal 2 — from frontend/
npm run dev
```

Vite prints the local frontend URL when it starts.

## Development Workflow

1. Create a focused branch for each change.
2. Keep frontend, backend, data, and documentation responsibilities separated.
3. Use `.env` files for local secrets; never commit credentials or real
   candidate data.
4. Verify affected imports and local commands before requesting review.
5. Update documentation when configuration, architecture, or data contracts
   change.
6. Treat future AI outputs as human-reviewed decision support.

## Future Roadmap

The planned work includes approved dataset collection and EDA, resume parsing,
classification and matching experiments, ranking and recommendation research,
testing, documentation, presentation, and deployment preparation. See
[Project Roadmap](docs/Project_Roadmap.md) for the four-week plan.

## License

This project is licensed under the [MIT License](LICENSE).
