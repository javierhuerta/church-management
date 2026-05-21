## ADDED Requirements

### Requirement: Cabeceras de seguridad HTTP

El sistema SHALL incluir cabeceras de seguridad HTTP en todas las respuestas para reducir la superficie de ataques comunes del navegador.

#### Scenario: Cabeceras presentes en cualquier respuesta
- **WHEN** un cliente recibe cualquier respuesta de la API
- **THEN** la respuesta incluye las cabeceras de seguridad estándar (por ejemplo las aportadas por helmet, como `X-Content-Type-Options` y `X-DNS-Prefetch-Control`)

#### Scenario: Compatibilidad con servido de archivos estáticos
- **WHEN** se sirve un archivo desde `/uploads`
- **THEN** las cabeceras de seguridad se aplican sin impedir la carga de los recursos legítimos
