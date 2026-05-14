import { useEffect } from 'react'
import { X } from 'lucide-react'

interface LightboxModalProps {
  url: string
  alt: string
  onClose: () => void
}

export function LightboxModal({ url, alt, onClose }: LightboxModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={url}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
