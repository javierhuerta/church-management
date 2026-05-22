import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ServiceProgramResponseDto } from '@/lib/api'
import { parseDateString, displayDate } from '@/lib/date'

interface PublishWithEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: ServiceProgramResponseDto | undefined
  onPublish: (createCalendarEvent: boolean) => Promise<{ eventSlug: string | null }>
  isPublishing: boolean
}

const NAVY = '#1B3A6B'

export function PublishWithEventDialog({
  open,
  onOpenChange,
  program,
  onPublish,
  isPublishing,
}: PublishWithEventDialogProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [createCalendarEvent, setCreateCalendarEvent] = useState(true)
  const navigate = useNavigate()

  const firstGroup = program?.groups?.[0]
  const templateName = program?.template?.name ?? ''

  async function handleConfirm() {
    if (!program) return
    try {
      const result = await onPublish(createCalendarEvent)
      onOpenChange(false)
      if (result.eventSlug) {
        navigate(`/calendario/${result.eventSlug}/editar`)
      }
    } catch {
      // error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Publicar este programa?</DialogTitle>
          <DialogDescription>
            Una vez publicado, solo el Admin y el creador original podrán editarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label
            htmlFor="create-calendar-event"
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              id="create-calendar-event"
              checked={createCalendarEvent}
              onCheckedChange={(checked) => setCreateCalendarEvent(checked as boolean)}
            />
            <div className="space-y-1">
              <span className="text-sm font-medium text-foreground">
                Crear evento en el calendario
              </span>
              <p className="text-xs text-muted-foreground">
                Se creará un evento con la información del programa.
              </p>
              {createCalendarEvent && templateName && (
                <p
                  className="text-xs font-medium mt-2 p-2 rounded bg-background border border-border"
                  style={{ color: isDark ? '#A8C4F0' : NAVY }}
                >
                  Se creará: {templateName}
                  {program?.date && (
                    <> · {displayDate(parseDateString(program.date))}</>
                  )}
                  {firstGroup?.startTime && (
                    <> · {firstGroup.startTime}
                      {firstGroup?.endTime ? ` – ${firstGroup.endTime}` : ''}
                    </>
                  )}
                </p>
              )}
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPublishing}
            style={{
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
            }}
          >
            {isPublishing ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}