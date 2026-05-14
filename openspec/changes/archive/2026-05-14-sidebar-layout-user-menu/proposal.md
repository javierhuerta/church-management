## Why

The current application layout only has a basic header without navigation structure. Users need a clear way to navigate between modules (Calendario, Cultos, Misión) and manage their session. Additionally, users with visual accessibility needs require the ability to adjust component sizes.

## What Changes

- **New sidebar navigation** with menu items for each module (Calendario, Cultos, Misión)
- **User profile section** in sidebar showing name, role, and avatar placeholder
- **Logout option** accessible from user profile section
- **Text size selector** with Small/Medium/Large options stored in localStorage
- Sidebar can be collapsible on mobile
- Layout respects text size preference across all components

## Capabilities

### New Capabilities
- `sidebar-navigation`: Sidebar component with module menu navigation, user profile dropdown, and accessibility settings
- `text-size-preference`: User preference for text/component size (small/medium/large) persisted to localStorage

### Modified Capabilities
- `app-layout`: Requirements change to include sidebar structure, user profile section, and text size support

## Impact

- **Frontend**: New components in `src/components/` and `src/features/`
- **Dependencies**: shadcn/ui components (Accordion, DropdownMenu, Avatar, Select)
- **Styling**: Tailwind CSS scale adjustments based on text size preference
- **Storage**: localStorage for text size preference persistence

## Out of Scope

- Authentication flow changes (already implemented)
- Backend API changes
- Mobile-specific sidebar behavior (future enhancement)
- User settings beyond text size