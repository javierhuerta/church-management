## ADDED Requirements

### Requirement: Límite de tasa de peticiones

El sistema SHALL aplicar un límite de tasa de peticiones global y un límite reforzado en los endpoints de autenticación para mitigar abuso y ataques de fuerza bruta.

#### Scenario: Exceso de peticiones en login
- **WHEN** un cliente excede el límite configurado de intentos sobre `/auth/login` en la ventana de tiempo
- **THEN** el sistema responde 429 Too Many Requests hasta que la ventana se restablece

#### Scenario: Peticiones dentro del límite
- **WHEN** un cliente realiza peticiones por debajo del límite configurado
- **THEN** las peticiones se procesan normalmente

#### Scenario: Límite aplicado independiente del rol
- **WHEN** cualquier usuario, autenticado o no, supera el límite global
- **THEN** el sistema responde 429 sin distinción de rol
