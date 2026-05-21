# Spec: Data Access Repositories

## Purpose

Encapsular el acceso a datos complejo en repositorios custom inyectables, manteniendo los servicios libres de queries TypeORM inline.

## Requirements

### Requirement: Acceso a datos complejo encapsulado en repositorios

El sistema SHALL encapsular las consultas complejas (queryBuilder, joins, filtros, paginación) en repositorios custom inyectables, de modo que los servicios no construyan queries de TypeORM inline.

#### Scenario: Servicio sin queries inline
- **WHEN** un servicio necesita una consulta compleja (filtrada, paginada o con múltiples relaciones)
- **THEN** delega en un método de un repositorio custom en lugar de construir el queryBuilder en el propio servicio

#### Scenario: Comportamiento preservado
- **WHEN** un endpoint que antes usaba lógica de query inline se sirve tras el refactor
- **THEN** devuelve los mismos resultados (mismos filtros, orden, relaciones y paginación) que antes

#### Scenario: Repositorio mockeable en tests
- **WHEN** se testea un servicio que depende de un repositorio custom
- **THEN** el repositorio puede sustituirse por un mock sin instanciar TypeORM
