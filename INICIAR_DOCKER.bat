@echo off
title SGD-Madurez - Despliegue con Docker Compose
echo ===============================================================================
echo     SISTEMA DE EVALUACION DE MADUREZ Y PLAN DE ACCION DE GOBIERNO DE DATOS
echo               DESPLIEGUE EN CONTENEDORES DOCKER (FASTAPI + POSTGRESQL)
echo ===============================================================================
echo.
echo Verificando estado de Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop no esta en ejecucion.
    echo Por favor abre la aplicacion Docker Desktop y vuelve a ejecutar este script.
    echo.
    pause
    exit /b
)

echo Construyendo e iniciando contenedores (PostgreSQL 16 + FastAPI + React)...
docker compose up -d --build

echo.
echo ===============================================================================
echo El sistema esta en ejecucion en Docker:
echo   - Plataforma Web: http://localhost:8000
echo   - Base de Datos:  PostgreSQL en puerto 5432 (sgd_madurez)
echo ===============================================================================
echo.
echo Abriendo navegador web...
start http://localhost:8000
pause
