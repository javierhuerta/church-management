# public-gallery-content

## Purpose

Definir la especificacion del endpoint publico de galeria que expone el contenido publicado de albumes e imagenes al sitio publico sin autenticacion.

## Requirements

### Requirement: Endpoint público de galería

El sistema SHALL exponer un endpoint `GET /api/public/gallery` sin autenticación que devuelve los álbumes publicados con sus imágenes publicadas, ordenados por `sortOrder`, en un formato adecuado para el sitio público.

#### Scenario: Lectura anónima de galería
- **WHEN** el sitio público solicita `GET /api/public/gallery`
- **THEN** el sistema responde con un arreglo de álbumes publicados, cada uno con su arreglo de imágenes publicadas, sin requerir autenticación

#### Scenario: No exponer borradores
- **WHEN** existen álbumes o imágenes no publicados
- **THEN** el endpoint `GET /api/public/gallery` no los incluye en la respuesta

#### Scenario: Respuesta vacía cuando no hay contenido publicado
- **WHEN** no hay álbumes publicados
- **THEN** el endpoint responde con un arreglo vacío (200 OK)
