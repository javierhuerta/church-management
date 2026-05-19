import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { CalendarService, type OrganizerResponseDto } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { OrganizerChip, type OrganizerEntry } from './organizer-chip'

interface OrganizersSelectProps {
  value: OrganizerEntry[]
  onChange: (next: OrganizerEntry[]) => void
}

let textIdCounter = 0
function makeLocalTextId(): string {
  textIdCounter += 1
  return `text-${Date.now()}-${textIdCounter}`
}

function isDuplicateUser(list: OrganizerEntry[], userId: string): boolean {
  return list.some((o) => o.kind === 'user' && o.userId === userId)
}

export function OrganizersSelect({ value, onChange }: OrganizersSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrganizerResponseDto[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults((prev) => (prev.length === 0 ? prev : []))
      return
    }
    let cancelled = false
    const timeout = window.setTimeout(() => {
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
      window.clearTimeout(timeout)
    }
  }, [query])

  function addUser(user: OrganizerResponseDto) {
    if (!user.userId) return
    if (isDuplicateUser(value, user.userId)) return
    onChange([
      ...value,
      {
        kind: 'user',
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email ?? null,
      },
    ])
    setQuery('')
    setResults([])
  }

  function addText() {
    const trimmed = query.trim()
    if (!trimmed) return
    onChange([
      ...value,
      { kind: 'text', id: makeLocalTextId(), displayName: trimmed },
    ])
    setQuery('')
    setResults([])
  }

  function remove(entry: OrganizerEntry) {
    onChange(value.filter((v) => v.id !== entry.id))
  }

  const trimmed = query.trim()
  const showTextOption = trimmed.length > 0
  const userMatches = results.filter(
    (u) => u.userId && !isDuplicateUser(value, u.userId),
  )

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar usuario o escribir nombre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && trimmed && userMatches.length === 0) {
              e.preventDefault()
              addText()
            }
          }}
          className="pl-10"
        />
        {open && (userMatches.length > 0 || showTextOption) && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg max-h-60 overflow-y-auto">
            {userMatches.map((u) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addUser(u)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
              >
                <p className="text-sm font-medium text-neutral-900">{u.name}</p>
                <p className="text-xs text-neutral-500">
                  {u.email ?? '—'}
                  {u.role ? ` · ${u.role}` : ''}
                </p>
              </button>
            ))}
            {showTextOption && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addText}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-t border-neutral-100 bg-neutral-50/50"
              >
                <p className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Agregar como texto: "{trimmed}"
                </p>
                <p className="text-xs text-neutral-500">
                  Usalo si el organizador no es un usuario del sistema.
                </p>
              </button>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((entry) => (
            <OrganizerChip key={entry.id} organizer={entry} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
