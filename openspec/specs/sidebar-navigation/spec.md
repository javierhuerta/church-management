## ADDED Requirements

### Requirement: Application provides sidebar navigation

The system SHALL provide a sidebar navigation component that displays module menu items and remains visible on all protected pages.

#### Scenario: Sidebar displays branding header with logo
- **WHEN** user is on any protected page
- **THEN** sidebar shows a branded header with church logo (gradient blue), name "Iglesia Adventista" and subtitle "Osorno Central"

#### Scenario: Sidebar displays module navigation menu
- **WHEN** user is authenticated and on any protected page
- **THEN** sidebar shows navigation menu with modules: Calendario, Cultos (disabled), Misión (disabled)
- **AND** each module has an icon from Lucide React (Calendar, FileText, Heart)
- **AND** active module shows blue highlight with border and indicator dot
- **AND** disabled modules show "Pronto" badge

#### Scenario: Sidebar shows user profile section
- **WHEN** user is authenticated
- **THEN** sidebar displays user avatar with initials (gradient dark background), name, role, and chevron indicator

#### Scenario: User can access profile options via dropdown
- **WHEN** user clicks on the profile area in sidebar
- **THEN** a dropdown overlay appears with options: Ver Perfil, Tamaño de texto, Cerrar Sesión

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
- **AND** selected option shows blue background with white text