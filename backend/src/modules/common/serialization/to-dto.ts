import { ClassConstructor, plainToInstance } from 'class-transformer';

/**
 * Serializes a value (entity or array of entities) into its response DTO,
 * keeping only the fields decorated with `@Expose`. Centralizes the
 * `{ excludeExtraneousValues: true }` option so no controller or service
 * needs to repeat it.
 */
// Array overload first so it wins over the singular case when V is V[].
export function toDto<T, V extends object>(
  cls: ClassConstructor<T>,
  value: V[],
): T[];
export function toDto<T, V extends object>(
  cls: ClassConstructor<T>,
  value: V,
): T;
export function toDto<T>(
  cls: ClassConstructor<T>,
  value: object | object[],
): T | T[] {
  return plainToInstance(cls, value, { excludeExtraneousValues: true });
}
