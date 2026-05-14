import { useState } from 'react'
import { Link2, Check, Share2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [showInstagram, setShowInstagram] = useState(false)

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <a href={xUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" type="button">
            <Send className="h-4 w-4 mr-1" /> X
          </Button>
        </a>
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" type="button">
            <Share2 className="h-4 w-4 mr-1" /> Facebook
          </Button>
        </a>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setShowInstagram((v) => !v)}
        >
          <Share2 className="h-4 w-4 mr-1" /> Instagram
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-emerald-600" />
              Copiado
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4 mr-1" /> Copiar enlace
            </>
          )}
        </Button>
      </div>
      {showInstagram && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          Instagram no permite compartir programáticamente desde la web. Copia
          este enlace y pégalo en tu historia o publicación:
          <div className="mt-2 p-2 bg-white border border-neutral-200 rounded font-mono break-all">
            {url}
          </div>
        </div>
      )}
    </div>
  )
}
