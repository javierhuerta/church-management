#!/bin/sh
set -e

# -------------------------------------------------------
# Entrypoint de produccion — backend NestJS
# Uso desde Portainer (console del contenedor):
#   sh entrypoint.sh migrate          → corre migraciones
#   sh entrypoint.sh seed             → corre seeders
#   sh entrypoint.sh migrate-and-seed → ambos
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
    echo "▶ Corriendo seeders..."
    node dist/scripts/seeders/run-all.js
    ;;
  migrate-and-seed)
    echo "▶ Corriendo migraciones..."
    run_migrations
    echo "▶ Corriendo seeders..."
    node dist/scripts/seeders/run-all.js
    ;;
  *)
    echo "▶ Iniciando servidor..."
    exec node dist/src/main
    ;;
esac
