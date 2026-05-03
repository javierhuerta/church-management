#!/usr/bin/env bash
# Script ejecutado por Vercel durante el build.
# Instala dependencias, compila Tailwind y colecta archivos estáticos.

set -e

echo "==> Instalando dependencias Python..."
pip install -r requirements.txt --break-system-packages

echo "==> Compilando CSS Tailwind..."
python manage.py tailwind build

echo "==> Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

echo "==> Build completo."
