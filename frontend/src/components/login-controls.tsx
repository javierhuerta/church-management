import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTextSize } from '@/lib/contexts/text-size-context'
import type { TextSize } from '@/lib/contexts/text-size-context'

type Theme = 'light' | 'dark' | 'system'

const themeOptions: { value: Theme; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
]

const textSizeOptions: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
]

export function LoginControls() {
  const { theme, setTheme } = useTheme()
  const { textSize, setTextSize } = useTextSize()

  return (
    <div className="flex items-center gap-2">
      {/* Text size */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
        {textSizeOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTextSize(value)}
            title={`Tamaño ${label}`}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              textSize === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
        {themeOptions.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all text-xs font-medium ${
              theme === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
