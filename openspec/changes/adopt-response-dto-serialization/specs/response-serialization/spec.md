## ADDED Requirements

### Requirement: Serialización declarativa de respuestas

El sistema SHALL construir todas las respuestas HTTP a partir de response DTOs anotados con class-transformer (`@Expose`), serializados con `excludeExtraneousValues`, de modo que solo los campos explícitamente expuestos lleguen al cliente. El sistema MUST NOT retornar entidades de base de datos directamente ni construir respuestas por mapeo manual campo-a-campo.

#### Scenario: Solo campos expuestos en la respuesta
- **WHEN** un endpoint retorna un recurso
- **THEN** la respuesta contiene exactamente los campos anotados con `@Expose` en su response DTO y ningún otro

#### Scenario: Campo no anotado se omite
- **WHEN** una entidad tiene un campo sin `@Expose` en el DTO correspondiente (por ejemplo `password` u otra columna interna)
- **THEN** ese campo no aparece en la respuesta

#### Scenario: Sin entidades crudas
- **WHEN** cualquier controlador o servicio produce una respuesta
- **THEN** el valor retornado es una instancia del response DTO, no una entidad de TypeORM

### Requirement: El contrato de respuesta se conserva

El sistema SHALL preservar el contrato de respuesta existente de cada endpoint tras adoptar la serialización declarativa: los mismos nombres de campo y la misma forma (incluyendo `null` donde el contrato actual devuelve `null`).

#### Scenario: Campos derivados conservan su forma
- **WHEN** un endpoint devuelve un campo calculado (por ejemplo `departmentName`, `coverImageUrl` o `organizers[].kind`)
- **THEN** ese campo se computa vía `@Transform`/`@Type` en el DTO y produce el mismo valor que el mapeo manual previo, usando `null` como fallback cuando corresponde

#### Scenario: Relaciones anidadas
- **WHEN** un response DTO incluye colecciones anidadas (adjuntos, organizadores, grupos, secciones)
- **THEN** cada elemento anidado se serializa con su propio response DTO anotado, sin exponer campos no declarados
