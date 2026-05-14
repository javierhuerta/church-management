## 1. Sidebar State and Media Query

- [x] 1.1 Add `isCollapsed` state to Sidebar component
- [x] 1.2 Add `useEffect` with `window.matchMedia` listener for breakpoint detection (max-width: 1023px)
- [x] 1.3 Add click handler on logo to expand sidebar when collapsed

## 2. Sidebar Layout and Transitions

- [x] 2.1 Update sidebar width classes: `w-64` → conditional `w-64` / `w-16`
- [x] 2.2 Add transition classes: `transition-all duration-300 ease-in-out`
- [x] 2.3 Conditionally render header text (Iglesia Adventista, Osorno Central) based on collapse state

## 3. Navigation Items

- [x] 3.1 Conditionally render nav item labels based on collapse state
- [x] 3.2 Ensure nav items remain clickeable and navigate correctly in both states
- [x] 3.3 Adjust icon sizing/spacing if needed for collapsed mode

## 4. Profile Section

- [x] 4.1 Import `DropdownMenu` components from `@/components/ui/dropdown-menu` (Radix)
- [x] 4.2 Conditionally render profile section:
  - Expanded: current implementation (avatar + name + manual dropdown)
  - Collapsed: Avatar only, wrapped in DropdownMenu
- [x] 4.3 Ensure DropdownMenu contains: Ver Perfil, Tamaño de texto, Cerrar Sesión
- [x] 4.4 Connect logout and text size functions to DropdownMenu items

## 5. Testing

- [x] 5.1 Test sidebar collapse on viewport < 1024px
- [x] 5.2 Test sidebar expand when clicking IA logo
- [x] 5.3 Test navigation works in both states
- [x] 5.4 Test profile dropdown functions in collapsed mode
- [x] 5.5 Test text size preference persists across collapse/expand