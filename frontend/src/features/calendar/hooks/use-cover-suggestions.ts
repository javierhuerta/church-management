import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError, CalendarService } from '@/lib/api'

export interface CoverSuggestion {
  id: string
  thumbUrl: string
  fullUrl: string
  downloadUrl: string
  author: string
  authorUrl: string
  color: string | null
}

interface CoverSuggestionsResponse {
  results: CoverSuggestion[]
  total: number
  page: number
}

export interface CoverSuggestionsState {
  results: CoverSuggestion[]
  isLoading: boolean
  isUnavailable: boolean
  error: string | null
}

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function useCoverSuggestions(query: string, page = 1): CoverSuggestionsState {
  const debouncedQuery = useDebouncedValue(query.trim(), 400)
  const enabled = debouncedQuery.length > 0

  const { data, error, isLoading, isFetching } = useQuery<CoverSuggestionsResponse>({
    queryKey: ['cover-suggestions', debouncedQuery, page],
    queryFn: () =>
      CalendarService.calendarControllerCoverSuggestions(
        debouncedQuery,
        String(page),
      ) as unknown as Promise<CoverSuggestionsResponse>,
    enabled,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status === 503) return false
      return failureCount < 1
    },
    staleTime: 5 * 60 * 1000,
  })

  const isUnavailable = error instanceof ApiError && error.status === 503
  const message =
    error instanceof Error && !isUnavailable ? error.message : null

  return {
    results: data?.results ?? [],
    isLoading: enabled && (isLoading || isFetching),
    isUnavailable,
    error: message,
  }
}

export function trackCoverSuggestion(photoId: string): void {
  CalendarService.calendarControllerTrackCoverSuggestion(photoId).catch(() => {
    // best-effort; tracking failure should not break the flow
  })
}
