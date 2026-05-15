## Context

El sistema actual tiene usuarios y departamentos definidos como enums/seeds hardcodeados. Esto impide que administradores gestionen estos recursos sin modificar código.

**Estado actual:**
- `User` entity existe pero sin CRUD público
- `Department` es un TypeORM enum hardcodeado (`jovenes`, `adolescentes`, `familia`, etc.)
- No existe relación `User` ↔ `Department`

**Restricciones:**
- Backend en NestJS con autenticación JWT y roles
- Frontend en React con shadcn/ui
- API REST documentada con OpenAPI
- Seeders existentes deben mantenerse como semillas iniciales

## Goals / Non-Goals

**Goals:**
- CRUD de Usuarios: crear, editar, eliminar, asignar rol
- CRUD de Departamentos: convertir enum → entidad editable
- Relación User ↔ Department para designar directores
- Exponer gestión de plantillas en nuevo menú "Mantenedores"

**Non-Goals:**
- Self-service registration para usuarios
- Sistema de permisos granular adicional a los roles existentes
- Eliminación de usuarios con programas asociados (bloquear en ese caso)

## Decisions

### 1. Migrar `Department` de enum a entidad

**Decisión:** Crear tabla `departments` con columnas `id`, `name`, `created_at`, `updated_at`. Crear tabla pivote `user_departments` con `user_id`, `department_id`, `is_director`.

**Alternativas consideradas:**
- Mantener enum + tabla de relación: complica queries, datos duplicados
- Solo tabla `user_departments` sin tabla `departments`: no permite CRUD de departamentos

** rationale:** Permite CRUD completo de departamentos manteniendo relación many-to-many con usuarios.

### 2. Contraseñas de usuario

**Decisión:** Admin define contraseña temporal al crear usuario. Usuario debe cambiarla en primer login (implementación futura).

**Alternativa:** Sistema de reset password por email — complejidad innecesaria para usuarios internos.

### 3. Eliminación de departamentos

**Decisión:** Si un departamento tiene directores asignados, al eliminar se desvinculan automáticamente (is_director = false en user_departments).

**Alternativa:** Bloquear eliminación si tiene directores — prefiero la automización para evitar datos huérfanos.

### 4. Endpoints API

**Backend:**
```
GET/POST        /users
GET/PATCH/DELETE /users/:id

GET/POST         /departments
GET/PATCH/DELETE /departments/:id
GET              /departments/:id/directors  (usuarios con is_director=true)
```

**Frontend (rutas):**
```
/mantenedores/usuarios
/mantenedores/usuarios/nuevo
/mantenedores/usuarios/:id
/mantenedores/departamentos
/mantenedores/departamentos/nuevo
/mantenedores/departamentos/:id
/mantenedores/plantillas  (reutiliza existente)
```

### 5. Permisos

- `/users/*` — solo Admin
- `/departments/*` — solo Admin
- `/cultos/plantillas/*` — Admin + Pastor (ya existe)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Eliminar departamento deja eventos sin dept | Eventos tienen `department_id` nullable, se mantienen pero sin dept |
| Contraseñas en texto plano en algún momento | Hash bcrypt ya usado, no almacenar contraseñas en claro |
| Overlapping de specs con módulos existentes | Reutilizar `UsersModule` y `DepartmentsModule` como módulos separados |