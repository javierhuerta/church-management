#!/bin/sh
set -e

# -------------------------------------------------------
# Entrypoint de produccion — backend NestJS
# Uso desde Portainer (console del contenedor):
#   sh entrypoint.sh migrate                     → corre migraciones
#   sh entrypoint.sh seed                        → corre TODOS los seeders
#   sh entrypoint.sh seed catalog                → solo catalogo (prod-safe)
#   sh entrypoint.sh seed hymns departments      → seeders especificos
#   sh entrypoint.sh migrate-and-seed            → migraciones + todos los seeders
#   sh entrypoint.sh migrate-and-seed catalog    → migraciones + solo catalogo
#
# Categorias: catalog | demo
# Nombres:    rescue-stages | visit-statuses | departments | users |
#             templates | hymns | persons | rescue-members |
#             visits | small-groups | events
# -------------------------------------------------------

run_migrations() {
  node -e "
    const { AppDataSource } = require('./dist/data-source');
    AppDataSource.initialize()
      .then(ds => ds.runMigrations({ transaction: 'each' }))
      .then(migrations => {
        if (migrations.length === 0) {
          console.log('✔ Sin migraciones pendientes');
        } else {
          migrations.forEach(m => console.log('  ✔', m.name));
          console.log('✔ Total ejecutadas:', migrations.length);
        }
        process.exit(0);
      })
      .catch(e => {
        console.error('✘ Error en migraciones:', e.message);
        process.exit(1);
      });
  "
}

case "$1" in
  migrate)
    echo "▶ Corriendo migraciones..."
    run_migrations
    ;;
  seed)
    shift
    echo "▶ Corriendo seeders${1:+ [$@]}..."
    node dist/scripts/seeders/run-all.js "$@"
    ;;
  migrate-and-seed)
    shift
    echo "▶ Corriendo migraciones..."
    run_migrations
    echo "▶ Corriendo seeders${1:+ [$@]}..."
    node dist/scripts/seeders/run-all.js "$@"
    ;;
  *)
    echo "Starting server..."
    exec node dist/src/main
    ;;
esac
