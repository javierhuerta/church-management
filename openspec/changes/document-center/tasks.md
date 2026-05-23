## 1. Backend - Period Entity

- [x] 1.1 Create `Period` entity in `backend/src/modules/document-center/` with fields: id (UUID), year, month, periodNumber, startDate, endDate, pastorId (relation to User), notes
- [x] 1.2 Create TypeORM migration for `periods` table
- [x] 1.3 Add indexes on year and (year, month) for fast lookups

## 2. Backend - ElderShift Entity

- [x] 2.1 Create `ElderShift` entity with fields: id (UUID), periodId (relation to Period), elderId (relation to User), weekStart, weekEnd
- [x] 2.2 Create TypeORM migration for `elder_shifts` table
- [x] 2.3 Add index on periodId

## 3. Backend - Add periodId to ChurchDocument

- [x] 3.1 Add `periodId` column (nullable, FK) to `ChurchDocument` entity
- [x] 3.2 Create migration to add column (backwards compatible - nullable)
- [x] 3.3 Update `DocumentCategory` enum with order: CHURCH_MINUTES, DEPARTMENT_PLAN, TREASURY_REPORT, MISSION_REPORT

## 4. Backend - DocumentCenter Service Updates

- [x] 4.1 Update `DocumentCenterService` to include period info in findByYear results (join with Period)
- [x] 4.2 Update `DocumentCenterService.findOne()` to return period context
- [x] 4.3 Add method `findPeriodByYearMonth(year, month)` to get period with pastor and elder shifts

## 5. Backend - Period Management Endpoints

- [x] 5.1 Create `PeriodController` with endpoints:
  - `POST /periods` - create period with automatic elder rotation
  - `GET /periods/year/:year` - list periods by year
  - `GET /periods/:id` - get period with pastor and elder shifts
  - `PUT /periods/:id` - update period (change pastor)
- [x] 5.2 Add OpenAPI decorators
- [x] 5.3 Add role guard (editor roles only for create/update)

## 6. Backend - Elder Rotation Algorithm

- [x] 6.1 Create `ElderRotationService` with method `calculateRotation(period, elderUserIds, shiftWeeks)`
- [x] 6.2 Algorithm: round-robin assignment of elders to week ranges within period
- [x] 6.3 Store rotation start index in config or as part of period for next allocation
- [x] 6.4 Handle case when period spans across months (multi-month rotation)

## 7. Backend - Update Upload Endpoint

- [x] 7.1 Modify `POST /documents` to accept optional `periodId` in multipart form data
- [x] 7.2 Validate periodId exists if provided
- [x] 7.3 Store periodId in document record

## 8. Frontend - API Client Regeneration

- [x] 8.1 Run `npm run generate:api`
- [x] 8.2 Verify generated types include Period, ElderShift entities
- [x] 8.3 Verify document upload includes periodId parameter

## 9. Frontend - Period Selector Component

- [x] 9.1 Create `PeriodSelector` component (year dropdown + period/month dropdown)
- [x] 9.2 Create `LeadershipContextCard` component showing pastor and elders for selected period
- [x] 9.3 Style with `church-ui-design` skill patterns

## 10. Frontend - Document Center Page Updates

- [x] 10.1 Update `DocumentCenterPage` to include period selector at top
- [x] 10.2 Show `LeadershipContextCard` when a period is selected
- [x] 10.3 Filter documents by selected period
- [x] 10.4 Add "Create Period" button for editor roles
- [x] 10.5 Update upload dialog to include period selector

## 11. Frontend - Create Period Dialog

- [x] 11.1 Create `CreatePeriodDialog` component
- [x] 11.2 Fields: year, month, pastor (dropdown from users with Pastor role), shift duration in weeks
- [x] 11.3 Preview of elder rotation (show which elders are assigned to which weeks)
- [x] 11.4 Submit creates period and elder shifts via API

## 12. Integration and Testing

- [ ] 12.1 Create test period for current month
- [ ] 12.2 Verify elder rotation calculation (10 elders, 2-week shifts = 5 shifts)
- [ ] 12.3 Test document upload with period association
- [ ] 12.4 Test document list showing leadership context
- [ ] 12.5 Test viewer role can see leadership info but not create periods
- [ ] 12.6 Test with documents from multiple periods to verify filtering