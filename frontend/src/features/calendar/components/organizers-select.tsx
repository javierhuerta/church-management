import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import {
  CalendarService,
  type OrganizerResponseDto,
} from '@/lib/api'
import { Input } from '@/components/ui/input'

interface OrganizersSelectProps {
  value: OrganizerResponseDto[]
  onChange: (next: OrganizerResponseDto[]) => void
}

export function OrganizersSelect({ value, onChange }: OrganizersSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrganizerResponseDto[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults((prev) => (prev.length === 0 ? prev : []))
      return
    }
    let cancelled = false
    const timeout = setTimeout(() => {
      CalendarService.calendarControllerSearchOrganizers(query)
        .then((res) => {
          if (!cancelled) setResults(res)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  function add(user: OrganizerResponseDto) {
    if (value.find((v) => v.id === user.id)) return
    onChange([...value, user])
    setQuery('')
    setResults([])
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar usuario por nombre o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pl-10"
        />
        {open && results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg max-h-60 overflow-y-auto">
            {results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => add(u)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
              >
                <p className="text-sm font-medium text-neutral-900">{u.name}</p>
                <p className="text-xs text-neutral-500">
                  {u.email} · {u.role}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-sm"
            >
              {u.name}
              <button
                type="button"
                onClick={() => remove(u.id)}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
