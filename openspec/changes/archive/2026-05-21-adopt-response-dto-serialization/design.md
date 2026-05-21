## Context

El `ClassSerializerInterceptor` global ya está registrado (cambio `harden-backend-nestjs-practices`), pero es inerte porque las respuestas se construyen como objetos planos sin metadatos de class-transformer, o como entidades sin `@Exclude`. Hoy hay dos patrones: mapeo manual (`toResponse()` en users/departments/calendar) y retorno directo de entidades (worship-services). El objetivo es converger a un único patrón declarativo sin alterar el contrato observable de la API.

## Goals / Non-Goals

**Goals:**
- Un solo patrón de serialización: response DTO anotado con `@Expose` + `plainToInstance(..., { excludeExtraneousValues: true })`.
- Eliminar los `toResponse()` manuales y el retorno de entidades crudas.
- Mantener el contrato de respuesta byte-a-byte (mismos campos, mismos nombres).

**Non-Goals:**
- Serialización por `groups`/rol, cambios de contrato, repository pattern, request DTOs.

## Decisions

**1. `plainToInstance` con `excludeExtraneousValues: true` en el servicio, no en el controller.**
Los servicios ya devuelven los DTOs hoy (`Promise<EventResponseDto>`), así que la conversión vive donde ya está la responsabilidad. `excludeExtraneousValues` garantiza que solo salgan los campos `@Expose`, evitando fugas. Alternativa descartada: `@SerializeOptions` + retorno de entidad en el controller — disponible, pero dispersa la lógica y deja a worship-services exponiendo entidades hasta que el interceptor actúe.

**2. Transformaciones derivadas con `@Transform`/`@Type` en el DTO.**
Campos calculados (`departmentName` desde `department.name`, `coverImageUrl` desde el attachment cover, `organizers[].kind` = `userId ? 'user' : 'text'`) se mueven del servicio al DTO con `@Transform(({ obj }) => ...)`. Relaciones anidadas usan `@Type(() => NestedDto)` + `@Expose`. Esto centraliza la forma de la respuesta junto a su declaración OpenAPI.

**3. `@Expose()` explícito en cada campo + clase con `@Exclude()` a nivel de propiedad sensible.**
Con `excludeExtraneousValues: true`, todo campo sin `@Expose` se omite por defecto, lo que da el comportamiento "lista blanca" deseado. La entidad `User` mantiene su `@Exclude()` en `password` como defensa en profundidad.

**4. Verificación de contrato por snapshot.**
Antes y después del refactor se captura el JSON de respuesta de cada endpoint (vía tests o el cliente generado) y se compara para garantizar cero diff. Es el control que hace seguro un refactor masivo sin tocar el contrato.

## Risks / Trade-offs

- **[Riesgo] `excludeExtraneousValues` omite un campo que olvidamos anotar** → cubrir cada DTO con un test que verifique las claves esperadas; comparar contra el snapshot previo.
- **[Riesgo] Relaciones no cargadas producen `undefined` donde antes el mapeo manual ponía `null`** → usar `@Transform` con fallback explícito a `null` para igualar el contrato actual.
- **[Riesgo] `@Transform` sobre relaciones perezosas dispara queries** → las relaciones ya se cargan con `relations:`/joins en los servicios; no se introduce lazy loading.
- **[Trade-off] Más decoradores en los DTOs** a cambio de eliminar ~4 mappers manuales y el riesgo de fuga.

## Migration Plan

1. Anotar un DTO + migrar su servicio (empezar por `users`, el más simple) y validar contrato.
2. Repetir para `departments`, `calendar`, y finalmente `worship-services` (el más complejo, con relaciones anidadas).
3. Eliminar los `toResponse()` ya sin uso.
4. Regenerar el cliente OpenAPI y confirmar cero diff de campos.

Rollback: cada módulo es independiente y revertible por commit; el contrato no cambia, así que un rollback parcial no rompe al frontend.

## Open Questions

- ¿Conviene un test util compartido que afirme "las claves del DTO serializado == claves esperadas" para los 6 DTOs?
