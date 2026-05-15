import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventResponseDto } from '@/lib/api'
import { DEPARTMENT_LABELS, EVENT_TYPE_LABELS } from '../utils/labels'

const PURPLE = '#8B6CC8'
const WHITE = '#FFFFFF'
const TEXT_DARK = '#1A1A2E'
const TEXT_MUTED = '#6B7280'
const BORDER = '#E5E7EB'
const BORDER_LIGHT = '#F3F4F6'
const OUT_OF_MONTH_BG = '#FAFAFA'

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; bandBg: string; bandText: string }> = {
  local: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', bandBg: '#BFDBFE', bandText: '#1E3A8A' },
  asach: { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7', bandBg: '#E9D5FF', bandText: '#581C87' },
  distrital: { bg: '#ECFDF5', text: '#047857', dot: '#10B981', bandBg: '#A7F3D0', bandText: '#064E3B' },
}

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  jovenes: { bg: '#FFF7ED', text: '#C2410C' },
  adolescentes: { bg: '#FEFCE8', text: '#A16207' },
  familia: { bg: '#F0FDF4', text: '#15803D' },
  mision: { bg: '#FEF2F2', text: '#B91C1C' },
  escuela_sabatica: { bg: '#F0F9FF', text: '#0369A1' },
  musica: { bg: '#FAF5FF', text: '#7E22CE' },
  conductores_jovenes: { bg: '#F0FDFA', text: '#0F766E' },
  ministerios: { bg: '#EEF2FF', text: '#4338CA' },
  salud: { bg: '#F7FEE7', text: '#4D7C0F' },
  comunicaciones: { bg: '#ECFEFF', text: '#0E7490' },
}
const DEPT_COLORS_DEFAULT = { bg: '#F5F5F5', text: '#525252' }

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_DARK,
    paddingVertical: 24,
    paddingHorizontal: 28,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: { width: 40, height: 40, marginRight: 12 },
  headerText: { flex: 1 },
  churchName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DARK,
  },
  churchSubtitle: { fontSize: 9, color: TEXT_MUTED, marginTop: 1 },
  monthTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: PURPLE,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  filtersLine: { fontSize: 8, color: TEXT_MUTED, marginTop: 4 },
  weekdayRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: 5,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_MUTED,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  weekdayCellLast: { borderRightWidth: 0 },
  week: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
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
    minHeight: 78,
  },
  dayCell: {
    flex: 1,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: BORDER_LIGHT,
  },
  dayCellLast: { borderRightWidth: 0 },
  outOfMonth: { backgroundColor: OUT_OF_MONTH_BG },
  dayNumber: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  dayNumberMuted: { color: '#A3A3A3' },
  eventBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginBottom: 1,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 3,
    marginTop: 3,
  },
  eventTitle: {
    fontSize: 7,
    flex: 1,
  },
  eventDraft: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: '#D97706',
  },
  moreText: {
    fontSize: 6.5,
    color: TEXT_MUTED,
    marginTop: 1,
    paddingHorizontal: 3,
  },
  listingTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DARK,
    marginBottom: 10,
  },
  listingRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  listingDate: { width: '18%', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  listingTime: { width: '14%', fontSize: 8, color: TEXT_MUTED },
  listingTitleCell: { width: '40%', fontSize: 8 },
  listingDept: { width: '28%', fontSize: 7, color: TEXT_MUTED },
  badge: {
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
    fontSize: 6.5,
    alignSelf: 'flex-start',
  },
})

function ChurchLogoPlaceholder() {
  return (
    <Svg viewBox="0 0 56 56" style={styles.logo}>
      <Circle cx="28" cy="28" r="28" fill={PURPLE} />
      <Path
        d="M28 8 C28 8 20 18 20 26 C20 30.4 23.6 34 28 34 C32.4 34 36 30.4 36 26 C36 18 28 8 28 8Z"
        fill="none"
        stroke={WHITE}
        strokeWidth="2"
      />
      <Path
        d="M28 14 C28 14 23 21 23 26 C23 28.8 25.2 31 28 31 C30.8 31 33 28.8 33 26 C33 21 28 14 28 14Z"
        fill={WHITE}
      />
      <Path
        d="M22 34 L34 34 L34 36 C34 36 32 38 28 38 C24 38 22 36 22 36 Z"
        fill={WHITE}
        fillOpacity="0.7"
      />
    </Svg>
  )
}

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

function getDeptColors(name: string | null | undefined) {
  if (!name) return DEPT_COLORS_DEFAULT
  return DEPT_COLORS[name] ?? DEPT_COLORS_DEFAULT
}

