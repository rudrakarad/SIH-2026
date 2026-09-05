@echo off
title SURAKSHAI AI Disaster Management System
echo ========================================================
echo        SURAKSHAI - AI Disaster Management System
echo ========================================================
echo.
echo Starting FastAPI Server and Web Dashboard on http://localhost:8000 ...
echo.
cd /d %~dp0backend
py -m uvicorn main:app --port 8000
pause
