import { UserRole } from '../../common/entities/user-role.enum';

/**
 * Roles con control total del módulo misionero: pueden crear, editar y
 * eliminar registros en todas las capacidades del módulo.
 */
export const MISSION_FULL_ACCESS_ROLES: readonly UserRole[] = [
  UserRole.Admin,
  UserRole.Pastor,
  UserRole.Anciano,
  UserRole.CoordinadorMisionero,
] as const;

export function hasMissionFullAccess(
  role: UserRole | undefined | null,
): boolean {
  if (!role) return false;
  return MISSION_FULL_ACCESS_ROLES.includes(role);
}
