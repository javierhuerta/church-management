#!/usr/bin/env bash
# Ejecuta comandos de Django apuntando a la base de datos de producción (Neon).
# Uso:
#   ./manage_prod.sh migrate
#   ./manage_prod.sh loaddata calendar_app/fixtures/initial_data.json
#   ./manage_prod.sh createsuperuser
#   ./manage_prod.sh shell

set -e

# Carga variables del archivo .env si existe
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

export DJANGO_SETTINGS_MODULE=church_management.settings_production

source .venv/bin/activate
python manage.py "$@"
