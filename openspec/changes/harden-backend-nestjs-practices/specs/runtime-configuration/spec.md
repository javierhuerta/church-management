## ADDED Requirements

### Requirement: Configuración validada al arranque

El sistema SHALL centralizar la configuración mediante `ConfigService` y validar las variables de entorno requeridas al arranque, fallando inmediatamente si falta alguna.

#### Scenario: Falta una variable requerida
- **WHEN** la aplicación arranca sin una variable de entorno requerida (por ejemplo `JWT_SECRET`)
- **THEN** el arranque falla con un mensaje claro que identifica la variable faltante

#### Scenario: Configuración completa
- **WHEN** todas las variables requeridas están presentes y son válidas
- **THEN** la aplicación arranca y los servicios obtienen la configuración a través de `ConfigService`, sin accesos directos a `process.env` en la lógica de aplicación

### Requirement: Health check y apagado controlado

El sistema SHALL exponer un endpoint de health check y SHALL cerrar de forma controlada al recibir señales de terminación.

#### Scenario: Health check con base de datos disponible
- **WHEN** se consulta `GET /api/health` y la base de datos responde
- **THEN** el sistema responde 200 con el estado de los componentes verificados

#### Scenario: Health check con base de datos no disponible
- **WHEN** se consulta `GET /api/health` y la base de datos no responde
- **THEN** el sistema responde con un estado de error indicando el componente afectado

#### Scenario: Apagado controlado
- **WHEN** el proceso recibe una señal de terminación (SIGTERM/SIGINT)
- **THEN** la aplicación ejecuta los hooks de apagado y cierra las conexiones abiertas antes de salir
