import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-xl">IA</span>
          </div>
        </div>
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl text-center font-bold text-foreground">
              Iglesia Adventista
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sistema de gestión eclesiástica
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-primary text-center">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>
            <LoginForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Iglesia Adventista del Séptimo Día de Osorno Central
        </p>
      </div>
    </div>
  )
}