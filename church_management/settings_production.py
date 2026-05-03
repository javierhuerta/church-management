"""
Settings de producción para Vercel + Neon PostgreSQL.

Hereda de settings.py base y sobreescribe lo necesario para producción.
Variables de entorno requeridas (configurar en Vercel Dashboard):
  - SECRET_KEY        → clave secreta Django (generar nueva)
  - DATABASE_URL      → URL de conexión PostgreSQL de Neon
  - ALLOWED_HOSTS     → dominio de Vercel, ej: church-management.vercel.app
"""

from .settings import *
import os
import dj_database_url

# ── Seguridad ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ["SECRET_KEY"]

DEBUG = False

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

# Agrega automáticamente *.vercel.app si no está incluido
ALLOWED_HOSTS += [".vercel.app", ".now.sh", "localhost", "127.0.0.1"]

# ── Base de datos: Neon PostgreSQL ─────────────────────────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        env="DATABASE_URL",
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# ── Archivos estáticos con WhiteNoise ─────────────────────────────────────────
# WHITENOISE_USE_FINDERS: WhiteNoise descubre archivos desde las apps instaladas
# (Django admin, theme, etc.) sin necesitar collectstatic. Válido para Vercel
# donde no podemos ejecutar pasos de build arbitrarios con @vercel/python.
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

WHITENOISE_USE_FINDERS = True

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}

STATIC_ROOT = BASE_DIR / "staticfiles"

# ── Seguridad HTTPS ────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ── django-browser-reload solo en desarrollo ──────────────────────────────────
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != "django_browser_reload"]
MIDDLEWARE = [m for m in MIDDLEWARE if "browser_reload" not in m]

# ── Logging básico ─────────────────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}
