## Context

Cada junta mensual de iglesia tiene contexto específico: quién ofició como pastor y quiénes fueron los ancianos de turno. Esto permite dar trazabilidad a los documentos y saber quién estaba liderazgo en ese período.

La iglesia tiene aproximadamente 10 ancianos que rotan en turnos de 2 semanas. El pastor puede cambiar según período (不对称 - no todos los períodos tienen el mismo pastor si hay cambios pastorales).

## Goals / Non-Goals

**Goals:**
- Agrupar documentos por período (quincena/mes)
- Mostrar automáticamente quién fue pastor y ancianos de turno para cada período
- Permitir filtrar documentos por período y ver contexto de liderazgo
- Programación automática de rotación de ancianos

**Non-Goals:**
- Edición manual de rotación (programación automática nomás)
- Permisos diferenciados por período
- Cambios retroactivos de rotación una vez creada

## Decisions

### 1. Modelo de datos: Period

**Decisión**: Crear entidad `Period` con:
- `id`: UUID
- `year`: número
- `month`: número (1-12)
- `periodNumber`: número (1=primera quincena, 2=segunda quincena) - o solo mes si no hay quincenas
- `startDate`: date
- `endDate`: date
- `pastorId`: relación a User (el pastor de turno en ese período)
- `notes`: string opcional

**Racional**: Cada período tiene duración fija y un pastor específico. Si hay cambio pastoral, los períodos reflejan quién estaba oficialmente.

### 2. Modelo de datos: ElderShift

**Decisión**: Crear entidad `ElderShift`:
- `id`: UUID
- `periodId`: relación a Period
- `elderId`: relación a User (anciano)
- `weekStart`: date (inicio de la semana de turno)
- `weekEnd`: date (fin de la semana de turno)

**Racional**: Permite saber exactamente qué anciano estuvo de turno en qué semana dentro del período.

### 3. Rotación automática de ancianos

**Decisión**: Algoritmo de rotación:
1. Configurar: número de ancianos en el roster, duración del turno (ej: 2 semanas)
2. Calcular cuántos turnos caben en el período
3. Asignar ancianos en orden Round-Robin, starting from stored counter

**Datos necesarios**:
- `ElderRoster`: lista de usuarios con rol Anciano
- `ElderRotation.startIndex`: índice del último anciano asignado (para siguiente período)

**Racional**: En lugar de programar cada semana manualmente, el sistema calcula automáticamente basándose en el roster de ancianos. Si cambia el roster, la próxima asignación usa el nuevo orden.

### 4. Relación Period ↔ Documents

**Decisión**: `ChurchDocument` tiene `periodId` opcional (FK a Period).

- Los documentos nuevos SE ASOCIAN a un período
- Documentos legacy pueden no tener período (NULL)

**Racional**: backwards compatibility - documentos existentes no requieren período.

### 5. Filtrado en frontend

**Decisión**: Interfaz permite:
1. Selector de año (dropdown)
2. Selector de período/mes dentro del año
3. Mostrar documentos del período seleccionado
4. Mostrar card de contexto: "Período: Marzo 2026 | Pastor: Juan Pérez | Ancianos de turno: Pedro, Pablo"

**Racional**: El usuario ve los documentos con el contexto de quién estaba liderando.

## Risks / Trade-offs

- **[Risk] Cambio de roster a mitad de año**: Si se agrega/retira un anciano, la rotación puede desfasarse.
  → **Mitigation**: El `startIndex` permite reiniciar desde cualquier punto. Documentar en UI que el admin puede recalcular si hay cambios.

- **[Risk] Períodos sin pastor asignado**: Si no hay pastor configurado, mostrar "Por asignar"
  → **Mitigation**: En UI mostrar placeholder, no romper visualización.

## Migration Plan

1. Crear entidades `Period` y `ElderShift` con migraciones
2. Agregar `periodId` como columna opcional en `ChurchDocument`
3. Crear endpoint POST `/periods` para crear período (pastor + ancianos automáticos)
4. Crear endpoint GET `/periods/:id` con pastor y ancianos de turno
5. Actualizar upload de documento para asociar a período
6. Actualizar frontend para mostrar selector de período y cards de contexto