import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

type ConfigRedirectCardProps = {
  title: string
  description: string
  explanation: string
  redirectTo: string
  redirectLabel: string
}

export function ConfigRedirectCard({
  title,
  description,
  explanation,
  redirectTo,
  redirectLabel,
}: ConfigRedirectCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="space-y-2">
        <p className="text-xl font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="text-sm text-foreground">{explanation}</p>
      </div>

      <div className="pt-2">
        <Link
          to={redirectTo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {redirectLabel}
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
