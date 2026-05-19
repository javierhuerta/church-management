import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface DepartmentOption {
  id: string
  name: string
  label?: string
}

interface DepartmentComboboxProps {
  value: string | null
  onChange: (next: string | null) => void
  departments: DepartmentOption[]
  placeholder?: string
  emptyOptionLabel?: string
  disabled?: boolean
}

const EMPTY_VALUE = '__none__'

export function DepartmentCombobox({
  value,
  onChange,
  departments,
  placeholder = 'Seleccionar departamento',
  emptyOptionLabel = 'Sin departamento',
  disabled,
}: DepartmentComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => (value ? departments.find((d) => d.id === value) : null),
    [value, departments],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selected && 'text-neutral-500')}>
            {selected ? (selected.label ?? selected.name) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar departamento…" />
          <CommandList>
            <CommandEmpty>Sin coincidencias.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={emptyOptionLabel}
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {emptyOptionLabel}
              </CommandItem>
              {departments.map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.label ?? d.name} ${d.name}`}
                  onSelect={() => {
                    onChange(d.id === value ? null : d.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === d.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {d.label ?? d.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <input type="hidden" name={EMPTY_VALUE} value={EMPTY_VALUE} />
      </PopoverContent>
    </Popover>
  )
}
