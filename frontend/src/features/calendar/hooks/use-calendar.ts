import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
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

interface MonthPage {
  year: number
  month: number // 0-indexed (Date convention)
}

export interface CalendarInfiniteFilters {
  eventType?: EventType
  departmentId?: string
  startMonth?: Date // mes desde el que inicia la carga infinita
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999)
}

export function useCalendarInfinite(filters: CalendarInfiniteFilters) {
  const now = filters.startMonth ?? new Date()
  const initialPage: MonthPage = { year: now.getFullYear(), month: now.getMonth() }

  // Normalize startMonth to YYYY-MM string for stable queryKey
  const startMonthKey = `${initialPage.year}-${String(initialPage.month).padStart(2, '0')}`

  return useInfiniteQuery({
    queryKey: ['calendar', 'infinite', filters.eventType, filters.departmentId, startMonthKey],
    initialPageParam: initialPage,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    queryFn: ({ pageParam }) => {
      const { year, month } = pageParam as MonthPage
      return CalendarService.calendarControllerFindAll(
        1,
        100,
        startOfMonth(year, month).toISOString(),
        endOfMonth(year, month).toISOString(),
        filters.eventType,
        filters.departmentId,
        undefined,
      ) as Promise<PaginatedResponse<EventResponseDto>>
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const { year, month } = lastPageParam as MonthPage
      if (!lastPage || (lastPage as PaginatedResponse<EventResponseDto>).page >= (lastPage as PaginatedResponse<EventResponseDto>).totalPages) {
        return undefined
      }
      const next = new Date(year, month + 1, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    },
  })
}
