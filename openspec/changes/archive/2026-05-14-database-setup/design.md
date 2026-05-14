## Context

El backend ya tiene TypeORM configurado con PostgreSQL, pero usa `synchronize: true` lo cual modifica el esquema automáticamente. Esto es peligroso en producción y no permite control de versiones del esquema.

## Goals / Non-Goals

**Goals:**
- Migraciones TypeORM para control de versiones del esquema
- Seeders CLI para poblar datos de prueba
- Docker Compose para desarrollo local con PostgreSQL
- Scripts Docker para producción

**Non-Goals:**
- Configuración de producción en cloud (AWS, Railway)
- Migraciones de datos entre versiones
- Backups automatizados

## Decisions

### 1. TypeORM DataSource para CLI

**Decisión**: Usar archivo `data-source.ts` separado para el CLI de TypeORM.

```typescript
// data-source.ts
export const DataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
})
```

**Alternativa**: Usar ormconfig.js — Descartado porque no soporta entidades TypeScript directamente.

### 2. Scripts npm en backend

```json
{
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
  "migration:generate": "npm run typeorm -- migration:generate",
  "migration:run": "npm run typeorm -- migration:run",
  "migration:revert": "npm run typeorm -- migration:revert",
  "seed:run": "ts-node scripts/seeders/run-all.ts"
}
```

### 3. Estructura de seeders

```
backend/src/seeds/
├── index.ts                 # Entry point, runs all seeders
├── auth/
│   └── user.seeder.ts
└── calendar/
    └── event.seeder.ts

scripts/seeders/
└── run-all.ts             # Runner script
```

Cada seeder es una clase con método `run()` que inserta datos.

### 4. Docker Compose (dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: church_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

### 5. Docker Compose (prod)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
  app:
    build: .
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
    ports:
      - '3000:3000'
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `synchronize: true` en prod | Deshabilitar en app.module.ts con env NODE_ENV=production |
| Seeds insertan datos duplicados | Usar `onConflict: 'do nothing'` o verificar existencia |

## Migration Plan

1. Crear `data-source.ts` en backend
2. Agregar scripts npm en backend
3. Deshabilitar `synchronize` conditionally
4. Crear docker-compose.yml y docker-compose.prod.yml
5. Crear primer migration para users y events
6. Crear seeders iniciales
7. Agregar scripts db:* al raíz