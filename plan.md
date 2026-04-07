Implementation plan to close the schema-to-frontend gaps and make all pieces work together consistently

Current blockers I validated
1. Missing save endpoint for volunteer evaluation:
- Frontend calls save at api.ts
- Backend only has GET evaluation in organizer.js and read logic in organizerController.js

2. Admin moderation does not render report queue:
- Queue is returned by backend in adminController.js
- Page only shows summary cards in AdminModeration.tsx

3. Organization review UI is split between active and inactive pages:
- Active routed page is OrganizationDetails.tsx from App.tsx
- Review form/list logic exists in a different file OrganizationDetails.tsx

4. OrganizationMember is written but not surfaced:
- Created/updated at registration in organizationController.js
- No frontend page currently reads members.

Recommended architecture direction
- Keep a single source of truth page for organization details: OrganizationDetails.tsx
- Expose explicit API contracts for missing resources instead of overloading organization details payload.
- Reuse existing role guards and route style used in organizer.js and admin.js.

Phase 1: Fix VolunteerEvaluation end-to-end
Backend
1. Add controller method saveRegistrationEvaluation in organizerController.js
- Validate registration ownership and status Confirmed
- Upsert VolunteerEvaluation by registrationId
- Return normalized item shape matching current UI fields

2. Add route in organizer.js
- POST /organizer/registrations/:id/evaluation
- Keep auth and role middleware aligned with existing organizer routes

Frontend
1. Point save API call to the new endpoint in api.ts
- Use same path naming as backend method for consistency

2. Keep page logic in OrganizerVolunteerDetails.tsx
- On save success: refresh evaluation with GET for canonical server state
- Keep existing pending/confirmed validation in UI, but rely on backend as authority

Acceptance criteria
- Organizer can create evaluation for confirmed registration
- Subsequent save updates same record (not duplicates)
- Refresh page shows persisted evaluation

Phase 2: Surface EventReport queue in Admin moderation page
Backend
1. Keep current summary endpoint in adminController.js
2. Normalize queue item response fields for UI display:
- id, eventId, reporterUserId, reason, details, status, createdAt

Frontend
1. Extend AdminModeration.tsx
- Add queue table/card list below summary cards
- Show empty state when queue length is zero
- Add createdAt formatting and status badge

Acceptance criteria
- Admin sees queue item count matching response length
- Each report row renders reason, details, createdAt, status
- No runtime errors when queue is empty

Phase 3: Unify and enable OrganizationReview in active org details page
Backend
1. Keep review endpoints in moderation.js
2. Optionally map response fields for frontend friendliness:
- Ensure review includes user display name if possible
- Keep moderation status semantics clear (only Approved returned on list)

Frontend
1. Migrate review form/list functionality from OrganizationDetails.tsx into OrganizationDetails.tsx
2. Use typed API service in api.ts instead of raw axios in page
3. Remove or archive unused duplicate page to avoid future drift

Acceptance criteria
- Users can submit review from active org details route
- Approved reviews render on same page
- Average and review count remain consistent with backend

Phase 4: Surface OrganizationMember to frontend
Backend
1. Add organizer endpoint:
- GET /organizer/members in organizer.js
- Query OrganizationMember.js through models in models.js
- Optionally populate user names from AppUser

Frontend
1. Add section or tab in OrganizerOrganizationManagementPage.tsx
- List owner and members, role, status, joinedAt
- Add empty state and loading/error handling

Acceptance criteria
- Organizer can see owner and current members
- Member list reflects registration-created owner member record

Cross-cutting compatibility checks (important)
1. API service string interpolation bugs in api.ts
- Some endpoints use single-quoted template-like strings and will not interpolate id:
- updateUserStatus at line 146
- updateUserRole at line 147
- deleteCategory at line 151
- Fix these while implementing to avoid hidden failures in admin flows.

2. Standardize response envelopes
- Prefer returning objects with named keys like item/items/totalCount
- Avoid mixing plain arrays and objects for similar resources

3. Error contract consistency
- Continue using getApiErrorMessage pattern in frontend pages for all new calls

Verification plan
1. API smoke checks
- POST and GET evaluation for one confirmed registration
- GET admin moderation and assert queue shown
- GET and POST organization reviews from active details page
- GET organizer members list

2. UI route checks
- App.tsx routes navigate to updated pages only
- No dangling imports to deprecated organization details file

3. Regression checks
- Organizer registration flow still creates owner member row
- Event details comments/ratings unaffected
- Admin users/categories actions still call correct interpolated URLs

Suggested implementation order
1. VolunteerEvaluation save route and page integration
2. Admin moderation queue rendering
3. Organization review migration to active page
4. Organization members listing
5. Cross-cutting API string interpolation fixes
6. Final smoke test

Progress updates
- Phase 1 status: Completed (April 7, 2026)
- Completed backend:
	- Added `saveRegistrationEvaluation` in `controllers/organizerController.js`.
	- Added validation for organizer ownership, confirmed registration status, and rating range (1-5).
	- Implemented upsert on `VolunteerEvaluation` by `registrationId` to avoid duplicate records.
	- Added `POST /organizer/registrations/:id/evaluation` in `routes/organizer.js`.
- Completed frontend:
	- Updated `organizerService.saveRegistrationEvaluation` endpoint to `/organizer/registrations/:id/evaluation` in `public/lib/api.ts`.
	- Updated `OrganizerVolunteerDetails.tsx` to reload evaluation with GET after save for canonical state.
- Acceptance check against Phase 1:
	- Organizer can create/update evaluation for confirmed registrations via one endpoint.
	- Upsert ensures no duplicate evaluation per registration.
	- UI refreshes from server state after save.
