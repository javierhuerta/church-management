## 1. Component Structure

- [ ] 1.1 Reuse ChurchLogoPlaceholder from worship-services/components
- [ ] 1.2 Study CalendarGrid.tsx for multi-day band logic
- [ ] 1.3 Study CalendarGrid.tsx for week/day building logic

## 2. CalendarPdfDocument Component

- [ ] 2.1 Create calendar-pdf-document.tsx in features/calendar/components
- [ ] 2.2 Implement header with church name, month/year, filter summary
- [ ] 2.3 Implement weekday headers row (Dom, Lun, Mar, Mié, Jue, Vie, Sáb)
- [ ] 2.4 Implement day cells with events rendering
- [ ] 2.5 Implement multi-day event bands spanning columns
- [ ] 2.6 Implement event truncation to 2-3 per day with "+N más"
- [ ] 2.7 Implement draft event dashed styling
- [ ] 2.8 Add second page with complete event listing

## 3. useCalendarPdf Hook

- [ ] 3.1 Create use-calendar-pdf.ts in features/calendar/hooks
- [ ] 3.2 Implement PDF generation with @react-pdf/renderer
- [ ] 3.3 Pass currentMonth, events, and filters to PDF
- [ ] 3.4 Implement download trigger with filename

## 4. CalendarPage Integration

- [ ] 4.1 Add "Download PDF" button in CalendarPage header
- [ ] 4.2 Connect button to useCalendarPdf hook
- [ ] 4.3 Pass current filters to hook
- [ ] 4.4 Show loading state during PDF generation

## 5. Styling & Polish

- [ ] 5.1 Match CalendarGrid visual styling (colors, fonts, spacing)
- [ ] 5.2 Use same WEEKDAYS array from CalendarGrid
- [ ] 5.3 Test PDF on different month views (varying event density)
- [ ] 5.4 Verify multi-day bands render correctly