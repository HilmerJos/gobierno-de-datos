@echo off
title SGD-Madurez - Detener Contenedores Docker
echo ===============================================================================
echo     DETENIENDO CONTENEDORES DE GOBIERNO DE DATOS (SGD-MADUREZ)
echo ===============================================================================
echo.
docker compose down
echo.
echo Los contenedores han sido detenidos correctamente.
echo Los datos de la base de datos PostgreSQL se conservan intactos en el volumen de Docker.
echo.
pause
