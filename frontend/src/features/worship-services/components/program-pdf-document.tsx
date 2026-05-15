import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ServiceProgramResponseDto } from '@/lib/api'

const PURPLE = '#8B6CC8'
const PURPLE_BG = '#F3EEFF'
const WHITE = '#FFFFFF'
const GRAY_ROW = '#F7F7F7'
const GRAY_NOTE = '#9CA3AF'
const TEXT_DARK = '#1A1A2E'
const BORDER = '#E8E0F5'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_DARK,
    paddingVertical: 40,
    paddingHorizontal: 48,
    backgroundColor: WHITE,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 56,
    height: 56,
    marginBottom: 10,
  },
  churchName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  templateName: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  programDate: {
    fontSize: 10,
    color: PURPLE,
    fontFamily: 'Helvetica-Bold',
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: PURPLE,
    marginBottom: 12,
    marginTop: 12,
    width: 48,
    alignSelf: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: PURPLE,
    borderRadius: 3,
    marginBottom: 2,
  },
  tableHeaderCell: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1,
  },
  groupRow: {
    flexDirection: 'row',
    backgroundColor: PURPLE_BG,
    borderLeftWidth: 3,
    borderLeftColor: PURPLE,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 2,
    alignItems: 'center',
  },
  groupName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: PURPLE,
    textTransform: 'uppercase',
  },
  groupTime: {
    fontSize: 8,
    color: PURPLE,
    marginLeft: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  sectionRowAlt: {
    backgroundColor: GRAY_ROW,
  },
  cellPad: {
    paddingVertical: 6,
    paddingHorizontal: 8,
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
    color: GRAY_NOTE,
    marginTop: 2,
  },
  colResponsable: { width: '20%' },
  colParte: { width: '30%' },
  colDetalle: { width: '50%' },
})

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

function ChurchLogoPlaceholder() {
  return (
    <Svg viewBox="0 0 56 56" style={styles.logoCircle}>
      <Circle cx="28" cy="28" r="28" fill={PURPLE} />
      {/* Llama adventista simplificada */}
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
      {/* Base de la llama */}
      <Path
        d="M22 34 L34 34 L34 36 C34 36 32 38 28 38 C24 38 22 36 22 36 Z"
        fill={WHITE}
        fillOpacity="0.7"
      />
    </Svg>
  )
}

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
        {/* Encabezado */}
        <View style={styles.header}>
          <ChurchLogoPlaceholder />
          <Text style={styles.churchName}>Iglesia Adventista del Séptimo Día</Text>
          <Text style={styles.templateName}>{program.template?.name}</Text>
          <View style={styles.divider} />
          <Text style={styles.programDate}>{formattedDate}</Text>
        </View>

        {/* Tabla */}
        <View>
          {/* Encabezado de columnas */}
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

          {/* Grupos y sus secciones */}
          {sortedGroups.map((group) => {
            const groupSections = [...(group.sections ?? [])].sort(
              (a, b) => a.order - b.order,
            )
            return (
              <View key={group.id}>
                <View style={styles.groupRow}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.startTime && (
                    <Text style={styles.groupTime}>
                      {group.startTime}
                      {group.endTime ? ` - ${group.endTime}` : ''}
                    </Text>
                  )}
                </View>
                {groupSections.map((section) => {
                  const isAlt = sectionIndex++ % 2 !== 0
                  const sectionName =
                    section.name ?? section.templateSection?.name ?? ''
                  return (
                    <SectionRow
                      key={section.id}
                      responsible={section.responsible}
                      sectionName={sectionName}
                      hymnText={section.hymnText}
                      notes={section.notes}
                      isAlt={isAlt}
                    />
                  )
                })}
              </View>
            )
          })}

          {/* Secciones sin grupo */}
          {ungroupedSections.map((section) => {
            const isAlt = sectionIndex++ % 2 !== 0
            const sectionName = section.name ?? section.templateSection?.name ?? ''
            return (
              <SectionRow
                key={section.id}
                responsible={section.responsible}
                sectionName={sectionName}
                hymnText={section.hymnText}
                notes={section.notes}
                isAlt={isAlt}
              />
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
