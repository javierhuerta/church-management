## ADDED Requirements

### Requirement: Sidebar includes dark mode toggle

The system SHALL provide a dark mode toggle within the sidebar user profile dropdown, allowing the user to select between Light, Dark, and System (OS preference) themes. The toggle SHALL appear in the same dropdown section as the text size preference selector.

#### Scenario: User can switch to dark mode from sidebar
- **WHEN** user opens the profile dropdown in the sidebar and selects "Oscuro"
- **THEN** the application switches to dark color palette immediately
- **AND** the `<html>` element receives the `.dark` class
- **AND** the selection is saved to `localStorage`

#### Scenario: User can switch to light mode from sidebar
- **WHEN** user opens the profile dropdown in the sidebar and selects "Claro"
- **THEN** the application switches to light color palette immediately
- **AND** the `.dark` class is removed from `<html>`
- **AND** the selection is saved to `localStorage`

#### Scenario: User can set theme to follow OS preference
- **WHEN** user opens the profile dropdown and selects "Sistema"
- **THEN** the application theme matches the OS `prefers-color-scheme` setting
- **AND** this preference is saved to `localStorage`

#### Scenario: Active theme option is visually distinguished
- **WHEN** user opens the profile dropdown and views theme options
- **THEN** the currently active theme option is highlighted (filled/active state)
- **AND** the other options appear unselected

### Requirement: Application provides sidebar navigation

The system SHALL provide a sidebar navigation component that displays module menu items and remains visible on all protected pages. All sidebar colors SHALL use semantic design tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`, etc.) so the sidebar is visually correct in both light and dark themes.

#### Scenario: Sidebar displays branding header with logo
- **WHEN** user is on any protected page
- **THEN** sidebar shows a branded header with church logo (gradient), name "Iglesia Adventista" and subtitle "Osorno Central"

#### Scenario: Sidebar displays module navigation menu
- **WHEN** user is authenticated and on any protected page
- **THEN** sidebar shows navigation menu with modules: Calendario, Cultos, Misión
- **AND** each module has an icon from Lucide React (Calendar, FileText, Heart)
- **AND** active module shows highlight using `bg-primary/10 text-primary` semantic tokens
- **AND** disabled modules show "Pronto" badge

#### Scenario: Sidebar shows user profile section
- **WHEN** user is authenticated
- **THEN** sidebar displays user avatar with initials, name, role, and chevron indicator

#### Scenario: User can access profile options via dropdown
- **WHEN** user clicks on the profile area in sidebar
- **THEN** a dropdown overlay appears with options: Ver Perfil, Tamaño de texto, Tema, Cerrar Sesión

#### Scenario: User can navigate to a module by clicking menu item
- **WHEN** user clicks on a non-disabled module name in sidebar
- **THEN** user is navigated to the corresponding module page

### Requirement: Sidebar includes text size accessibility settings

The system SHALL provide a text size selector within the user profile dropdown that allows users to adjust component text sizes.

#### Scenario: User can select text size preference
- **WHEN** user opens the profile dropdown and selects a text size option
- **THEN** the application updates all component text sizes to match the selected preference

#### Scenario: Text size preference is persisted
- **WHEN** user selects a text size and refreshes the page or returns later
- **THEN** the application applies the saved text size preference

#### Scenario: Text size options are Small, Medium, and Large
- **WHEN** user is on the text size selector
- **THEN** three pill-style buttons are available: Pequeño, Mediano, Grande
- **AND** selected option shows active state using semantic tokens