# Despliegue

Las imágenes se construyen en GitHub Actions, se publican en GHCR y Dokploy solo hace pull + up.

## Ambientes

| Rama          | Ambiente Dokploy | Tag de imágenes        | Dominio                                 |
| ------------- | ---------------- | ---------------------- | --------------------------------------- |
| `main`        | production       | `:main` (y `:latest`)  | `iasdosornocentral.unach.app`           |
| `development` | staging          | `:development`         | Dominio generado por Dokploy            |

Un merge a `main` es un release a producción.

Imágenes: `ghcr.io/javierhuerta/church-management/{backend,frontend,website}`.

## Flujo CI/CD

1. Push a `main` o `development` (o ejecución manual) dispara `.github/workflows/docker.yml`.
2. Se construyen las tres imágenes (tags: rama, `latest` solo en `main`, `<rama>-<sha>`).
3. El job `deploy` llama al webhook del servicio Compose en Dokploy. Falla si la respuesta no es HTTP 200:
   - `400`: Auto Deploy desactivado en el servicio.
   - `404`: token inválido.
4. Dokploy hace pull de las imágenes (`pull_policy: always`) y recrea los contenedores.

### Secrets de GitHub

| Secret                          | Contenido                                              |
| ------------------------------- | ------------------------------------------------------ |
| `DOKPLOY_WEBHOOK_TOKEN_PROD`    | `refreshToken` del servicio Compose de producción      |
| `DOKPLOY_WEBHOOK_TOKEN_STAGING` | `refreshToken` del servicio Compose de staging         |

Se usa el token del webhook (limitado a un servicio) y no la API key de Dokploy, que da control total de la instancia.

## Configurar el servicio en Dokploy

Un servicio por ambiente, tipo **Compose**, con estos ajustes:

1. **Source**: `Raw`. Pegar el contenido de `docker-compose.dokploy.yml`.
2. **Environment**: definir las variables (ver abajo).
3. **Domains**: servicio `website`, puerto `80`, HTTPS activado. Crear el dominio real solo cuando el DNS ya apunte a Dokploy.
4. **Auto Deploy**: activado (necesario para el webhook). El token está en la configuración de Deploy del servicio.
5. **Isolated Deployment**: activado (Advanced). Obligatorio: sin esto, `website` queda también en la red compartida
   `dokploy-network`, donde otros proyectos tienen servicios llamados `frontend`/`backend`, y el nginx puede
   enrutar `/admin` o `/api` a contenedores ajenos (se observó un 400 de otra app en `/admin/`).

No cambiar los nombres de servicio `backend` y `frontend` ni el puerto `3000`: el nginx de `website` los tiene fijos.
El backend corre tareas internas (`@Interval`), por lo que debe haber una sola réplica.

### Variables de entorno

Requeridas: `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET` (mínimo 16 caracteres; `openssl rand -hex 32`).

Imágenes: `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `WEBSITE_IMAGE` (con el tag del ambiente, ej. `...:development` en staging).

Opcionales (tienen default): `DB_PORT`, `PORT`, `CORS_ORIGIN` (URL pública del ambiente), `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `THROTTLE_TTL`, `THROTTLE_LIMIT`, `LOG_LEVEL`, `UPLOAD_MAX_BYTES`, `COVER_MAX_BYTES`, `MAX_ATTACHMENTS_PER_EVENT`, `CACHE_TTL_DEFAULT`, `CACHE_MAX`, `UNSPLASH_ACCESS_KEY`, `YOUTUBE_API_KEY`, `BACKUP_RETAIN_DAYS`.

## Migraciones y seeders

No corren solas. En Dokploy, abrir la terminal del contenedor `backend` y ejecutar:

```sh
sh entrypoint.sh migrate
sh entrypoint.sh seed catalog          # seeders específicos (seguro en producción)
sh entrypoint.sh migrate-and-seed catalog
```

## Backups

El servicio `backup` genera un dump diario de Postgres (SQL plano comprimido, `<db>-YYYYMMDD-HHMMSS.sql.gz`, con
enlace `<db>-latest.sql.gz`) en el volumen `backups_data` (`/backups/last`, `/backups/daily`, ...).
Retención: `BACKUP_RETAIN_DAYS` días (default 7), 2 semanas y 1 mes.

## Restauración

Detener `backend` durante la restauración.

Desde un backup del servicio `backup` (`.sql.gz`), en la terminal del contenedor `postgres`:

```sh
gunzip -c /ruta/al/backup.sql.gz | psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

Desde un dump en formato custom (`pg_dump -Fc`):

```sh
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-acl /tmp/dump
```

Uploads: un tar cuya raíz es `uploads/` se extrae en `/app` y los archivos deben quedar del usuario `appuser`
(uid 100, gid 101), o el backend no podrá escribir nuevos archivos:

```sh
tar -xf /tmp/uploads.tar -C /app && chown -R 100:101 /app/uploads
```

Sin acceso SSH al host de Dokploy, los archivos se pueden subir con la API (`docker.uploadFileToContainer`).
Ese endpoint pasa el contenido como argumento de un comando, por lo que falla con `E2BIG` sobre ~100 KB:
hay que partir el archivo (`split -b 90000`), subir las partes a un volumen (ej. `/backups` del servicio `backup`)
y reensamblarlas con un servicio temporal de una sola ejecución en el compose (así se hizo la migración desde
Portainer el 2026-10-07).

## Desarrollo local (podman)

```sh
podman run -d --name church-management-db \
  -e POSTGRES_DB=church_management -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -v church_management_pgdata:/var/lib/postgresql/data \
  docker.io/library/postgres:16-alpine

cp backend/.env.example backend/.env   # ajustar valores si es necesario
npm install
npm run db:migrate
npm run dev:backend    # terminal 1 (puerto 3000)
npm run dev:frontend   # terminal 2 (puerto 5173)
```

Reiniciar la base: `podman start church-management-db`. Nunca versionar `backend/.env` ni secretos reales.
