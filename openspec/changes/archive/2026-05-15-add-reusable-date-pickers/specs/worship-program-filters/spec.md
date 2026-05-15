## MODIFIED Requirements

### Requirement: Filter program list by date range

The system SHALL allow filtering the program list by a date range applied to the event date (`date` field), using a single `DateRangePicker` control (one popover for start and end) instead of two separate date inputs. The underlying filter contract SHALL remain unchanged: a `from` (desde) and `to` (hasta) date, each as a `YYYY-MM-DD` string, either of which may be empty.

#### Scenario: Filter by date from

- **WHEN** user selects a range start ("desde") of 2026-05-01 and no end
- **THEN** only programs with event date >= 2026-05-01 are shown

#### Scenario: Filter by date to

- **WHEN** user selects a range end ("hasta") of 2026-05-31 and no start
- **THEN** only programs with event date <= 2026-05-31 are shown

#### Scenario: Filter by date range

- **WHEN** user selects a range from 2026-05-01 to 2026-05-31 in the range picker
- **THEN** only programs with event date in May 2026 are shown

#### Scenario: Clear the date range

- **WHEN** user clears the range selection
- **THEN** the date range filter is removed and programs of all dates are shown

#### Scenario: Timezone-safe range

- **WHEN** the browser timezone is UTC-4 and the user selects a range
- **THEN** the selected start and end days are sent to the filter without an off-by-one day shift
