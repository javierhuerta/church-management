## 1. Setup and Dependencies

- [x] 1.2 Create TextSizeContext in `src/lib/contexts/text-size-context.tsx`
- [x] 1.3 Add TextSizeProvider to App component

## 2. Text Size Preference System

- [x] 2.1 Create TextSizeProvider with localStorage sync (key: `text-size-preference`)
- [x] 2.2 Implement useTextSize hook for consuming components
- [x] 2.3 Apply text-sm/text-base/text-lg class to root element based on preference
- [x] 2.4 Default to 'medium' when localStorage unavailable

## 3. Sidebar Component

- [x] 3.1 Create `src/components/layout/sidebar.tsx` component
- [x] 3.2 Implement navigation menu with Accordion for modules (Calendario, Cultos, Misión)
- [x] 3.3 Add Lucide icons to menu items (Calendar, FileText, Heart)
- [x] 3.4 Create user profile section at bottom with Avatar and user info
- [x] 3.5 Implement DropdownMenu for profile options (Ver Perfil, Cerrar Sesión)
- [x] 3.6 Add text size selector (Select with Pequeño/Mediano/Grande) inside dropdown

## 4. App Layout Integration

- [x] 4.1 Update AppLayout component to include Sidebar
- [x] 4.2 Apply text size class to AppLayout root element
- [x] 4.3 Ensure main content area adjusts to sidebar width
- [x] 4.4 Apply styles with proper Tailwind spacing (h-screen, w-64, etc.)

## 5. Authentication Integration

- [x] 5.1 Connect logout action to AuthService.authControllerLogout()
- [x] 5.2 Clear localStorage on logout (tokens and text-size-preference)
- [x] 5.3 Redirect to /login after logout
- [x] 5.4 Get user info from AuthContext or localStorage

## 6. Testing and Verification

- [x] 6.1 Test sidebar navigation to Calendar page
- [x] 6.2 Test user dropdown opens and displays options
- [x] 6.3 Test text size selector changes component sizes
- [x] 6.4 Verify text size persists after page refresh
- [x] 6.5 Test logout and verify redirect to login