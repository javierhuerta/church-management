import { ConfigRedirectCard } from '../components/config-redirect-card'

export function CultosConfigPage() {
  return (
    <ConfigRedirectCard
      title="Cultos"
      description="El programa publicado marcado para el sitio aparece automáticamente en la sección de Cultos."
      explanation="Crea una plantilla de tipo 'Culto Sabático' en el módulo de Cultos y marca la bandera 'Mostrar en sitio web'. Luego publica el programa del sábado con los datos del predicador, tema y texto bíblico. Ese programa aparecerá automáticamente en el sitio público."
      redirectTo="/cultos"
      redirectLabel="Ir a Cultos"
    />
  )
}
