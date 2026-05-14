import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoginPage } from './features/auth/pages/login-page'
import { AppLayout } from './layouts/app-layout'
import { AdaptiveLayout } from './layouts/adaptive-layout'
import { DashboardPage } from './features/dashboard/pages/dashboard-page'
import { TextSizeProvider } from './lib/contexts/text-size-context'
import './index.css'

const CalendarPage = lazy(() =>
  import('./features/calendar/pages/calendar-page').then((m) => ({
    default: m.CalendarPage,
  })),
)
const EventDetailPage = lazy(() =>
  import('./features/calendar/pages/event-detail-page').then((m) => ({
    default: m.EventDetailPage,
  })),
)
const EventFormPage = lazy(() =>
  import('./features/calendar/pages/event-form-page').then((m) => ({
    default: m.EventFormPage,
  })),
)
const TemplatesListPage = lazy(() =>
  import('./features/worship-services/pages/templates-list-page').then((m) => ({
    default: m.TemplatesListPage,
  })),
)
const ProgramsListPage = lazy(() =>
  import('./features/worship-services/pages/programs-list-page').then((m) => ({
    default: m.ProgramsListPage,
  })),
)
const TemplateFormPage = lazy(() =>
  import('./features/worship-services/pages/template-form-page').then((m) => ({
    default: m.TemplateFormPage,
  })),
)
const ProgramCreatePage = lazy(() =>
  import('./features/worship-services/pages/program-create-page').then((m) => ({
    default: m.ProgramCreatePage,
  })),
)
const ProgramDetailPage = lazy(() =>
  import('./features/worship-services/pages/program-detail-page').then((m) => ({
    default: m.ProgramDetailPage,
  })),
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-16 text-neutral-500">
      Cargando...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <TextSizeProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AdaptiveLayout />}>
              <Route path="/calendario/:slug" element={<EventDetailPage />} />
            </Route>

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route
                path="calendario/nuevo"
                element={<EventFormPage mode="create" />}
              />
              <Route
                path="calendario/:slug/editar"
                element={<EventFormPage mode="edit" />}
              />
              <Route path="cultos/plantillas" element={<TemplatesListPage />} />
              <Route path="cultos/plantillas/nuevo" element={<TemplateFormPage />} />
              <Route path="cultos/plantillas/:id/editar" element={<TemplateFormPage />} />
              <Route path="cultos/programas" element={<ProgramsListPage />} />
              <Route path="cultos/programas/nuevo" element={<ProgramCreatePage />} />
              <Route path="cultos/programas/:id" element={<ProgramDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </TextSizeProvider>
    </BrowserRouter>
  )
}

export default App
