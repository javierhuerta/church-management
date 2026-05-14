## Context

El frontend actual (React + Vite + Tailwind) no tiene navegación ni estructura de layout. Solo existe un App.tsx con ejemplo de Vite. El backend tiene auth JWT implementada pero no hay forma de que el usuario interactúe con ella desde el frontend.

## Goals / Non-Goals

**Goals:**
- Pantalla de login funcional con validación de email/password
- Layout base reutilizable con Header (navbar), contenido principal, y Footer
- Redirección automática a login cuando no hay sesión activa
- Navegación básica entre páginas (login → dashboard)

**Non-Goals:**
- No incluye auth state management completo (refrescar tokens, logout)
- No incluye páginas de perfil, settings, o registro
- No incluye navegación secundaria o submenús
- No incluye validación de roles en frontend

## Decisions

### 1. Routing con react-router-dom

**Decisión**: Usar react-router-dom v6 para la navegación.

```tsx
// App.tsx con rutas
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedLayout />}>
      <Route index element={<DashboardPage />} />
      {/* otras rutas protegidas */}
    </Route>
  </Routes>
</BrowserRouter>
```

**Alternativa**: Usar autenticación server-side con cookies — Descartado porque el backend usa JWT Bearer tokens.

### 2. Estructura de carpetas

**Decisión**: Organización por features + layouts + components/shadcn.

```
frontend/src/
├── features/
│   └── auth/
│       ├── pages/
│       │   └── login-page.tsx
│       └── components/
│           └── login-form.tsx
├── layouts/
│   └── app-layout.tsx
├── components/
│   └── ui/           # componentes shadcn
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── card.tsx
├── App.tsx
└── main.tsx
```

**Alternativa**: Carpeta `pages/` plana — Descartado porque no escala bien cuando haya múltiples features.

### 3. shadcn/ui para componentes base

**Decisión**: Instalar componentes shadcn individualmente (button, input, card, label, form).

```bash
npx shadcn@latest add button input label card form
```

**Alternativa**: Componentes customCSS — Descartado para mantener consistencia con el proyecto.

### 4. Login sin AuthContext aún

**Decisión**: Por ahora el login guarda el token en localStorage y la protección de rutas es mínima (solo verifica existencia de token). El auth state management completo se hará en otro change.

```tsx
// Login simplificado
const handleSubmit = async (data: LoginInput) => {
  const response = await apiClient.post('/auth/login', data);
  localStorage.setItem('token', response.data.access_token);
  navigate('/');
};
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Sin AuthContext, no hay refresh token automático | Se implementará en change posterior (auth-state) |
| Token almacenado en localStorage (vulnerable a XSS) | A futuro usar httpOnly cookies cuando backend soporte |
| Components shadcn requieren configuración de Tailwind | Verificar que tailwind.config.js tenga content paths correctos |