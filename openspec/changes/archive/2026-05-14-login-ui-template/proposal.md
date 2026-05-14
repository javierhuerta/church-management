## Why

El sistema actualmente carece de una interfaz de autenticación para usuarios. Aunque el backend tiene autenticación JWT implementada, el frontend no tiene una pantalla de login ni una estructura de layout que permita navegación entre páginas. Esto impide que los usuarios puedan acceder al sistema.

## What Changes

- Nueva pantalla de login con formulario de email/password
- Componente de Layout base con Header (Navbar), contenido principal, y Footer
- Página de dashboard/home después del login (protegida)
- Redirección automática a login si no hay sesión activa
- Implementación usando shadcn/ui con componentes de formulario y diseño

## Capabilities

### New Capabilities
- `login-ui`: Pantalla de login con validación de formulario y manejo de errores
- `app-layout`: Estructura base de la aplicación con navegación y footer

### Modified Capabilities
- `auth`: Se agregará el scenario de "用户在界面登录" para cubrir el flujo completo de login desde el frontend

## Impact

- Crea `frontend/src/features/auth/pages/login-page.tsx`
- Crea `frontend/src/features/auth/components/login-form.tsx`
- Crea `frontend/src/components/ui/` con componentes shadcn
- Modifica `frontend/src/App.tsx` para usar router
- Crea `frontend/src/layouts/` con componentes de layout
- Dependencias: react-router-dom para navegación

## Fuera del alcance

- No incluye funcionalidad de registro de usuarios
- No incluye recuperación de contraseña
- No incluye páginas de perfil o settings
- La pantalla de login será básica sin estilos personalizados (usará temas de shadcn por defecto)