import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  displayDate,
  formatDateString,
  parseDateString,
} from '@/lib/date'

export interface DateRangeValue {
  /** Range start as a `YYYY-MM-DD` string (empty when unset). */
  from?: string
  /** Range end as a `YYYY-MM-DD` string (empty when unset). */
  to?: string
}

export interface DateRangePickerProps {
  value?: DateRangeValue
  /** Called with the selected range; `from`/`to` are `YYYY-MM-DD` strings (empty when cleared). */
  onChange?: (value: DateRangeValue) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Seleccionar rango de fechas',
  disabled,
  id,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const from = parseDateString(value?.from)
  const to = parseDateString(value?.to)
  const selected: DateRange | undefined = from ? { from, to } : undefined

  let label = placeholder
  if (from && to) label = `${displayDate(from)} – ${displayDate(to)}`
  else if (from) label = `Desde ${displayDate(from)}`
  else if (to) label = `Hasta ${displayDate(to)}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !from && !to && 'text-neutral-500',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          defaultMonth={from}
          onSelect={(range) => {
            onChange?.({
              from: range?.from ? formatDateString(range.from) : '',
              to: range?.to ? formatDateString(range.to) : '',
            })
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
