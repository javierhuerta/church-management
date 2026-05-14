## Context

Currently the application has a basic header without module navigation or user session management. The sidebar layout needs to integrate with existing shadcn/ui components and follow the established design system.

## Goals / Non-Goals

**Goals:**
- Provide sidebar navigation for all modules (Calendario, Cultos, Misión)
- Display user profile info with logout option
- Support text size accessibility (Small/Medium/Large) via localStorage
- Use shadcn/ui components for consistent styling

**Non-Goals:**
- Backend API changes
- Mobile-specific responsive sidebar (deferred to future)
- Authentication flow modifications
- Role-based menu visibility (deferred, all users see all modules)

## Decisions

### 1. Sidebar Component Architecture

**Decision**: Create `Sidebar` as a standalone component at `src/components/layout/sidebar.tsx`

**Rationale**: Layout components should be reusable across pages. Keeping it in `components/layout/` follows the project structure convention.

**Alternative considered**: Feature-based folder (`src/features/layout/`). Decided against because layout components are cross-cutting and used by multiple features.

### 2. Text Size Implementation

**Decision**: Use a React Context (`TextSizeContext`) to provide text size preference throughout the app, with Tailwind's `text-sm`/`text-base`/`text-lg` classes applied via a wrapper component.

**Rationale**:
- Context allows any component to access the preference without prop drilling
- Tailwind's scale utilities avoid custom CSS
- localStorage sync on context mount/discard for persistence

**Alternative considered**: CSS custom properties (CSS variables) for dynamic theming. Could work but mixing with shadcn/ui's built-in theming adds complexity.

### 3. User Profile Section

**Decision**: Use `DropdownMenu` from shadcn/ui for the user section. Clicking the avatar reveals options: Ver Perfil, Cerrar Sesión.

**Rationale**:
- Familiar pattern for users (standard dropdown behavior)
- shadcn/ui DropdownMenu handles all accessibility and keyboard navigation
- Avatar displays user initials as fallback when no image

### 4. Navigation Menu Items

**Decision**: Use `Accordion` from shadcn/ui for module navigation structure, allowing collapsible sections per module.

**Rationale**:
- Provides clear visual hierarchy for multiple modules
- Built-in animation and accessibility
- Easy to extend when new modules (Cultos, Misión) are added

### 5. Text Size Selector Location

**Decision**: Place text size selector inside the user dropdown menu.

**Rationale**:
- Keeps settings accessible without cluttering the sidebar
- One place for all user preferences
- Consistent with profile/settings patterns

## Risks / Trade-offs

[Risk] Text size changes may break component layouts at extreme sizes (Large) → **Mitigation**: Test with real content, limit max size to 'large'

[Risk] localStorage unavailable (private browsing) → **Mitigation**: Default to 'medium' if localStorage read fails

[Risk] Module names will change as more modules are added → **Mitigation**: Menu items come from a config object, easy to update

## Open Questions

- Should we show only modules the user has permission to access? (Decided: no, deferred to role-based permissions work)
- Do we need a sidebar collapse button for desktop? (Decided: no, sidebar always visible on desktop)
- Should we add icons to menu items? (Decided: yes, use Lucide React icons)