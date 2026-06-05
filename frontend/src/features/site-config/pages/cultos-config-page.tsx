import { ConfigRedirectCard } from '../components/config-redirect-card'

export function CultosConfigPage() {
  return (
    <ConfigRedirectCard
      title="Cultos"
      description="Programa e Inicio del sitio público muestran el próximo culto desde la plantilla marcada para web."
      explanation="Flujo recomendado: 1) Crea una plantilla 'solo culto' de sábado 11:00. 2) Marca 'Mostrar en sitio web'. 3) Crea/publica el programa del sábado con título, predicador, tema y pasaje bíblico. Si aún no hay programa publicado, el sitio mostrará automáticamente el fallback de la plantilla marcada."
      redirectTo="/cultos/programas"
      redirectLabel="Ir a Cultos"
    />
  )
}
