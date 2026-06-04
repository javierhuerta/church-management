import { ConfigRedirectCard } from '../components/config-redirect-card'

export function CalendarioConfigPage() {
  return (
    <ConfigRedirectCard
      title="Calendario"
      description="Los eventos publicados en el módulo Calendario aparecen automáticamente en el sitio público."
      explanation="No necesitas configurar nada aquí. Los eventos que crees y publiques en el módulo de Calendario con estado 'published' aparecerán automáticamente en la sección de Calendario del sitio público."
      redirectTo="/calendario"
      redirectLabel="Ir al Calendario"
    />
  )
}
