# Frontend Theme System

## Purpose

Provides light and dark visual themes across the entire application using CSS variables and Tailwind v4 semantic tokens, with user preference persistence and OS-level fallback.

## Requirements

### Requirement: Application supports light and dark visual themes

The system SHALL support light and dark color themes across the entire application, using CSS variables mapped via `@theme inline` in Tailwind v4 so that all shadcn/ui utility classes (e.g., `bg-background`, `text-foreground`, `bg-primary`) respond automatically to the active theme without per-component `dark:` overrides.

#### Scenario: Application renders in light theme by default when no preference is stored
- **WHEN** user visits the application for the first time with no stored theme preference and OS set to light
- **THEN** the application renders with the light color palette
- **AND** `<html>` element does not have the `.dark` class

#### Scenario: Application respects OS dark mode preference by default
- **WHEN** user visits the application for the first time with no stored preference and OS set to dark
- **THEN** the application renders with the dark color palette
- **AND** `<html>` element has the `.dark` class

#### Scenario: Semantic utility classes apply correct colors for the active theme
- **WHEN** user is in light mode
- **THEN** `bg-background` applies the light background token
- **AND** `bg-card` applies the light card token
- **AND** `text-muted-foreground` applies the light muted text token

#### Scenario: Semantic utility classes update when theme changes
- **WHEN** user switches from light to dark mode
- **THEN** all components using semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`, etc.) update their colors without a page reload

### Requirement: Theme preference is persisted across sessions

The system SHALL persist the user's theme selection in `localStorage` so that the chosen theme is restored on subsequent visits.

#### Scenario: Stored theme is restored on page refresh
- **WHEN** user has previously selected "dark" theme and refreshes the page
- **THEN** application starts in dark mode without flickering through light mode first

#### Scenario: Stored theme is restored after closing and reopening the browser
- **WHEN** user selected "light" theme in a previous session
- **THEN** application starts in light mode on the new session

### Requirement: Toaster notifications respect the active theme

The system SHALL render toast notifications (Sonner) matching the active theme so that notification styling is visually consistent with the rest of the application.

#### Scenario: Toaster uses dark styling in dark mode
- **WHEN** the active theme is dark
- **THEN** Sonner toasts render with dark background and light text

#### Scenario: Toaster uses light styling in light mode
- **WHEN** the active theme is light
- **THEN** Sonner toasts render with light background and dark text
