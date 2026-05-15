## ADDED Requirements

### Requirement: Reusable single-date picker component

The system SHALL provide a reusable `DatePicker` UI component composed of the shadcn `Popover`, a `Calendar` (react-day-picker), and a `Button` trigger. Its public API SHALL be string-based: it accepts `value: string` and emits `onChange(value: string)`, using the format `YYYY-MM-DD`. It SHALL NOT expose a `Date` object to consumers.

#### Scenario: Display the current value

- **WHEN** the component receives `value="2026-05-15"`
- **THEN** the trigger button shows the date formatted in Spanish locale (e.g. "15 may 2026")
- **AND** opening the popover shows May 2026 with the 15th selected

#### Scenario: Select a date

- **WHEN** the user opens the popover and clicks a day
- **THEN** the component calls `onChange` with that day as a `YYYY-MM-DD` string
- **AND** the popover closes

#### Scenario: Empty value

- **WHEN** the component receives an empty or undefined `value`
- **THEN** the trigger shows a placeholder and no day is selected

#### Scenario: Timezone-safe round trip

- **WHEN** the browser timezone is UTC-4 and the user selects the 15th of a month
- **THEN** `onChange` emits the 15th (not the 14th)
- **AND** re-passing that string as `value` re-selects the same day

### Requirement: Reusable date-and-time picker component

The system SHALL provide a reusable `DateTimePicker` component that composes a `Calendar` with a time control inside a single popover. Its API SHALL be string-based with the format `YYYY-MM-DDTHH:mm`.

#### Scenario: Select date and time

- **WHEN** the user picks a day and sets a time
- **THEN** the component emits `onChange` with a `YYYY-MM-DDTHH:mm` string combining both
- **AND** the trigger displays the localized date and time

#### Scenario: Preserve time when changing date

- **WHEN** a time is already set and the user changes only the day
- **THEN** the emitted value keeps the previously selected time

#### Scenario: Timezone-safe round trip

- **WHEN** the user selects a date and time
- **THEN** the emitted string is not shifted by the browser timezone offset
- **AND** re-passing it as `value` shows the same date and time

### Requirement: Reusable date-range picker component

The system SHALL provide a reusable `DateRangePicker` component using `react-day-picker` in `mode="range"` within a single popover. It SHALL accept and emit a range as strings: `{ from: string; to: string }` using `YYYY-MM-DD`.

#### Scenario: Select a range

- **WHEN** the user clicks a start day and then an end day
- **THEN** the component emits `onChange` with `{ from, to }` as `YYYY-MM-DD` strings
- **AND** the trigger displays the localized range

#### Scenario: Partial range

- **WHEN** only the start day has been selected
- **THEN** the component emits the `from` value with `to` empty/undefined

#### Scenario: Clear the range

- **WHEN** the user clears the selection
- **THEN** the component emits an empty range and the trigger shows a placeholder

### Requirement: react-hook-form integration

The date picker components SHALL be usable inside react-hook-form via `Controller`, binding `field.value` to `value` and `field.onChange` to `onChange`, without requiring a native DOM input element.

#### Scenario: Bound through Controller

- **WHEN** a `DatePicker` is rendered inside a `Controller` for a form field
- **THEN** selecting a date updates the form state with the `YYYY-MM-DD` string
- **AND** existing validation schemas continue to operate on that string unchanged

### Requirement: Spanish localization

All date picker components SHALL render month names, weekday labels, and formatted values using the `es` locale from `date-fns`, consistent with existing date formatting in the application.

#### Scenario: Spanish month and weekday labels

- **WHEN** any date picker popover is opened
- **THEN** month names and weekday headers are displayed in Spanish
