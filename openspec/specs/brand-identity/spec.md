# Brand Identity

## Purpose

TBD — Defines the visual brand identity of Adventistas Central Osorno applied to the application, including color palette, typography, and logo assets.

## Requirements

### Requirement: Application uses the brand color palette of Adventistas Central Osorno
The system SHALL use a color token system derived from the official church logo: deep navy (`hsl(219 59% 25%)`) as primary, warm gold (`hsl(40 55% 55%)`) as accent, and warm cream (`hsl(36 50% 97%)`) as background. These tokens SHALL be defined as CSS custom properties in `index.css` and mapped to Tailwind utility classes via `@theme inline`.

#### Scenario: Primary color reflects church brand
- **WHEN** any interactive element uses `bg-primary` or `text-primary`
- **THEN** it renders in navy `#1B3A6B` (light) or `#6B9FDB` (dark)

#### Scenario: Accent color is used for decorative highlights
- **WHEN** any element uses `bg-accent` or `text-accent-foreground`
- **THEN** it renders in gold `#C9A84C` (light) or `#D4B060` (dark)

#### Scenario: Background has warm cream tone in light mode
- **WHEN** the application is in light mode
- **THEN** the page background renders as `hsl(36 50% 97%)` (warm cream), not pure white

#### Scenario: Dark mode uses deep navy-tinted background
- **WHEN** the application is in dark mode
- **THEN** the page background renders as `hsl(222 47% 8%)` (dark navy, not pure black)

### Requirement: Application uses Lato as the primary typeface
The system SHALL load Lato (weights 300, 400, 500, 700) from Google Fonts and apply it as the base font-family for all UI text.

#### Scenario: Body text uses Lato
- **WHEN** any page is rendered
- **THEN** body text, labels, buttons, and form inputs use Lato font

### Requirement: Application uses Playfair Display for display headings
The system SHALL load Playfair Display (weights 600, 700) from Google Fonts and apply it to top-level page headings (login title, dashboard module headers).

#### Scenario: Login heading uses Playfair Display
- **WHEN** the login page is rendered
- **THEN** the main greeting heading uses Playfair Display font

### Requirement: Application provides an SVG logo usable at any size and theme
The system SHALL provide `logo.svg` (full lockup: symbol + text) and `logo-mark.svg` (symbol only) as SVG assets. Both SHALL use `currentColor` so they adapt automatically to light and dark contexts.

#### Scenario: Logo renders correctly in light mode
- **WHEN** the logo SVG is displayed on a light background
- **THEN** it renders in navy blue without requiring additional CSS

#### Scenario: Logo renders correctly in dark mode
- **WHEN** the logo SVG is displayed on a dark background
- **THEN** it renders in a light blue/white tone via `currentColor` inheritance
