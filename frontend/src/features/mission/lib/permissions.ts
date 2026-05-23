/**
 * Roles con control total del módulo misionero: pueden crear, editar y
 * eliminar registros. Los demás roles tienen acceso de solo lectura.
 */
const MISSION_FULL_ACCESS_ROLES = [
  'Admin',
  'Pastor',
  'Anciano',
  'CoordinadorMisionero',
]

export function getUserRole(): string | null {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload)) as { role?: string }
    return decoded.role ?? null
  } catch {
    return null
  }
}

export function hasMissionFullAccess(): boolean {
  const role = getUserRole()
  return role !== null && MISSION_FULL_ACCESS_ROLES.includes(role)
}

export function isMaestroClase(): boolean {
  return getUserRole() === 'MaestroClase'
}

/** Returns the userId from the JWT payload */
export function getUserId(): string | null {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload)) as { sub?: string }
    return decoded.sub ?? null
  } catch {
    return null
  }
}
