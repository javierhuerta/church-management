import { HomeConfigForm } from './home-config-form'

export function InicioConfigPage() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <p className="text-2xl font-bold text-foreground">Configuración de Inicio</p>
        <p className="text-sm text-muted-foreground mt-1">
          Administra los textos, imágenes y enlaces de la página principal del sitio público.
        </p>
      </div>
      
      <HomeConfigForm />
    </div>
  )
}
