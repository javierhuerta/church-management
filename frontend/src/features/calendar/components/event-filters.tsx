import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { EventType } from '../hooks/use-calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EVENT_TYPE_LABELS, DEPARTMENT_LABELS } from '../utils/labels'
import { DepartmentsService } from '@/lib/api'

interface EventFiltersProps {
  eventType?: EventType
  departmentId?: string
  currentMonth: Date
  onEventTypeChange: (value: EventType | undefined) => void
  onDepartmentChange: (value: string | undefined) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function EventFilters({
  eventType,
  departmentId,
  currentMonth,
  onEventTypeChange,
  onDepartmentChange,
  onPrevMonth,
  onNextMonth,
  onToday,
}: EventFiltersProps) {
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  function getDepartmentLabel(name: string): string {
    return DEPARTMENT_LABELS[name as keyof typeof DEPARTMENT_LABELS] ?? name
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-3 text-sm font-medium text-neutral-700 min-w-[160px] text-center">
          {MONTHS_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="outline" size="sm" onClick={onToday}>
        Hoy
      </Button>

      <Select
        value={eventType ?? 'all'}
        onValueChange={(v) =>
          onEventTypeChange(v === 'all' ? undefined : (v as EventType))
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Todos los tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => (
            <SelectItem key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={departmentId ?? 'all'}
        onValueChange={(v) =>
          onDepartmentChange(v === 'all' ? undefined : v)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los departamentos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los departamentos</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {getDepartmentLabel(d.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
