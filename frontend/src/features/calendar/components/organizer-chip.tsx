import { X, User as UserIcon, UserSquare2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type OrganizerEntry =
  | { kind: 'user'; id: string; userId: string; name: string; email?: string | null }
  | { kind: 'text'; id: string; displayName: string }

interface OrganizerChipProps {
  organizer: OrganizerEntry
  onRemove?: (organizer: OrganizerEntry) => void
  size?: 'sm' | 'md'
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function OrganizerChip({ organizer, onRemove, size = 'md' }: OrganizerChipProps) {
  const isUser = organizer.kind === 'user'
  const name = isUser ? organizer.name : organizer.displayName
  const Icon = isUser ? UserIcon : UserSquare2

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        isUser
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-neutral-100 text-neutral-700 border-neutral-200',
      )}
      title={isUser ? `${name}${organizer.email ? ` · ${organizer.email}` : ''}` : name}
    >
      <Avatar className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}>
        <AvatarFallback
          className={cn(
            'text-[10px] text-white',
            isUser ? 'bg-blue-700' : 'bg-neutral-500',
          )}
        >
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
      {!isUser && (
        <Icon
          className={cn(
            'opacity-60',
            size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
          )}
          aria-label="Organizador texto libre"
        />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(organizer)}
          className="ml-0.5 hover:text-red-600"
          aria-label={`Quitar ${name}`}
        >
          <X className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </button>
      )}
    </span>
  )
}
