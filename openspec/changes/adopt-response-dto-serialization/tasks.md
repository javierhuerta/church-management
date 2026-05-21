## 1. Base y red de seguridad

- [ ] 1.1 Capturar un snapshot del JSON de respuesta de cada endpoint actual (vía tests o cliente generado) para comparación de contrato post-refactor
- [ ] 1.2 Añadir un test util compartido que afirme "claves del DTO serializado == claves esperadas" reutilizable por los 6 DTOs

## 2. Users (piloto, más simple)

- [ ] 2.1 Anotar `user-response.dto.ts` con `@Expose` (y `@Transform`/`@Type` donde haya campos derivados)
- [ ] 2.2 Reemplazar `toResponse()` en `users.service.ts` por `plainToInstance(UserResponseDto, entity, { excludeExtraneousValues: true })`
- [ ] 2.3 Verificar contrato sin diff y eliminar el `toResponse()` manual

## 3. Departments

- [ ] 3.1 Anotar `department-response.dto.ts` con `@Expose`; mover el cálculo de directores a `@Transform`/`@Type`
- [ ] 3.2 Reemplazar `toResponse()` en `departments.service.ts` por `plainToInstance`
- [ ] 3.3 Verificar contrato y eliminar el mapper manual

## 4. Calendar

- [ ] 4.1 Anotar `event-response.dto.ts` (`EventResponseDto`, `AttachmentResponseDto`, `OrganizerResponseDto`) con `@Expose`/`@Type`; expresar `departmentName`, `coverImageUrl` y `organizers[].kind` con `@Transform`
- [ ] 4.2 Reemplazar `toResponse()`/`toAttachmentResponse()` en `calendar.service.ts` por `plainToInstance`
- [ ] 4.3 Verificar contrato (incluyendo adjuntos y organizadores anidados) y eliminar los mappers manuales

## 5. Worship-services (dejar de exponer entidades)

- [ ] 5.1 Anotar `template-response.dto.ts`, `program-response.dto.ts`, `hymn-response.dto.ts` con `@Expose`/`@Type` para grupos/secciones/logs anidados
- [ ] 5.2 Mapear las salidas de `template-crud.service.ts`, `program.service.ts` y `hymn.service.ts` a sus response DTOs con `plainToInstance` (en vez de retornar entidades)
- [ ] 5.3 Verificar contrato de templates, programas y himnos sin diff

## 6. Cierre

- [ ] 6.1 Confirmar que no quedan `toResponse()` manuales ni retornos de entidad cruda en controllers/servicios
- [ ] 6.2 Regenerar el cliente OpenAPI del frontend y confirmar cero diff de campos
- [ ] 6.3 Ejecutar lint, build y la suite de tests; añadir/ajustar tests de serialización por DTO
