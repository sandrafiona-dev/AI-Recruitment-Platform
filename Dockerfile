# ---------- Frontend build ----------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


# ---------- Backend + frontend ----------
FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend
COPY backend/ ./backend/

# Copy React production build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Python import path
ENV PYTHONPATH=/app/backend

# Render provides PORT at runtime
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
