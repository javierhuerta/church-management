import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Department, EventType } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DEPARTMENT_LABELS,
  EVENT_TYPE_LABELS,
} from '../utils/labels'

interface EventFiltersProps {
  eventType?: EventType
  department?: Department
  currentMonth: Date
  onEventTypeChange: (value: EventType | undefined) => void
  onDepartmentChange: (value: Department | undefined) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export function EventFilters({
  eventType,
  department,
  currentMonth,
  onEventTypeChange,
  onDepartmentChange,
  onPrevMonth,
  onNextMonth,
  onToday,
}: EventFiltersProps) {
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
        value={department ?? 'all'}
        onValueChange={(v) =>
          onDepartmentChange(v === 'all' ? undefined : (v as Department))
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los departamentos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los departamentos</SelectItem>
          {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((d) => (
            <SelectItem key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
