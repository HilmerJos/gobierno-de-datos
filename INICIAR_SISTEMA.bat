@echo off
title Sistema SGD-Madurez - Gobierno de Datos (OTI / PCM)
echo ===============================================================================
echo     SISTEMA DE EVALUACION DE MADUREZ Y PLAN DE ACCION DE GOBIERNO DE DATOS
echo                 OTI - En cumplimiento de la ENGD 2026-2030 (PCM / CND)
echo                      Frontend React (Tailwind) + Backend FastAPI
echo ===============================================================================
echo.
echo Iniciando servidor backend y plataforma web...
cd /d "%~dp0\sgd_sistema\backend"
start http://127.0.0.1:8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause
