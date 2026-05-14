import type { Department, EventStatus, EventType } from '../hooks/use-calendar'
import type { EventResponseDto } from '@/lib/api'

export type MeetingType = EventResponseDto.meetingType

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  local: 'Local',
  asach: 'ASACH',
  distrital: 'Distrital',
}

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  local: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  asach: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  distrital: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  jovenes: 'Jóvenes',
  adolescentes: 'Adolescentes',
  familia: 'Familia',
  mision: 'Misión',
  escuela_sabatica: 'Escuela Sabática',
  musica: 'Música',
  conductores_jovenes: 'Conductores de Jóvenes',
  ministerios: 'Ministerios',
  salud: 'Salud',
  comunicaciones: 'Comunicaciones',
}

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  teams: 'Microsoft Teams',
  other: 'Otra plataforma',
}

export const EDITOR_ROLES = ['Admin', 'Pastor', 'Secretaria'] as const

export function isEditorRole(role: string | undefined | null): boolean {
  if (!role) return false
  return (EDITOR_ROLES as readonly string[]).includes(role)
}
