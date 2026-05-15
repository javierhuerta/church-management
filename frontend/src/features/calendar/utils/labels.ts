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

export const DEPARTMENT_COLORS: Record<Department, { dot: string; bg: string; text: string }> = {
  jovenes:             { dot: 'bg-orange-400',  bg: 'bg-orange-50',  text: 'text-orange-700' },
  adolescentes:        { dot: 'bg-yellow-400',  bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  familia:             { dot: 'bg-green-500',   bg: 'bg-green-50',   text: 'text-green-700' },
  mision:              { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700' },
  escuela_sabatica:    { dot: 'bg-sky-500',     bg: 'bg-sky-50',     text: 'text-sky-700' },
  musica:              { dot: 'bg-purple-500',  bg: 'bg-purple-50',  text: 'text-purple-700' },
  conductores_jovenes: { dot: 'bg-teal-500',   bg: 'bg-teal-50',    text: 'text-teal-700' },
  ministerios:         { dot: 'bg-indigo-500',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  salud:               { dot: 'bg-lime-500',    bg: 'bg-lime-50',    text: 'text-lime-700' },
  comunicaciones:      { dot: 'bg-cyan-500',    bg: 'bg-cyan-50',    text: 'text-cyan-700' },
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
