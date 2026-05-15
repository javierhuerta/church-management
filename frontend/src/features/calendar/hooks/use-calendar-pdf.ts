import type { EventResponseDto } from '@/lib/api'
import { format } from 'date-fns'

interface CalendarPdfFilters {
  departmentName?: string | null
  eventType?: string | null
}

export async function downloadCalendarPdf(
  currentMonth: Date,
  events: EventResponseDto[],
  filters: CalendarPdfFilters,
) {
  const [{ pdf }, { createElement }, { CalendarPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('react'),
    import('../components/calendar-pdf-document'),
  ])

  const element = createElement(CalendarPdfDocument, {
    currentMonth,
    events,
    filters,
  })
  const blob = await pdf(element as never).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `calendario-${format(currentMonth, 'yyyy-MM')}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
