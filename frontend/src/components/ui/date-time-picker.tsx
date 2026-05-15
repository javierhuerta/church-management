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
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDateTimeString(value)
  const time = timeFromDateTimeString(value)

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
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) onChange?.(combine(date, time))
          }}
        />
        <div className="border-t border-neutral-200 p-3">
          <Input
            type="time"
            value={time}
            onChange={(e) => {
              const base = selected ?? new Date()
              onChange?.(combine(base, e.target.value))
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
