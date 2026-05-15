import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { es } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn('p-3', className)}
      classNames={{
        months: cn(
          defaultClassNames.months,
          'relative flex flex-col sm:flex-row gap-4'
        ),
        month: cn(defaultClassNames.month, 'flex flex-col gap-4'),
        month_caption: cn(
          defaultClassNames.month_caption,
          'flex justify-center items-center h-9'
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          'text-sm font-medium capitalize'
        ),
        nav: cn(
          defaultClassNames.nav,
          'absolute inset-x-0 top-0 flex items-center justify-between h-9 px-1 z-10'
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        month_grid: cn(defaultClassNames.month_grid, 'w-full border-collapse'),
        weekdays: cn(defaultClassNames.weekdays, 'flex'),
        weekday: cn(
          defaultClassNames.weekday,
          'text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]'
        ),
        week: cn(defaultClassNames.week, 'flex w-full mt-2'),
        day: cn(
          defaultClassNames.day,
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20'
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-9 p-0 font-normal aria-selected:opacity-100'
        ),
        selected: cn(
          defaultClassNames.selected,
          '[&>button]:bg-neutral-900 [&>button]:text-neutral-50 [&>button]:hover:bg-neutral-900 [&>button]:hover:text-neutral-50'
        ),
        today: cn(
          defaultClassNames.today,
          '[&>button]:bg-neutral-100 [&>button]:text-neutral-900'
        ),
        outside: cn(defaultClassNames.outside, 'text-neutral-400 opacity-50'),
        disabled: cn(defaultClassNames.disabled, 'text-neutral-400 opacity-50'),
        range_middle: cn(
          defaultClassNames.range_middle,
          '[&>button]:bg-neutral-100 [&>button]:text-neutral-900 [&>button]:rounded-none'
        ),
        range_start: cn(defaultClassNames.range_start, 'rounded-l-md'),
        range_end: cn(defaultClassNames.range_end, 'rounded-r-md'),
        hidden: cn(defaultClassNames.hidden, 'invisible'),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-4', chevronClassName)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn('size-4', chevronClassName)} {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
