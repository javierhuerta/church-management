import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, normalizeSearch } from '@/lib/utils'

export interface PersonOption {
  id: string
  label: string
}

// ─── Single select ────────────────────────────────────────────────────────────

interface SingleProps {
  multiple?: false
  value: string
  onChange: (id: string) => void
  people: PersonOption[]
  placeholder?: string
  error?: boolean
  clearable?: boolean
}

// ─── Multi select ─────────────────────────────────────────────────────────────

interface MultiProps {
  multiple: true
  value: string[]
  onChange: (ids: string[]) => void
  people: PersonOption[]
  placeholder?: string
  error?: boolean
}

type PersonComboboxProps = SingleProps | MultiProps

// ─── Component ───────────────────────────────────────────────────────────────

export function PersonCombobox(props: PersonComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { people, placeholder = 'Buscar persona...', error = false } = props

  const filtered = search
    ? people.filter((p) => normalizeSearch(p.label).includes(normalizeSearch(search)))
    : people

  // ── Multi ──────────────────────────────────────────────────────────────────
  if (props.multiple) {
    const { value, onChange } = props
    const selected = people.filter((p) => value.includes(p.id))

    function toggle(id: string) {
      if (value.includes(id)) {
        onChange(value.filter((v) => v !== id))
      } else {
        onChange([...value, id])
      }
    }

    function remove(id: string, e: React.MouseEvent) {
      e.stopPropagation()
      onChange(value.filter((v) => v !== id))
    }

    return (
      <div className="space-y-2">
        {/* Chips de seleccionados */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full"
              >
                {p.label}
                <button
                  type="button"
                  onClick={(e) => remove(p.id, e)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between font-normal',
                selected.length === 0 && 'text-muted-foreground',
                error && 'border-destructive',
              )}
            >
              <span className="truncate">
                {selected.length === 0
                  ? placeholder
                  : `${selected.length} responsable${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}`}
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar por nombre..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>No se encontraron personas.</CommandEmpty>
                <CommandGroup>
                  {filtered.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={() => toggle(p.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          value.includes(p.id) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {p.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // ── Single ─────────────────────────────────────────────────────────────────
  const { value, onChange, clearable } = props
  const selected = people.find((p) => p.id === value)

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setSearch('')
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between text-left font-normal',
            !selected && 'text-muted-foreground',
            error && 'border-destructive',
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <span className="flex items-center gap-1 ml-2 shrink-0">
            {clearable && selected && (
              <X
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nombre..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No se encontraron personas.</CommandEmpty>
            <CommandGroup>
              {filtered.map((p) => (
                <CommandItem key={p.id} value={p.id} onSelect={() => handleSelect(p.id)}>
                  <Check
                    className={cn('mr-2 h-4 w-4', value === p.id ? 'opacity-100' : 'opacity-0')}
                  />
                  {p.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
