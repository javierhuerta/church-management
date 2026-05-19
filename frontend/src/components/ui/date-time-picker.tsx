import * as React from 'react'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  displayDateTime,
  formatDateTimeString,
  parseDateTimeString,
  timeFromDateTimeString,
} from '@/lib/date'

export interface DateTimePickerProps {
  /** Date and time as a `YYYY-MM-DDTHH:mm` string (empty when unset). */
  value?: string
  /** Called with the selected value as a `YYYY-MM-DDTHH:mm` string (empty when cleared). */
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  /** Optional lower bound as a `YYYY-MM-DDTHH:mm` string. Dates strictly before are blocked in the calendar. */
  minDate?: string
}

function combine(date: Date, time: string): string {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10))
  const next = new Date(date)
  next.setHours(Number.isNaN(h) ? 0 : h, Number.isNaN(m) ? 0 : m, 0, 0)
  return formatDateTimeString(next)
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha y hora',
  disabled,
  id,
  className,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDateTimeString(value)
  const time = timeFromDateTimeString(value)
  const min = parseDateTimeString(minDate)
  const minTime = minDate ? timeFromDateTimeString(minDate) : null
  const onSameDayAsMin = !!(min && selected && isSameDay(selected, min))

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
            !selected && 'text-neutral-500',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? displayDateTime(selected) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? min ?? undefined}
          disabled={min ? { before: startOfDay(min) } : undefined}
          onSelect={(date) => {
            if (!date) return
            let nextTime = time
            if (min && isSameDay(date, min) && nextTime < (minTime ?? '00:00')) {
              nextTime = minTime ?? '00:00'
            }
            onChange?.(combine(date, nextTime))
          }}
        />
        <div className="border-t border-neutral-200 p-3">
          <Input
            type="time"
            value={time}
            min={onSameDayAsMin ? minTime ?? undefined : undefined}
            onChange={(e) => {
              const base = selected ?? new Date()
              let nextTime = e.target.value
              if (
                min &&
                isSameDay(base, min) &&
                nextTime < (minTime ?? '00:00')
              ) {
                nextTime = minTime ?? '00:00'
              }
              onChange?.(combine(base, nextTime))
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}
