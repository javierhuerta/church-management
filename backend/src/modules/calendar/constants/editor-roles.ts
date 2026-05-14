import { UserRole } from '../../common/entities/user-role.enum';

export const EDITOR_ROLES: readonly UserRole[] = [
  UserRole.Admin,
  UserRole.Pastor,
  UserRole.Secretaria,
] as const;

export function isEditorRole(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  return EDITOR_ROLES.includes(role);
}
