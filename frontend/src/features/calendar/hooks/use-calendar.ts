import { useQuery } from '@tanstack/react-query'
import { CalendarService, EventResponseDto } from '@/lib/api'

export type EventType = EventResponseDto.eventType
export type EventStatus = EventResponseDto.status

// Kept for color/label lookup in display components (maps to slug-based names stored in DB)
export type Department = 'jovenes' | 'adolescentes' | 'familia' | 'mision' | 'escuela_sabatica' | 'musica' | 'conductores_jovenes' | 'ministerios' | 'salud' | 'comunicaciones'

export interface CalendarFilters {
  startDate?: string
  endDate?: string
  eventType?: EventType
  departmentId?: string
  status?: EventStatus
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function useCalendar(filters: CalendarFilters) {
  return useQuery({
    queryKey: ['calendar', filters],
    queryFn: () =>
      CalendarService.calendarControllerFindAll(
        1,
        100,
        filters.startDate,
        filters.endDate,
        filters.eventType,
        filters.departmentId,
        filters.status,
      ) as Promise<PaginatedResponse<EventResponseDto>>,
  })
}

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: ['calendar', 'slug', slug],
    queryFn: () => CalendarService.calendarControllerFindBySlug(slug) as Promise<EventResponseDto>,
    enabled: !!slug,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['calendar', 'id', id],
    queryFn: () => CalendarService.calendarControllerFindOne(id!) as Promise<EventResponseDto>,
    enabled: !!id,
  })
}
