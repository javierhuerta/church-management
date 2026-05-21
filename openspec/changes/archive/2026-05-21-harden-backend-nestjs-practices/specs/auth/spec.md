## ADDED Requirements

### Requirement: El secret JWT es obligatorio y sin valor por defecto

El sistema SHALL requerir que el secret de firma de JWT se provea explícitamente por configuración. El sistema MUST NOT usar un secret por defecto embebido en el código.

#### Scenario: Arranque sin secret configurado
- **WHEN** la aplicación arranca sin la variable de entorno del secret JWT definida
- **THEN** el arranque falla y la aplicación no atiende peticiones

#### Scenario: Firma y verificación con el secret configurado
- **WHEN** el secret JWT está definido por configuración
- **THEN** la firma y verificación de tokens usan ese secret y nunca un fallback embebido

### Requirement: El password del usuario nunca se expone

El sistema SHALL excluir el campo `password` de toda respuesta serializada, independientemente del endpoint que retorne datos de usuario.

#### Scenario: Respuesta que incluye un usuario
- **WHEN** un endpoint retorna datos de un usuario
- **THEN** la respuesta no contiene el campo `password` ni su hash

#### Scenario: Retorno directo de la entidad User
- **WHEN** un endpoint retorna la entidad `User` directamente
- **THEN** el campo `password` se omite automáticamente de la serialización
