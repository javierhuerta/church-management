import { GaleriaConfigForm } from './galeria-config-form'

export function GaleriaConfigPage() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <p className="text-2xl font-bold text-foreground">Configuración de Galería</p>
        <p className="text-sm text-muted-foreground mt-1">
          Administra los textos del encabezado de la sección Galería del sitio público.
        </p>
      </div>
      
      <GaleriaConfigForm />
    </div>
  )
}
