import type { EventStatus, EventType } from '../hooks/use-calendar'
import type { EventResponseDto } from '@/lib/api'

export type MeetingType = EventResponseDto.meetingType

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  local: 'Local',
  asach: 'ASACH',
  distrital: 'Distrital',
}

export const EVENT_TYPE_STYLE: Record<EventType, { backgroundColor: string; color: string; dotColor: string }> = {
  local:     { backgroundColor: '#1B3A6B22', color: '#1B3A6B', dotColor: '#1B3A6B' },
  asach:     { backgroundColor: '#7C3AED22', color: '#5B21B6', dotColor: '#7C3AED' },
  distrital: { backgroundColor: '#0F766E22', color: '#0F766E', dotColor: '#0F766E' },
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

// Palette of visually distinct hues for department color generation.
// Chosen to be accessible and harmonious with the navy/gold brand palette.
const DEPT_HUE_PALETTE = [200, 160, 280, 30, 340, 60, 240, 100, 15, 190, 310, 140]

/**
 * Deterministically derives a color for any department name using a simple
 * hash. This ensures unknown/new departments always get a consistent color
 * without needing hardcoded mappings. Returns an HSLA-based style object.
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Returns a color style for a department.
 * If a hex `color` is provided (from the DB entity), it is used directly.
 * Otherwise falls back to a deterministic hash over the department name.
 */
export function getDepartmentStyle(
  name: string,
  color?: string | null,
): { backgroundColor: string; color: string; dotColor: string } {
  if (color) {
    return {
      dotColor: color,
      backgroundColor: `${color}22`,
      color,
    }
  }
  const hue = DEPT_HUE_PALETTE[hashString(name) % DEPT_HUE_PALETTE.length]
  const dotColor = `hsl(${hue} 65% 40%)`
  const backgroundColor = `hsl(${hue} 65% 40% / 0.12)`
  const textColor = `hsl(${hue} 65% 35%)`
  return { backgroundColor, color: textColor, dotColor }
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