- Next phase: Phase 2 (Admin moderation queue rendering).

- Phase 2 status: Completed (April 7, 2026)
- Completed frontend:
	- Extended `public/pages/admin/AdminModeration.tsx` to render moderation `queue` items.
	- Added queue count badge, table layout, and empty-state message when there are no reports.
	- Added status badge mapping and created-at date formatting for readable moderation output.
	- Rendered report fields aligned with backend response: `id`, `reason`, `details`, `eventId`, `reporterUserId`, `status`, `createdAt`.
- Backend note:
	- Existing `getModerationSummary` in `controllers/adminController.js` already returned queue payload; no API change required in this phase.
- Acceptance check against Phase 2:
	- Admin can now see moderation queue entries directly in UI.
	- Queue length badge matches rendered item count.
	- Empty queue is handled without runtime errors.
- Next phase: Phase 3 (Organization review migration to active organization details page).

- Phase 3 status: Completed (April 7, 2026)
- Completed frontend:
	- Added typed organization-review contracts and endpoints in `public/lib/api.ts`:
		- `moderationService.getOrganizationReviews(organizationId)`
		- `moderationService.createOrganizationReview(organizationId, payload)`
	- Migrated organization review list + submit form into active routed page `public/pages/organizations/OrganizationDetails.tsx`.
	- Added authenticated submit workflow (rating/title/content), user feedback messages, loading/error states, and post-submit refresh.
	- Kept existing event-review display section and added dedicated organization-review section (approved reviews).
	- Removed deprecated duplicate page/files to avoid drift:
		- `public/pages/OrganizationDetails.tsx` (deleted)
		- `public/pages/OrganizationDetails.css` (deleted)
- Backend note:
	- Existing moderation routes/controllers already support `GET/POST /organizations/:id/reviews`; no backend change was required in this phase.
- Acceptance check against Phase 3:
	- Users can submit organization reviews from active `/organizations/:id` page.
	- Approved organization reviews are rendered on the same active page.
	- Duplicate inactive page removed; UI path is now single-source.
- Next phase: Phase 4 (Organization member listing for organizer).

- Phase 4 status: Completed (April 7, 2026)
- Completed backend:
	- Added organizer member listing handler `getMembers` in `controllers/organizerController.js`.
	- Added `GET /organizer/members` route in `routes/organizer.js` with Organizer/Admin role checks.
	- Member response now exposes: `id`, `organizationId`, `userId`, `fullName`, `email`, `phone`, `role`, `status`, `joinedAt`.
- Completed frontend:
	- Added `OrganizationMemberItem` type and `organizerService.getMembers()` in `public/lib/api.ts`.
	- Integrated member loading into `public/pages/organizer/OrganizerOrganizationManagement.tsx`.
	- Added a new “Thành viên tổ chức” panel with total count, refresh action, loading/error/empty states, and member table display.
- Acceptance check against Phase 4:
	- Organizer can view owner/member rows from `OrganizationMember` model in UI.
	- Member list reflects registration-created owner member record when present.
	- Frontend and backend contracts are aligned for organization member listing.
- Next phase: Phase 5 (cross-cutting API interpolation fixes).

- Phase 5 status: Completed (April 7, 2026)
- Completed frontend:
	- Fixed template-string interpolation bugs in `public/lib/api.ts` for admin endpoints:
		- `updateUserStatus(id, isActive)` now calls `/admin/users/${id}/status` correctly.
		- `updateUserRole(id, role)` now calls `/admin/users/${id}/role` correctly.
		- `deleteCategory(id)` now calls `/admin/categories/${id}` correctly.
- Acceptance check against Phase 5:
	- Admin user status/role updates and category deletion now target concrete IDs instead of literal `${id}` paths.
	- File-level validation completed with no TypeScript errors.
- Next phase: Phase 6 (final smoke test and verification sweep).

- Phase 6 status: Completed (April 7, 2026)
- Completed seed/runtime alignment:
	- Updated `scripts/db-seed.js` to match current schema/UI expectations:
		- Organizations now seed `avatarUrl` and `focusAreas` (instead of legacy `logo/headerImage`).
		- Seeded organization reviews now include `title` and `status: 'Approved'` so they are visible in active review flows.
		- Seeded donations now include `userId` linkage for volunteer donation-history pages.
	- Executed `npm run db:seed` successfully after updates.
- Completed verification updates:
	- Updated `scripts/smoke-test.js` to align with current API contracts:
		- `/api/v1/organizer/profile` (replaced outdated `/organizer/organization`).
		- `/api/v1/profile` (replaced outdated `/auth/me`).
		- `GET /api/v1/events/:id/comments` expectation corrected to `200` for empty list behavior.
	- Expanded smoke coverage to test end-to-end public and protected route surface:
		- Dynamic seeded IDs for event/org detail paths and review/comment/rating endpoints.
		- New protected routes from implemented phases (`/organizer/members`, organizer evaluation endpoints, admin PATCH/DELETE routes).
		- Method/body checks for PATCH/POST/DELETE auth-gated flows.
		- Added route-signature coverage guard that parses `routes/*.js` and fails smoke if any API route is not represented by a smoke case.
	- Executed `npm run smoke:test` successfully with all checks passing.
	- Frontend production build had already passed earlier (`npm run build:frontend`).
- Acceptance check against Phase 6:
	- End-to-end route/API/front-end wiring for Phases 1-5 is validated by build + smoke suite.
	- Seed data now exercises newly surfaced models/features in UI.

Overall status: All planned phases (1-6) are completed.
