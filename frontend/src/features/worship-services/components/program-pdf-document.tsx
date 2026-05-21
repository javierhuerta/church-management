import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ServiceProgramResponseDto } from '@/lib/api'
import logoMark from '@/assets/images/logo.png'

// ── Paleta de marca: Adventistas Central Osorno ──────────────
const NAVY        = '#1B3A6B'
const NAVY_LIGHT  = '#EEF2F9'
const GOLD        = '#C9A84C'
const GOLD_LIGHT  = '#FBF6EA'
const WHITE       = '#FFFFFF'
const TEXT_DARK   = '#1A2A3A'
const TEXT_MID    = '#4B5A72'
const TEXT_MUTED  = '#8A96A8'
const BORDER      = '#DDE3EE'
const ROW_ALT     = '#F5F7FB'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_DARK,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 48,
    backgroundColor: WHITE,
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },
  logoWrap: {
    width: 52,
    height: 41,   // mantiene proporción 773×605
    marginRight: 14,
  },
  logoImg: {
    width: 52,
    height: 41,
  },
  headerText: {
    flex: 1,
  },
  churchName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  templateName: {
    fontSize: 9,
    color: TEXT_MID,
    marginBottom: 4,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GOLD_LIGHT,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dateText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
  },

  // ── Tabla ─────────────────────────────────────────────────
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderRadius: 4,
    marginBottom: 1,
  },
  tableHeaderCell: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    letterSpacing: 0.8,
  },

  // ── Grupo ─────────────────────────────────────────────────
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 1,
  },
  groupName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupTime: {
    fontSize: 8,
    color: TEXT_MID,
    marginLeft: 8,
  },

  // ── Filas de sección ──────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  sectionRowAlt: {
    backgroundColor: ROW_ALT,
  },
  cellPad: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cellText: {
    fontSize: 9,
    color: TEXT_DARK,
  },
  cellTextBold: {
    fontSize: 9,
    color: TEXT_DARK,
    fontFamily: 'Helvetica-Bold',
  },
  noteText: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // ── Columnas ──────────────────────────────────────────────
  colResponsable: { width: '20%' },
  colParte:       { width: '30%' },
  colDetalle:     { width: '50%' },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  footerGold: {
    fontSize: 7,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
  },
})

// ── Componentes internos ──────────────────────────────────────

interface SectionRowProps {
  responsible?: string | null
  sectionName: string
  hymnText?: string | null
  notes?: string | null
  isAlt: boolean
}

function SectionRow({ responsible, sectionName, hymnText, notes, isAlt }: SectionRowProps) {
  return (
    <View style={[styles.sectionRow, isAlt ? styles.sectionRowAlt : {}]}>
      <View style={[styles.colResponsable, styles.cellPad]}>
        <Text style={styles.cellText}>{responsible ?? ''}</Text>
      </View>
      <View style={[styles.colParte, styles.cellPad]}>
        <Text style={styles.cellTextBold}>{sectionName}</Text>
      </View>
      <View style={[styles.colDetalle, styles.cellPad]}>
        {hymnText ? <Text style={styles.cellText}>{hymnText}</Text> : null}
        {notes ? <Text style={styles.noteText}>{notes}</Text> : null}
        {!hymnText && !notes ? <Text style={styles.cellText}>{''}</Text> : null}
      </View>
    </View>
  )
}

// ── Documento ─────────────────────────────────────────────────

interface Props {
  program: ServiceProgramResponseDto
}

export function ProgramPdfDocument({ program }: Props) {
  const formattedDate = format(
    new Date(program.date + 'T12:00:00'),
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es },
  )

  const sortedGroups = [...(program.groups ?? [])].sort((a, b) => a.order - b.order)
  const ungroupedSections = [...(program.sections ?? [])]
    .filter((s) => !s.groupId)
    .sort((a, b) => a.order - b.order)

  let sectionIndex = 0

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* ── Encabezado ── */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Image src={logoMark} style={styles.logoImg} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.churchName}>Iglesia Adventista del Séptimo Día</Text>
            <Text style={styles.templateName}>{program.template?.name ?? 'Programa de Culto'}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* ── Tabla ── */}
        <View>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colResponsable}>
              <Text style={styles.tableHeaderCell}>RESPONSABLE</Text>
            </View>
            <View style={styles.colParte}>
              <Text style={styles.tableHeaderCell}>PARTE</Text>
            </View>
            <View style={styles.colDetalle}>
              <Text style={styles.tableHeaderCell}>DETALLE</Text>
            </View>
          </View>

          {sortedGroups.map((group) => {
            const groupSections = [...(group.sections ?? [])].sort((a, b) => a.order - b.order)
            return (
              <View key={group.id}>
                <View style={styles.groupRow}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.startTime && (
                    <Text style={styles.groupTime}>
                      {group.startTime}{group.endTime ? ` – ${group.endTime}` : ''}
                    </Text>
                  )}
                </View>
                {groupSections.map((section) => {
                  const isAlt = sectionIndex++ % 2 !== 0
                  return (
                    <SectionRow
                      key={section.id}
                      responsible={section.responsible}
                      sectionName={section.name ?? section.templateSection?.name ?? ''}
                      hymnText={section.hymnText}
                      notes={section.notes}
                      isAlt={isAlt}
                    />
                  )
                })}
              </View>
            )
          })}

          {ungroupedSections.map((section) => {
            const isAlt = sectionIndex++ % 2 !== 0
            return (
              <SectionRow
                key={section.id}
                responsible={section.responsible}
                sectionName={section.name ?? section.templateSection?.name ?? ''}
                hymnText={section.hymnText}
                notes={section.notes}
                isAlt={isAlt}
              />
            )
          })}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Iglesia Adventista del Séptimo Día — Central Osorno</Text>
          <Text style={styles.footerGold}>{program.template?.name ?? ''}</Text>
        </View>

      </Page>
    </Document>
  )
}
