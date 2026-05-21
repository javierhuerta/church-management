# Frontend Theme System

## Purpose

Provides light and dark visual themes across the entire application using CSS variables and Tailwind v4 semantic tokens, with user preference persistence. The color palette uses the brand identity of Adventistas Central Osorno (navy primary, gold accent, warm cream background).

## Requirements

### Requirement: Application supports light and dark visual themes

The system SHALL support light and dark color themes across the entire application, using CSS variables mapped via `@theme inline` in Tailwind v4 so that all shadcn/ui utility classes (e.g., `bg-background`, `text-foreground`, `bg-primary`) respond automatically to the active theme without per-component `dark:` overrides. The color palette SHALL use the brand identity of Adventistas Central Osorno (navy primary, gold accent, warm cream background).

#### Scenario: Application renders in light theme by default when no preference is stored
- **WHEN** user visits the application for the first time with no stored theme preference
- **THEN** the application renders with the light color palette regardless of OS preference
- **AND** `<html>` element does not have the `.dark` class

#### Scenario: Semantic utility classes apply correct colors for the active theme
- **WHEN** user is in light mode
- **THEN** `bg-background` applies warm cream `hsl(36 50% 97%)`
- **AND** `bg-primary` applies navy `hsl(219 59% 25%)`
- **AND** `bg-accent` applies gold `hsl(40 55% 55%)`

#### Scenario: Semantic utility classes update when theme changes
- **WHEN** user switches from light to dark mode
- **THEN** all components using semantic tokens update their colors without a page reload

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

### Requirement: All application components support dark mode without hardcoded colors
The system SHALL ensure that every component and page in the Calendar, WorshipServices, Mantenedores, and Dashboard modules uses semantic Tailwind tokens exclusively — no hardcoded `bg-white`, `text-neutral-*`, `bg-blue-*`, or equivalent Tailwind raw-color classes — so that dark mode renders correctly throughout the application.

#### Scenario: Calendar module renders correctly in dark mode
- **WHEN** user switches to dark mode and navigates to the Calendar
- **THEN** all calendar components (grid, event cards, filters, detail page, form) render with correct contrast using semantic tokens

#### Scenario: Worship Services module renders correctly in dark mode
- **WHEN** user switches to dark mode and navigates to Gestión de Cultos
- **THEN** all program/template pages and components render with correct contrast

#### Scenario: Mantenedores module renders correctly in dark mode
- **WHEN** user switches to dark mode and navigates to Mantenedores
- **THEN** all list and form pages render with correct contrast

#### Scenario: Dashboard renders correctly in dark mode
- **WHEN** user switches to dark mode and navigates to Dashboard
- **THEN** dashboard page renders with correct contrast using semantic tokens
