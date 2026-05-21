## 1. Base y red de seguridad

- [~] 1.1 Verificación de contrato hecha por serialización aislada (`plainToInstance` con un objeto de prueba) por cada DTO migrado, comparando claves contra el mapper previo — sin snapshot del server completo (no hay DB disponible en esta sesión)
- [ ] 1.2 (Pendiente) test util compartido permanente "claves del DTO == claves esperadas"

## 2. Users (piloto, más simple)

- [x] 2.1 Anotar `user-response.dto.ts` con `@Expose`/`@Type`
- [x] 2.2 Reemplazar `toResponse()` en `users.service.ts` por `plainToInstance(UserResponseDto, entity, { excludeExtraneousValues: true })`
- [x] 2.3 Verificado: claves `id,name,email,role,departments,createdAt,updatedAt`; `departments` solo `id,name`; `password` no se filtra

## 3. Departments

- [x] 3.1 Anotar `department-response.dto.ts` con `@Expose`; `directors` vía `@Transform` (preserva `[]`)
- [x] 3.2 Reemplazar `toResponse()` en `departments.service.ts` por `plainToInstance`
- [x] 3.3 Verificado y mapper manual eliminado

## 4. Calendar

- [x] 4.1 Anotar `event-response.dto.ts`; `departmentName`/`coverImageUrl`/`organizers` con `@Transform`; `defaultCoverForType` movido a `utils/default-cover.ts`
- [x] 4.2 Reemplazar `toResponse()`/`toAttachmentResponse()` por `plainToInstance`
- [x] 4.3 Verificado: 20 claves idénticas, organizers user/text, fallback de cover, sin fugas

## 5. Worship-services (dejar de exponer entidades)

- [x] 5.1 Anotados `template-response.dto.ts`, `program-response.dto.ts`, `hymn-response.dto.ts` con `@Expose`/`@Type` (grupos/secciones/logs anidados)
- [x] 5.2 Mapeo a DTOs vía `plainToInstance` en los controllers de worship (hymn/template/program) — se mapea en el límite del controller para no alterar los returns de los servicios fuertemente testeados
- [x] 5.3 Verificado por serialización aislada: claves anidadas correctas y sin fuga de campos internos (INTERNAL/SECRET/PASS/EXTRA)

## 6. Cierre

- [x] 6.1 Confirmado: no quedan spreads manuales (los `toResponse` restantes son helpers `plainToInstance`); `getDirectors` proyecta vía SQL `id,name,email`; ningún controller retorna entidad cruda
- [ ] 6.2 (Pendiente, requiere servidor) Regenerar el cliente OpenAPI del frontend y confirmar cero diff de campos
- [x] 6.3 Build OK, lint limpio, 55/55 tests verdes
