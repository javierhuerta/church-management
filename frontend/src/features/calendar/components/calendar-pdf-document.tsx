import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventResponseDto } from '@/lib/api'
import { EVENT_TYPE_STYLE, EVENT_TYPE_LABELS } from '../utils/labels'
import logoFull from '@/assets/images/logo.png'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'
const CREAM = '#FAF6F0'
const WHITE = '#FFFFFF'
const TEXT_DARK = '#1B3A6B'
const TEXT_MUTED = '#6B7280'
const BORDER = '#E5E7EB'
const BORDER_LIGHT = '#F3F4F6'
const OUT_OF_MONTH_BG = '#FAF6F0'

// Status colors for PDF
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft:     { bg: '#FEF3C7', text: '#92600A' },
  archived:  { bg: '#F1F5F9', text: '#475569' },
  published: { bg: '#D1FAE5', text: '#065F46' },
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_DARK,
    backgroundColor: CREAM,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: WHITE,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    marginBottom: 8,
  },
  logo: { width: 52, height: 52, objectFit: 'contain' as const, marginRight: 14 },
  headerLeft: { flex: 1 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  churchName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    letterSpacing: 0.3,
  },
  churchSubtitle: { fontSize: 8, color: TEXT_MUTED, marginTop: 2 },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: 'capitalize',
    marginLeft: 20,
  },
  filtersLine: { fontSize: 7, color: TEXT_MUTED, marginTop: 4 },
  goldBar: {
    height: 0,
  },
  weekdayRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: NAVY,
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: 5,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  weekdayCellLast: { borderRightWidth: 0 },
  week: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  bandsRow: {
    flexDirection: 'row',
    paddingVertical: 1,
    minHeight: 0,
    position: 'relative',
  },
  bandSpacer: { height: 1 },
  band: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginVertical: 1,
    marginHorizontal: 1,
  },
  daysRow: {
    flexDirection: 'row',
    minHeight: 76,
  },
  dayCell: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: BORDER_LIGHT,
    backgroundColor: WHITE,
  },
  dayCellLast: { borderRightWidth: 0 },
  outOfMonth: { backgroundColor: OUT_OF_MONTH_BG },
  dayNumber: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  dayNumberMuted: { color: '#A3A3A3' },
  todayCell: {
    backgroundColor: '#FEF9EF',
    borderTopWidth: 2,
    borderTopColor: GOLD,
  },
  eventBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 3,
    marginBottom: 1,
    borderLeftWidth: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
    marginTop: 2,
  },
  eventTitle: {
    fontSize: 6.5,
    flex: 1,
    fontFamily: 'Helvetica',
  },
  eventDraft: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#D97706',
  },
  moreText: {
    fontSize: 6,
    color: TEXT_MUTED,
    marginTop: 1,
    paddingHorizontal: 3,
    fontFamily: 'Helvetica-Bold',
  },
  listingTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textTransform: 'capitalize',
    marginLeft: 20,
  },
  listingRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    backgroundColor: WHITE,
  },
  listingDate: { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY },
  listingTime: { width: '14%', fontSize: 8, color: TEXT_MUTED },
  listingTitleCell: { width: '40%', fontSize: 8 },
  listingDept: { width: '28%', fontSize: 7 },
  badge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 6,
    alignSelf: 'flex-start',
    marginBottom: 1,
  },
  listingHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: NAVY,
    borderRadius: 4,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    backgroundColor: WHITE,
    marginTop: 4,
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerGold: { fontSize: 7, color: GOLD, fontFamily: 'Helvetica-Bold' },
})

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isMultiDay(event: EventResponseDto): boolean {
  const s = startOfDay(new Date(event.startDate))
  const e = startOfDay(new Date(event.endDate))
  return e.getTime() > s.getTime()
}

function buildWeeks(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - offset)

  const weeks: Date[][] = []
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setDate(start.getDate() + w * 7 + d)
      week.push(day)
    }
    weeks.push(week)
  }
  return weeks
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

interface MultiDayBand {
  event: EventResponseDto
  startCol: number
  endCol: number
}

function buildBandsForWeek(multiDayEvents: EventResponseDto[], weekDays: Date[]): MultiDayBand[] {
  const wStart = startOfDay(weekDays[0])
  const wEnd = startOfDay(weekDays[6])
  const bands: MultiDayBand[] = []

  for (const event of multiDayEvents) {
    const evStart = startOfDay(new Date(event.startDate))
    const evEnd = startOfDay(new Date(event.endDate))
    if (evEnd < wStart || evStart > wEnd) continue

    let startCol = 0
    for (let i = 0; i < 7; i++) {
      if (startOfDay(weekDays[i]) >= evStart) { startCol = i; break }
    }
    let endCol = 6
    for (let i = 6; i >= 0; i--) {
      if (startOfDay(weekDays[i]) <= evEnd) { endCol = i; break }
    }
    bands.push({ event, startCol, endCol })
  }
  return bands
}

function toInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 4)
}

function formatDateRange(start: Date, end: Date): string {
  const sameDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()
  if (sameDay) return `${format(start, 'd MMM', { locale: es })} · ${format(start, 'HH:mm')}–${format(end, 'HH:mm')}`
  return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM', { locale: es })}`
}

interface FiltersInfo {
  departmentName?: string | null
  eventType?: string | null
}

interface Props {
  currentMonth: Date
  events: EventResponseDto[]
  filters: FiltersInfo
}

const MAX_EVENTS_PER_CELL = 2

export function CalendarPdfDocument({ currentMonth, events, filters }: Props) {
  const monthIdx = currentMonth.getMonth()
  const weeks = buildWeeks(currentMonth)
  const monthName = format(currentMonth, "MMMM yyyy", { locale: es })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const multiDayEvents = events.filter(isMultiDay)
  const singleDayEvents = events.filter((e) => !isMultiDay(e))

  const singleByDay = new Map<string, EventResponseDto[]>()
  for (const event of singleDayEvents) {
    const key = dayKey(new Date(event.startDate))
    const list = singleByDay.get(key) ?? []
    list.push(event)
    singleByDay.set(key, list)
  }

  const filterParts: string[] = []
  if (filters.departmentName) filterParts.push(`Depto: ${filters.departmentName}`)
  if (filters.eventType) {
    const label = EVENT_TYPE_LABELS[filters.eventType as keyof typeof EVENT_TYPE_LABELS] ?? filters.eventType
    filterParts.push(`Tipo: ${label}`)
  }
  const filtersLine = filterParts.length > 0 ? `Filtros: ${filterParts.join(' | ')}` : 'Sin filtros activos'

  const hasOverflow = Array.from(singleByDay.values()).some((list) => list.length > MAX_EVENTS_PER_CELL)
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <Document>
      {/* Página 1: Grid del calendario */}
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoFull} style={styles.logo} />
          <View style={styles.headerLeft}>
            <View style={styles.headerTopRow}>
              <Text style={styles.churchName}>Iglesia Adventista del Séptimo Día — Osorno Central</Text>
              <Text style={styles.monthTitle}>{monthName}</Text>
            </View>
            {filtersLine !== 'Sin filtros activos' && (
              <Text style={styles.filtersLine}>{filtersLine}</Text>
            )}
          </View>
        </View>
        <View style={styles.goldBar} />

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <Text key={d} style={[styles.weekdayCell, i === 6 ? styles.weekdayCellLast : {}]}>
              {d}
            </Text>
          ))}
        </View>

        {weeks.map((weekDays, weekIdx) => {
          const bands = buildBandsForWeek(multiDayEvents, weekDays)
          return (
            <View key={weekIdx} style={styles.week}>
              {bands.length > 0 && (
                <View>
                  {bands.map((band, i) => {
                    const typeStyle = EVENT_TYPE_STYLE[band.event.eventType] ?? EVENT_TYPE_STYLE.local
                    const deptStyle = band.event.departmentName
                      ? { dotColor: band.event.departmentColor ?? typeStyle.dotColor }
                      : null
                    const dotColor = deptStyle ? deptStyle.dotColor : typeStyle.dotColor
                    return (
                      <View key={`${band.event.id}-${i}`} style={styles.bandsRow}>
                        {Array.from({ length: 7 }).map((_, col) => {
                          const inBand = col >= band.startCol && col <= band.endCol
                          if (!inBand) return <View key={col} style={{ flex: 1 }} />
                          if (col === band.startCol) {
                            const span = band.endCol - band.startCol + 1
                            return (
                              <View key={col} style={{ flex: span, flexDirection: 'row' }}>
                                <Text
                                  style={[
                                    styles.band,
                                    {
                                      backgroundColor: `${dotColor}28`,
                                      color: dotColor,
                                      flex: 1,
                                      borderLeftWidth: 2,
                                      borderLeftColor: dotColor,
                                    },
                                  ]}
                                >
                                  {band.event.title}
                                </Text>
                              </View>
                            )
                          }
                          return null
                        })}
                      </View>
                    )
                  })}
                </View>
              )}

              <View style={styles.daysRow}>
                {weekDays.map((cell, dayIdx) => {
                  const inMonth = cell.getMonth() === monthIdx
                  const isToday = startOfDay(cell).getTime() === today.getTime()
                  const key = dayKey(cell)
                  const dayEvents = singleByDay.get(key) ?? []
                  const visible = dayEvents.slice(0, MAX_EVENTS_PER_CELL)
                  const overflow = dayEvents.length - visible.length

                  return (
                    <View
                      key={dayIdx}
                      style={[
                        styles.dayCell,
                        dayIdx === 6 ? styles.dayCellLast : {},
                        inMonth ? {} : styles.outOfMonth,
                        isToday ? styles.todayCell : {},
                      ]}
                    >
                      <Text style={[styles.dayNumber, inMonth ? {} : styles.dayNumberMuted]}>
                        {cell.getDate()}
                      </Text>
                      {visible.map((event) => {
                        const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
                        const isDraft = event.status === 'draft'
                        const statusCfg = event.status !== 'published' ? STATUS_COLORS[event.status] : null
                        return (
                          <View
                            key={event.id}
                            style={[
                              styles.eventBox,
                              {
                                backgroundColor: statusCfg ? statusCfg.bg : typeStyle.backgroundColor,
                                borderLeftColor: statusCfg ? statusCfg.text : typeStyle.dotColor,
                              },
                              isDraft ? styles.eventDraft : {},
                            ]}
                          >
                            <View style={[styles.eventDot, { backgroundColor: statusCfg ? statusCfg.text : typeStyle.dotColor }]} />
                            <Text style={[styles.eventTitle, { color: statusCfg ? statusCfg.text : typeStyle.color }]}>
                              {event.title}
                            </Text>
                          </View>
                        )
                      })}
                      {overflow > 0 && (
                        <Text style={styles.moreText}>+{overflow}</Text>
                      )}
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Iglesia Adventista del Séptimo Día — Osorno Central</Text>
          <Text style={styles.footerGold}>Generado: {format(new Date(), "d 'de' MMM yyyy, HH:mm", { locale: es })}</Text>
        </View>
      </Page>

      {/* Página 2: Listado completo */}
      {(hasOverflow || multiDayEvents.length > 0 || events.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Image src={logoFull} style={styles.logo} />
            <View style={styles.headerLeft}>
              <View style={styles.headerTopRow}>
                <Text style={styles.churchName}>Iglesia Adventista del Séptimo Día — Osorno Central</Text>
                <Text style={styles.listingTitle}>Listado completo</Text>
              </View>
              {filtersLine !== 'Sin filtros activos' && (
                <Text style={styles.filtersLine}>{filtersLine}</Text>
              )}
            </View>
          </View>
          <View style={styles.goldBar} />

          <View style={styles.listingHeader}>
            <Text style={[styles.listingDate, { color: WHITE }]}>FECHA</Text>
            <Text style={[styles.listingTime, { color: WHITE }]}>HORA</Text>
            <Text style={[styles.listingTitleCell, { color: WHITE, fontFamily: 'Helvetica-Bold' }]}>EVENTO</Text>
            <Text style={[styles.listingDept, { color: WHITE, fontFamily: 'Helvetica-Bold' }]}>DEPARTAMENTO / TIPO</Text>
          </View>

          {sortedEvents.map((event) => {
            const start = new Date(event.startDate)
            const end = new Date(event.endDate)
            const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
            const statusCfg = event.status !== 'published' ? STATUS_COLORS[event.status] : null
            return (
              <View key={event.id} style={styles.listingRow}>
                <Text style={styles.listingDate}>{formatDateRange(start, end)}</Text>
                <Text style={styles.listingTime}>{event.location ?? '—'}</Text>
                <View style={styles.listingTitleCell}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{event.title}</Text>
                  {event.organizers && event.organizers.length > 0 && (
                    <Text style={{ fontSize: 6.5, color: TEXT_MUTED, marginTop: 1 }}>
                      {event.organizers.map((o) => o.name).join(', ')}
                    </Text>
                  )}
                </View>
                <View style={styles.listingDept}>
                  {event.departmentName && (
                    <View style={[styles.badge, { backgroundColor: `${event.departmentColor ?? typeStyle.dotColor}22`, color: event.departmentColor ?? typeStyle.color }]}>
                      <Text style={{ color: event.departmentColor ?? typeStyle.color }}>
                        {toInitials(event.departmentName)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.badge, { backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }]}>
                    <Text>{EVENT_TYPE_LABELS[event.eventType]}</Text>
                  </View>
                  {statusCfg && (
                    <View style={[styles.badge, { backgroundColor: statusCfg.bg, color: statusCfg.text }]}>
                      <Text>{statusCfg.text === '#92600A' ? 'Borrador' : 'Archivado'}</Text>
                    </View>
                  )}
                </View>
              </View>
            )
          })}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Iglesia Adventista del Séptimo Día — Osorno Central</Text>
            <Text style={styles.footerGold}>Generado: {format(new Date(), "d 'de' MMM yyyy, HH:mm", { locale: es })}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}