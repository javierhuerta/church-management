import { Video } from 'lucide-react'
import type { MeetingType } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { MEETING_TYPE_LABELS } from '../utils/labels'

interface MeetingButtonProps {
  url: string
  type: MeetingType | null
}

export function MeetingButton({ url, type }: MeetingButtonProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Button>
        <Video className="h-4 w-4 mr-2" />
        Unirse a {type ? MEETING_TYPE_LABELS[type] : 'reunión'}
      </Button>
    </a>
  )
}
