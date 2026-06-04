import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoginPage } from './features/auth/pages/login-page'
import { AppLayout } from './layouts/app-layout'
import { AdaptiveLayout } from './layouts/adaptive-layout'
import { DashboardPage } from './features/dashboard/pages/dashboard-page'
import { MantenedoresLayout } from './features/mantenedores/layouts/mantenedores-layout'
import { MissionLayout } from './features/mission/layouts/mission-layout'
import { ProfilePage } from './features/profile/pages/profile-page'
import { TextSizeProvider } from './lib/contexts/text-size-context'
import { ThemePreviewPage } from './features/theme-preview/theme-preview-page'
import { Toaster } from './components/ui/sonner'
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
const UsersListPage = lazy(() =>
  import('./features/mantenedores/pages/users-list-page').then((m) => ({
    default: m.UsersListPage,
  })),
)
const UserFormPage = lazy(() =>
  import('./features/mantenedores/pages/user-form-page').then((m) => ({
    default: m.UserFormPage,
  })),
)
const DepartmentsListPage = lazy(() =>
  import('./features/mantenedores/pages/departments-list-page').then((m) => ({
    default: m.DepartmentsListPage,
  })),
)
const DepartmentFormPage = lazy(() =>
  import('./features/mantenedores/pages/department-form-page').then((m) => ({
    default: m.DepartmentFormPage,
  })),
)
const CatalogsListPage = lazy(() =>
  import('./features/mantenedores/pages/catalogs-list-page').then((m) => ({
    default: m.CatalogsListPage,
  })),
)
const CatalogFormPage = lazy(() =>
  import('./features/mantenedores/pages/catalog-form-page').then((m) => ({
    default: m.CatalogFormPage,
  })),
)
const PeopleListPage = lazy(() =>
  import('./features/mission/pages/people-list-page').then((m) => ({
    default: m.PeopleListPage,
  })),
)
const PersonFormPage = lazy(() =>
  import('./features/mission/pages/person-form-page').then((m) => ({
    default: m.PersonFormPage,
  })),
)
const VisitsListPage = lazy(() =>
  import('./features/mission/pages/visits-list-page').then((m) => ({
    default: m.VisitsListPage,
  })),
)
const VisitFormPage = lazy(() =>
  import('./features/mission/pages/visit-form-page').then((m) => ({
    default: m.VisitFormPage,
  })),
)
const RescueListPage = lazy(() =>
  import('./features/mission/pages/rescue-list-page').then((m) => ({
    default: m.RescueListPage,
  })),
)
const RescueFormPage = lazy(() =>
  import('./features/mission/pages/rescue-form-page').then((m) => ({
    default: m.RescueFormPage,
  })),
)
const SmallGroupsListPage = lazy(() =>
  import('./features/mission/pages/small-groups-list-page').then((m) => ({
    default: m.SmallGroupsListPage,
  })),
)
const SmallGroupFormPage = lazy(() =>
  import('./features/mission/pages/small-group-form-page').then((m) => ({
    default: m.SmallGroupFormPage,
  })),
)
const SmallGroupDetailPage = lazy(() =>
  import('./features/mission/pages/small-group-detail-page').then((m) => ({
    default: m.SmallGroupDetailPage,
  })),
)
const SabbathClassesListPage = lazy(() =>
  import('./features/mission/pages/sabbath-classes-list-page').then((m) => ({
    default: m.SabbathClassesListPage,
  })),
)
const SabbathClassFormPage = lazy(() =>
  import('./features/mission/pages/sabbath-class-form-page').then((m) => ({
    default: m.SabbathClassFormPage,
  })),
)
const MissionaryTeamsListPage = lazy(() =>
  import('./features/mission/pages/missionary-teams-list-page').then((m) => ({
    default: m.MissionaryTeamsListPage,
  })),
)
const MissionaryTeamFormPage = lazy(() =>
  import('./features/mission/pages/missionary-team-form-page').then((m) => ({
    default: m.MissionaryTeamFormPage,
  })),
)
const MissionaryTeamDetailPage = lazy(() =>
  import('./features/mission/pages/missionary-team-detail-page').then((m) => ({
    default: m.MissionaryTeamDetailPage,
  })),
)
const BibleCoursesListPage = lazy(() =>
  import('./features/mission/pages/bible-courses-list-page').then((m) => ({
    default: m.BibleCoursesListPage,
  })),
)
const BibleStudiesListPage = lazy(() =>
  import('./features/mission/pages/bible-studies-list-page').then((m) => ({
    default: m.BibleStudiesListPage,
  })),
)
const BibleStudyFormPage = lazy(() =>
  import('./features/mission/pages/bible-study-form-page').then((m) => ({
    default: m.BibleStudyFormPage,
  })),
)
const DocumentCenterPage = lazy(() =>
  import('./features/document-center/pages/document-center-page').then((m) => ({
    default: m.DocumentCenterPage,
  })),
)
const ShowcaseViewPage = lazy(() =>
  import('./features/departments/pages/showcase-view-page').then((m) => ({
    default: m.ShowcaseViewPage,
  })),
)
const ShowcaseEditPage = lazy(() =>
  import('./features/departments/pages/showcase-edit-page').then((m) => ({
    default: m.ShowcaseEditPage,
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
    <BrowserRouter basename="/admin">
      <TextSizeProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/theme-preview" element={<ThemePreviewPage />} />

            <Route element={<AdaptiveLayout />}>
              <Route path="/calendario/:slug" element={<EventDetailPage />} />
              <Route path="/calendario" element={<CalendarPage />} />
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
              <Route path="perfil" element={<ProfilePage />} />
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

              <Route path="misionero" element={<MissionLayout />}>
                <Route index element={<Navigate to="personas" replace />} />
                <Route path="personas" element={<PeopleListPage />} />
                <Route path="personas/nuevo" element={<PersonFormPage />} />
                <Route path="personas/:id" element={<PersonFormPage />} />
                <Route path="visitas" element={<VisitsListPage />} />
                <Route path="visitas/nuevo" element={<VisitFormPage />} />
                <Route path="visitas/:id" element={<VisitFormPage />} />
                <Route path="rescate" element={<RescueListPage />} />
                <Route path="rescate/nuevo" element={<RescueFormPage />} />
                <Route path="rescate/:id" element={<RescueFormPage />} />
                <Route path="grupos" element={<SmallGroupsListPage />} />
                <Route path="grupos/nuevo" element={<SmallGroupFormPage />} />
                <Route path="grupos/:id/editar" element={<SmallGroupFormPage />} />
                <Route path="grupos/:id" element={<SmallGroupDetailPage />} />
                <Route path="clases-es" element={<SabbathClassesListPage />} />
                <Route path="clases-es/nuevo" element={<SabbathClassFormPage />} />
                <Route path="clases-es/:id/editar" element={<SabbathClassFormPage />} />
                <Route path="equipos" element={<MissionaryTeamsListPage />} />
                <Route path="equipos/nuevo" element={<MissionaryTeamFormPage />} />
                <Route path="equipos/:id/editar" element={<MissionaryTeamFormPage />} />
                <Route path="equipos/:id" element={<MissionaryTeamDetailPage />} />
                <Route path="cursos" element={<BibleCoursesListPage />} />
                <Route path="estudios" element={<BibleStudiesListPage />} />
                <Route path="estudios/nuevo" element={<BibleStudyFormPage />} />
                <Route path="estudios/:id" element={<BibleStudyFormPage />} />
              </Route>

              <Route path="documentos" element={<DocumentCenterPage />} />

              {/* Department showcase routes */}
              <Route path="departamentos/:id" element={<ShowcaseViewPage />} />
              <Route path="departamentos/:id/editar" element={<ShowcaseEditPage />} />

              <Route path="mantenedores" element={<MantenedoresLayout />}>
                <Route index element={<Navigate to="usuarios" replace />} />
                <Route path="usuarios" element={<UsersListPage />} />
                <Route path="usuarios/nuevo" element={<UserFormPage />} />
                <Route path="usuarios/:id" element={<UserFormPage />} />
                <Route path="departamentos" element={<DepartmentsListPage />} />
                <Route path="departamentos/nuevo" element={<DepartmentFormPage />} />
                <Route path="departamentos/:id" element={<DepartmentFormPage />} />
                <Route path="plantillas" element={<TemplatesListPage />} />
                <Route path="plantillas/nuevo" element={<TemplateFormPage />} />
                <Route path="plantillas/:id/editar" element={<TemplateFormPage />} />
                <Route path="catalogos" element={<CatalogsListPage />} />
                <Route path="catalogos/:id" element={<CatalogFormPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </TextSizeProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
