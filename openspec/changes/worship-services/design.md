## Context

La iglesia adventista de Osorno Central necesita sistematizar la gestión de sus cultos semanales. El sistema actual no permite definir anticipadamente quién lidera cada sección, qué himno se canta, ni lleva control de cambios realizados al programa.

El módulo de Calendario (existente) maneja eventos genéricos. Los cultos son un dominio separado con necesidades específicas:
- Plantillas predefinidas por tipo de culto
- Asignación de responsables por sección
- Control de tiempos (hora de inicio y duración)
- Historial de cambios para trazabilidad

## Goals / Non-Goals

**Goals:**
- Permitir crear y editar plantillas de cultos con secciones configurables
- Soportar grupos de secciones (ej: "Escuela Sabática" con sus sub-secciones)
- Crear programas de culto a partir de plantillas
- Registrar auditoría de todos los cambios en programas
- Proveer selector de himnos con búsqueda por número o nombre

**Non-Goals:**
- Integración directa con módulo de Calendario
- Notificaciones automáticas
- Gestión de asistencia
- Estadísticas o reportes

## Decisions

### 1. Estructura de plantillas: grupos + secciones

Las secciones del culto pueden agruparse lógicamente (ej: "Escuela Sabática" agrupa lecciones, oración, etc.). Los grupos son opcionales.

```
ServiceTemplate
├── type: CULTO_SABATICO | CULTO_JA | CULTO_ORACION | OTRO
├── groups[] (opcional)
│   ├── name
│   ├── startTime, endTime (opcional)
│   └── sections[]
│       └── name, order
└── sections[] (sin grupo)
    └── name, order
```

**Alternativa descartada**: Secciones flat sin grupos. Descartado porque no refleja la realidad del culto del sábado (Escuela Sabática + Culto Divino son bloques distintos con tiempos propios).

### 2. Programas copian datos de plantillas (no referencian)

Cuando se crea un programa desde una plantilla, los datos se copian. El programa es independiente de la plantilla después de la creación.

**Alternativa descartada**: Programas referencian plantilla y heredan cambios. Descartado porque si se edita la plantilla, programas ya publicados podrían cambiar inesperadamente.

### 3. Responsables como texto libre (no FK a Users)

El campo `responsible` en cada sección es texto plano, pero con autocomplete que sugiere nombres de usuarios del sistema.

**Alternativa descartada**: FK a tabla Users. Descartado porque personas sin cuenta en el sistema también pueden estar a cargo de una sección (visitantes, etc.).

### 4. Logs de auditoría con valores libres

El log guarda `previousValue` y `newValue` como texto, y `action` también es texto libre descriptivo.

**Alternativa descartada**: Enum estructurado para actions. Descartado porque los cambios varían mucho y un enum sería restrictivo.

### 5. Hymn database con 695 himnos

Tabla `Hymn` con número (1-695), nombre, y flag `isActive`. Seeder con datos del himnario adventista.

**Alternativa descartada**: Himnos solo como texto. Descartado porque el selector con autocomplete necesita una base de datos consultable.

