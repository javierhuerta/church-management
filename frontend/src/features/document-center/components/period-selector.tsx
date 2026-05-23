import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Period {
  id: string
  year: number
  rotationMode: 'AUTOMATIC' | 'MANUAL'
  shiftWeeks: number
}

interface PeriodSelectorProps {
  selectedYear: number
  onYearChange: (year: number) => void
}

export function PeriodSelector({
  selectedYear,
  onYearChange,
}: PeriodSelectorProps) {
  const [years, setYears] = useState<number[]>([])

  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const yearList = []
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
      yearList.push(y)
    }
    setYears(yearList)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="appearance-none pl-3 pr-10 py-2.5 bg-card border border-border rounded-lg text-sm font-medium text-foreground cursor-pointer hover:border-primary/40 transition-colors"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  )
}

export function usePeriodForYear(year: number, periods: Period[] | undefined): Period | undefined {
  if (!periods) return undefined
  return periods.find((p) => p.year === year)
}