function getDeptLabel(name: string | null | undefined): string | null {
  if (!name) return null
  return DEPARTMENT_LABELS[name as keyof typeof DEPARTMENT_LABELS] ?? name
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
  if (filters.departmentName) filterParts.push(`Depto: ${getDeptLabel(filters.departmentName) ?? filters.departmentName}`)
  if (filters.eventType) {
    const label = EVENT_TYPE_LABELS[filters.eventType as keyof typeof EVENT_TYPE_LABELS] ?? filters.eventType
    filterParts.push(`Tipo: ${label}`)
  }
  const filtersLine = filterParts.length > 0 ? `Filtros: ${filterParts.join(' | ')}` : 'Filtros: ninguno'

  const hasOverflow = Array.from(singleByDay.values()).some((list) => list.length > MAX_EVENTS_PER_CELL)

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  return (
    <Document>
      {/* Página 1: Grid */}
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <ChurchLogoPlaceholder />
          <View style={styles.headerText}>
            <Text style={styles.churchName}>Iglesia Adventista del Séptimo Día</Text>
            <Text style={styles.churchSubtitle}>Osorno Central</Text>
            <Text style={styles.monthTitle}>{monthName}</Text>
            <Text style={styles.filtersLine}>{filtersLine}</Text>
          </View>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d, i) => (
            <Text
              key={d}
              style={[styles.weekdayCell, i === 6 ? styles.weekdayCellLast : {}]}
            >
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
                    const colors = TYPE_COLORS[band.event.eventType] ?? TYPE_COLORS.local
                    return (
                      <View key={`${band.event.id}-${i}`} style={styles.bandsRow}>
                        {Array.from({ length: 7 }).map((_, col) => {
                          const inBand = col >= band.startCol && col <= band.endCol
                          if (!inBand) {
                            return <View key={col} style={{ flex: 1 }} />
                          }
                          if (col === band.startCol) {
                            const span = band.endCol - band.startCol + 1
                            return (
                              <View
                                key={col}
                                style={{
                                  flex: span,
                                  flexDirection: 'row',
                                }}
                              >
                                <Text
                                  style={[
                                    styles.band,
                                    {
                                      backgroundColor: colors.bandBg,
                                      color: colors.bandText,
                                      flex: 1,
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
                      ]}
                    >
                      <Text style={[styles.dayNumber, inMonth ? {} : styles.dayNumberMuted]}>
                        {cell.getDate()}
                      </Text>
                      {visible.map((event) => {
                        const colors = TYPE_COLORS[event.eventType] ?? TYPE_COLORS.local
                        const isDraft = event.status === 'draft'
                        return (
                          <View
                            key={event.id}
                            style={[
                              styles.eventBox,
                              { backgroundColor: colors.bg },
                              isDraft ? styles.eventDraft : {},
                            ]}
                          >
                            <View style={[styles.eventDot, { backgroundColor: colors.dot }]} />
                            <Text style={[styles.eventTitle, { color: colors.text }]}>
                              {event.title}
                            </Text>
                          </View>
                        )
                      })}
                      {overflow > 0 && (
                        <Text style={styles.moreText}>+{overflow} más</Text>
                      )}
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}
      </Page>

      {/* Página 2: Listado completo (solo si hay overflow o multi-day events) */}
      {(hasOverflow || multiDayEvents.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.listingTitle}>Listado completo — {monthName}</Text>
              <Text style={styles.filtersLine}>{filtersLine}</Text>
            </View>
          </View>

          <View>
            <View style={[styles.listingRow, { backgroundColor: '#F9FAFB' }]}>
              <Text style={[styles.listingDate, { color: TEXT_MUTED }]}>FECHA</Text>
              <Text style={[styles.listingTime, { color: TEXT_MUTED }]}>HORA</Text>
              <Text style={[styles.listingTitleCell, { color: TEXT_MUTED, fontFamily: 'Helvetica-Bold' }]}>
                EVENTO
              </Text>
              <Text style={[styles.listingDept, { color: TEXT_MUTED, fontFamily: 'Helvetica-Bold' }]}>
                DEPARTAMENTO / TIPO
              </Text>
            </View>
            {sortedEvents.map((event) => {
              const start = new Date(event.startDate)
              const end = new Date(event.endDate)
              const sameDay =
                start.getFullYear() === end.getFullYear() &&
                start.getMonth() === end.getMonth() &&
                start.getDate() === end.getDate()
              const dateText = sameDay
                ? format(start, "EEE d 'de' MMM", { locale: es })
                : `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM', { locale: es })}`
              const timeText = sameDay
                ? `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
                : ''
              const colors = TYPE_COLORS[event.eventType] ?? TYPE_COLORS.local
              const deptColors = getDeptColors(event.departmentName)
              const deptLabel = getDeptLabel(event.departmentName)
              const typeLabel = EVENT_TYPE_LABELS[event.eventType as keyof typeof EVENT_TYPE_LABELS] ?? event.eventType
              return (
                <View key={event.id} style={styles.listingRow}>
                  <Text style={styles.listingDate}>{dateText}</Text>
                  <Text style={styles.listingTime}>{timeText}</Text>
                  <View style={styles.listingTitleCell}>
                    <Text>{event.title}</Text>
                    {event.location && (
                      <Text style={{ fontSize: 6.5, color: TEXT_MUTED, marginTop: 1 }}>
                        {event.location}
                      </Text>
                    )}
                  </View>
                  <View style={styles.listingDept}>
                    {deptLabel && (
                      <Text style={[styles.badge, { backgroundColor: deptColors.bg, color: deptColors.text }]}>
                        {deptLabel}
                      </Text>
                    )}
                    <Text style={[styles.badge, { backgroundColor: colors.bg, color: colors.text, marginTop: 1 }]}>
                      {typeLabel}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </Page>
      )}
    </Document>
  )
}
