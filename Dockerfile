# ==============================================================================
# SGD-Madurez: Sistema de Evaluación de Madurez y Plan de Acción de Gobierno de Datos
# Dockerfile Multi-stage (React Vite + FastAPI + Python 3.11)
# ==============================================================================

# -------------------------------------------------------------
# ETAPA 1: Construcción del Frontend React (Tailwind CSS)
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

# Copiar manifiestos e instalar dependencias
COPY sgd_sistema/frontend/package*.json ./
RUN npm install

# Copiar código fuente y compilar bundle para producción
COPY sgd_sistema/frontend ./
RUN npm run build

# -------------------------------------------------------------
# ETAPA 2: Runtime Backend FastAPI con Soporte PostgreSQL
# -------------------------------------------------------------
FROM python:3.11-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar utilitarios del sistema y librerías necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python de backend
COPY sgd_sistema/backend/requirements.txt /app/sgd_sistema/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/sgd_sistema/backend/requirements.txt

# Copiar código backend y plantillas institucionales
COPY sgd_sistema/backend /app/sgd_sistema/backend

# Copiar el bundle de producción compilado desde la etapa 1
COPY --from=frontend-builder /build/frontend/dist /app/sgd_sistema/frontend/dist

# Crear carpetas requeridas para uploads y templates
RUN mkdir -p /app/sgd_sistema/uploads /app/sgd_sistema/backend/templates

# Directorio de trabajo en el backend
WORKDIR /app/sgd_sistema/backend

# Puerto de la aplicación
EXPOSE 8000

# Ejecutar servidor Uvicorn en todas las interfaces de red del contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
