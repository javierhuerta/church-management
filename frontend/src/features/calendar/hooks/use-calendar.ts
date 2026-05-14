import { useQuery } from '@tanstack/react-query'
import {
  CalendarService,
  type Department,
  type EventStatus,
  type EventType,
} from '@/lib/api'

export interface CalendarFilters {
  startDate?: string
  endDate?: string
  eventType?: EventType
  department?: Department
  status?: EventStatus
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
        filters.department,
        filters.status,
      ),
  })
}

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: ['calendar', 'slug', slug],
    queryFn: () => CalendarService.calendarControllerFindBySlug(slug),
    enabled: !!slug,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['calendar', 'id', id],
    queryFn: () => CalendarService.calendarControllerFindOne(id!),
    enabled: !!id,
  })
}
