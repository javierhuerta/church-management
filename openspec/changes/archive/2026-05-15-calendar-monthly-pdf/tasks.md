## 1. Component Structure

- [x] 1.1 Reuse ChurchLogoPlaceholder from worship-services/components
- [x] 1.2 Study CalendarGrid.tsx for multi-day band logic
- [x] 1.3 Study CalendarGrid.tsx for week/day building logic

## 2. CalendarPdfDocument Component

- [x] 2.1 Create calendar-pdf-document.tsx in features/calendar/components
- [x] 2.2 Implement header with church name, month/year, filter summary
- [x] 2.3 Implement weekday headers row (Dom, Lun, Mar, Mié, Jue, Vie, Sáb)
- [x] 2.4 Implement day cells with events rendering
- [x] 2.5 Implement multi-day event bands spanning columns
- [x] 2.6 Implement event truncation to 2-3 per day with "+N más"
- [x] 2.7 Implement draft event dashed styling
- [x] 2.8 Add second page with complete event listing

## 3. useCalendarPdf Hook

- [x] 3.1 Create use-calendar-pdf.ts in features/calendar/hooks
- [x] 3.2 Implement PDF generation with @react-pdf/renderer
- [x] 3.3 Pass currentMonth, events, and filters to PDF
- [x] 3.4 Implement download trigger with filename

## 4. CalendarPage Integration

- [x] 4.1 Add "Download PDF" button in CalendarPage header
- [x] 4.2 Connect button to useCalendarPdf hook
- [x] 4.3 Pass current filters to hook
- [x] 4.4 Show loading state during PDF generation

## 5. Styling & Polish

- [x] 5.1 Match CalendarGrid visual styling (colors, fonts, spacing)
- [x] 5.2 Use same WEEKDAYS array from CalendarGrid
- [x] 5.3 Test PDF on different month views (varying event density)
- [x] 5.4 Verify multi-day bands render correctly
