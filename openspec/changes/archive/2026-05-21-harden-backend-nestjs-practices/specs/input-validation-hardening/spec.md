## ADDED Requirements

### Requirement: Validación estricta de entrada

El sistema SHALL validar todos los payloads de entrada contra sus DTOs usando una política global que elimine y rechace propiedades no declaradas.

#### Scenario: Propiedad no declarada en el DTO
- **WHEN** una petición incluye una propiedad que no está definida en el DTO del endpoint
- **THEN** el sistema responde 400 Bad Request indicando la propiedad no permitida

#### Scenario: Payload válido con transformación de tipos
- **WHEN** una petición incluye únicamente propiedades declaradas en el DTO
- **THEN** el sistema transforma los tipos primitivos según el DTO y procesa la petición normalmente

#### Scenario: Violación de reglas de class-validator
- **WHEN** una propiedad declarada incumple sus decoradores de validación (por ejemplo `@IsEmail`)
- **THEN** el sistema responde 400 Bad Request con los mensajes de validación correspondientes
