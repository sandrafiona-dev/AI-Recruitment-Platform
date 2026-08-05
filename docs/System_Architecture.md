# System Architecture

## High Level Architecture

The platform follows a layered web-application architecture. A browser-based
React frontend communicates with a FastAPI backend over HTTPS. The backend
coordinates application rules, validates data, interacts with persistent
storage, and invokes future ML services. This separation keeps the user
experience, API logic, data access, and model lifecycle independently
maintainable.

```text
Users
  │
  ▼
React + Vite + Tailwind Frontend
  │ HTTPS / JSON
  ▼
FastAPI Backend
  ├── API routes and validation
  ├── Services and business rules
  ├── Database access
  └── ML inference integration
          │
          ├──────────────► Persistent database
          └──────────────► ML preprocessing, models, and inference
```

## Frontend

The frontend is a React application built with Vite and styled with Tailwind
CSS. It is responsible for responsive page rendering, navigation, user input,
and presentation of future API and ML insights. Components are organized into
reusable UI elements and page-level compositions. The frontend does not make
direct database or model calls; it communicates through the backend API.

## Backend

The backend uses FastAPI as the HTTP application framework. The current
structure separates route modules, database integration, models, schemas,
services, and utilities. FastAPI provides typed request handling, JSON
responses, and automatic Swagger documentation. As the platform grows,
business logic will remain in services while route modules focus on request and
response handling.

## ML Layer

The `ml/` area is reserved for the ML lifecycle:

- `preprocessing/` for data cleaning and transformation
- `feature_engineering/` for derived model inputs
- `training/` for reproducible training workflows
- `evaluation/` for metrics, validation, and fairness checks
- `inference/` for production-oriented prediction interfaces

The backend should invoke versioned, evaluated ML capabilities through clear
service boundaries. Model outputs should include enough context for recruiter
review and should not be treated as unreviewed final employment decisions.

## Database

A persistent database will be added in a future implementation phase. It will
store authorized user data, job descriptions, resume metadata, analysis
requests, model-output references, and audit records. Sensitive resume content
and personal information must be protected through encryption, access control,
retention policies, and minimal-data design. Database migrations and backups
should be included before production deployment.

## Future Deployment Architecture

In production, the frontend can be served as static assets through a CDN or
web host. The backend can run as containerized FastAPI instances behind a
reverse proxy or managed load balancer. A managed relational database can
provide persistence, while object storage can hold approved documents. ML
training should run separately from online inference, with a model registry and
monitoring process controlling promotions to production.

```text
Browser → CDN / Frontend Host → Load Balancer → FastAPI Containers
                                                ├── Managed Database
                                                ├── Object Storage
                                                ├── Inference Service
                                                └── Monitoring and Audit Logs

Offline: Curated Data → Training Pipeline → Evaluation → Model Registry → Inference Service
```
