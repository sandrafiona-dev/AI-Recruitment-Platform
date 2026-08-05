# AI Recruitment Platform Frontend

## Overview

This directory contains the React frontend foundation for the AI Recruitment
Platform. It provides a single home route, shared layout components, Tailwind
styling, client-side routing, and an Axios client configuration. Recruitment
features are not implemented.

## Frontend Architecture

```text
src/main.jsx
  └── BrowserRouter
      └── App routes
          └── HomePage
              ├── Navbar
              ├── Hero
              └── Footer

src/services/api.js
  └── Shared Axios client configuration
```

## Technology

| Tool | Role |
| --- | --- |
| React | Component-based user interface. |
| Vite | Local development server and production build tooling. |
| Tailwind CSS | Utility-first responsive styling. |
| React Router | Client-side route handling. |
| Axios | Shared HTTP client setup for future API requests. |

## Folder Explanation

| Path | Purpose |
| --- | --- |
| `src/main.jsx` | Mounts the React application and router. |
| `src/App.jsx` | Defines the application route tree. |
| `src/pages/` | Page-level components. |
| `src/components/` | Reusable presentational components. |
| `src/services/` | Shared service configuration, including Axios. |
| `src/hooks/` | Reserved for reusable React hooks. |
| `src/assets/` | Reserved for static frontend assets. |
| `src/styles/` | Reserved for additional style modules. |
| `src/index.css` | Tailwind directives and global styles. |

## Running Locally

From `frontend/`:

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal. For a production build:

```bash
npm run build
```

## Configuration

The shared Axios client can read `VITE_API_BASE_URL` to target a backend URL.
When not supplied, it uses its local development default. No application API
requests are implemented in the current frontend foundation.

## Future Pages

Planned pages include:

- Sign-in and access management
- Recruiter dashboard
- Candidate profile and application review
- Job management
- Resume and job analysis review
- Candidate matching and ranking review
- Settings and audit views