## Data Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ServiceTemplate                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  id (uuid)                                                               │
│  name: string                                                           │
│  description: string (nullable)                                         │
│  type: enum (CULTO_SABATICO, CULTO_JA, CULTO_ORACION, OTRO)            │
│  isActive: boolean (default true)                                       │
│  createdAt, updatedAt                                                   │
│                                                                             │
│  groups[] ─────────────────────────────────────────────────────────     │
│  │   id, name, startTime, endTime, order, templateId                    │
│  │   sections[]                                                         │
│  │       id, name, order, groupId (nullable if top-level)              │
│                                                                             │
│  sections[] (top-level, sin grupo)                                      │
│      id, name, order, templateId                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ServiceProgram                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  id (uuid)                                                               │
│  date: date                                                             │
│  templateId: ref                                                         │
│  status: enum (DRAFT, PUBLISHED)                                        │
│  createdById, publishedById (nullable), publishedAt (nullable)          │
│  createdAt, updatedAt                                                   │
│                                                                             │
│  groups[] (copiados de template, editables)                             │
│  │   id, name, startTime, endTime, order, programId                    │
│  │   sections[]                                                         │
│  │       id, startTime, duration, responsible, hymnText,              │
│  │           notes, order, programGroupId                              │
│                                                                             │
│  sections[] (top-level, editables)                                      │
│      id, startTime, duration, responsible, hymnText,                    │
│          notes, order, programId                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ServiceProgramLog                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  id (uuid)                                                               │
│  programId: ref                                                         │
│  userId: ref                                                            │
│  sectionId: ref (nullable - null si es cambio global)                  │
│  action: string (ej: "asignó responsable", "cambió himno")           │
│  previousValue: string                                                  │
│  newValue: string                                                       │
│  createdAt                                                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                               Hymn                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  id (uuid)                                                               │
│  number: int (unique, 1-695)                                            │
│  name: string                                                           │
│  isActive: boolean (default true)                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints (Backend)

### Templates

- `GET /worship-services/templates` - Listar plantillas
- `GET /worship-services/templates/:id` - Ver plantilla con grupos y secciones
- `POST /worship-services/templates` - Crear plantilla (Admin, Pastor)
- `PATCH /worship-services/templates/:id` - Editar plantilla (Admin, Pastor)
- `DELETE /worship-services/templates/:id` - Eliminar plantilla (Admin, Pastor)

### Programs

- `GET /worship-services/programs` - Listar programas (filtro por fecha)
- `GET /worship-services/programs/:id` - Ver programa con logs
- `POST /worship-services/programs` - Crear programa desde plantilla (Admin, Pastor, Anciano, DirectorDepartamento)
- `PATCH /worship-services/programs/:id` - Editar programa
  - Si DRAFT: cualquier usuario con permisos
  - Si PUBLISHED: solo Admin o el creador original
- `POST /worship-services/programs/:id/publish` - Publicar programa
- `DELETE /worship-services/programs/:id` - Eliminar programa (Admin)

### Logs

- `GET /worship-services/programs/:id/logs` - Ver historial de cambios

### Hymns

- `GET /hymns` - Listar himnos (filtro por número o nombre)
- `GET /hymns/:id` - Ver himno

## Permissions Matrix

| Rol | Plantillas (CRUD) | Programas (CRUD) | Publicar |
|-----|-------------------|-------------------|----------|
| Admin | ✓ | ✓ | ✓ |
| Pastor | ✓ | ✓ | ✓ |
| Anciano | | ✓ | |
| DirectorDepartamento | | ✓ | |

**Edición de programas PUBLISHED**: Admin + creador original (si es Admin o Pastor)

## Frontend Components (Vista)

### Plantillas

- `/worship-services/templates` - Lista de plantillas
- `/worship-services/templates/new` - Crear plantilla
- `/worship-services/templates/:id/edit` - Editar plantilla

### Programas

- `/worship-services/programs` - Lista de programas (calendario)
- `/worship-services/programs/new` - Crear programa (selecciona plantilla + fecha)
- `/worship-services/programs/:id` - Ver/editar programa con logs

## Risks / Trade-offs

- **[Risk]** Himnario tiene 695 himnos - el seeder puede ser lento
  - **Mitigation**: Usar batch insert en TypeORM

- **[Risk]** Editar plantillas después de crear programas no afecta programas existentes
  - **Mitigation**: Diseñado intencionalmente para no afectar programas ya creados

- **[Risk]** Autocomplete de responsables busca en Users pero guarda texto
  - **Mitigation**: Eso permite guardar cualquier nombre, no solo usuarios del sistema

## Open Questions

1. ¿Los grupos siempre tienen tiempos? (Respondido: no, opcional pero la UI lo sugiere)
2. ¿Se necesita endpoint para sugerir responsables desde Users? (Sí, para el autocomplete)
3. ¿El tipo de plantilla se usa solo para filtrar o tiene otra utilidad? (Solo para filtrar en el selector de plantilla al crear programa)