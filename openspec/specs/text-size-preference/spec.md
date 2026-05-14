## ADDED Requirements

### Requirement: Application supports text size preferences

The system SHALL provide text size preference support that allows users to select between Small, Medium, and Large sizes, and persists this preference across sessions.

#### Scenario: Text size preference is stored in localStorage
- **WHEN** user selects a text size from the selector
- **THEN** the preference is saved to localStorage under key `text-size-preference`

#### Scenario: Text size preference defaults to Medium
- **WHEN** user visits the application for the first time or localStorage is unavailable
- **THEN** the application defaults to Medium text size

#### Scenario: Application applies text size class to root element
- **WHEN** text size preference is loaded (on app mount)
- **THEN** the system applies a CSS class to the root element: `text-sm` for Small, `text-base` for Medium, `text-lg` for Large

#### Scenario: Text size preference is accessible throughout the application
- **WHEN** any component needs to reference the current text size
- **THEN** the component can access the TextSizeContext value