/**
 * Copies properties from `source` into `target` only when they are defined,
 * preserving existing values for keys whose source value is `undefined`.
 * Useful for partial-update DTOs where omitted fields should not overwrite
 * the current entity value.
 */
export function assignDefined<T extends object>(
  target: T,
  source: Partial<T>,
): T {
  for (const key of Object.keys(source) as (keyof T)[]) {
    const value = source[key];
    if (value !== undefined) {
      target[key] = value;
    }
  }
  return target;
}
