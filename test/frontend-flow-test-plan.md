# Frontend Flow Test Design With Responsible APIs

## 1) Purpose
This document defines end-to-end frontend flow tests and the backend APIs responsible for each flow.

## 2) Assumptions
- API base path: `/api/v1`
- Frontend uses cookie-based auth (`withCredentials = true`)
- Test data exists from `npm run db:seed`
- Roles available: `Volunteer`, `Organizer`, `Admin`

## 3) Test Data Setup
- 1 active volunteer account
- 1 organizer account with an organization
- 1 admin account
- At least 1 published event and 1 organization
- At least 1 pending event for admin approval scenario

## 4) Flow Matrix

| Flow ID | User Role | Frontend Route/Page | Scenario | Responsible APIs |
|---|---|---|---|---|
| F001 | Guest | `/` -> `/events` | Browse events list with keyword/category filters | `GET /events`, `GET /categories` |
| F002 | Guest | `/events/:id` | View event details, comments, ratings | `GET /events/:id`, `GET /events/:eventId/comments`, `GET /events/:eventId/ratings` |
| F003 | Guest | `/register`, `/login` | Register then login and session established | `POST /register`, `POST /login`, `GET /profile` |
| F004 | Any logged-in | Header/profile area | Logout and protected pages become unauthorized | `POST /logout`, then protected API returns `401` |
| F005 | Logged-in | `/events/:id` | Post comment on event | `POST /events/:eventId/comments`, `GET /events/:eventId/comments` |
| F006 | Logged-in | `/events/:id` | Rate/review event and verify update behavior | `POST /events/:eventId/ratings`, `GET /events/:eventId/ratings` |
| F007 | Volunteer | `/events/:id` or `/events/register` | Register for event | `POST /events/:id/register` |
| F008 | Volunteer | Event card/detail actions | Toggle favorite on event | `POST /events/:id/favorite` |
| F009 | Volunteer | `/volunteer/favorites` | View and remove favorites | `GET /volunteers/:userId/favorites`, `DELETE /volunteers/:userId/favorites/:eventId` |
| F010 | Volunteer | `/volunteer/registrations` | View and cancel registrations | `GET /volunteers/:userId/registrations`, `DELETE /volunteers/:userId/registrations/:registrationId` |
| F011 | Volunteer | `/volunteer/profile`, `/account/settings` | View/update profile and avatar | `GET /volunteers/:userId/profile`, `PUT /volunteers/:userId/profile`, `POST /volunteers/:userId/avatar` |
| F012 | Volunteer | `/donate`, `/payment-result`, `/volunteer/donations` | Create donation payment and verify status/history | `POST /payments/momo/create`, `GET /payments/:transactionCode`, `GET /volunteers/:userId/donations` |
| F013 | Guest/User | `/organizations`, `/organizations/:id` | Browse organizations and reviews | `GET /organizations`, `GET /organizations/:id`, `GET /organizations/:id/reviews` |
| F014 | Logged-in | `/organizations/:id` | Submit organization review | `POST /organizations/:id/reviews`, `GET /organizations/:id/reviews` |
| F015 | Logged-in | Event details moderation action | Report event | `POST /events/:id/reports` |
| F016 | Logged-in | `/organizations/register` | Register a new organization | `POST /organizations/register` |
| F017 | Organizer | `/organizer/overview` | Organizer dashboard loads | `GET /organizer/dashboard` |
| F018 | Organizer | `/organizer/organization` | View/update organization profile and claim org | `GET /organizer/profile`, `PUT /organizer/profile`, `POST /organizer/claim` |
| F019 | Organizer | `/organizer/events` | List/create/update/hide/unhide organizer events | `GET /organizer/events`, `POST /organizer/events`, `PUT /organizer/events/:id`, `PATCH /organizer/events/:id/hide`, `PATCH /organizer/events/:id/unhide` |
| F020 | Organizer | `/organizer/volunteers`, `/organizer/registrations/:id` | Manage registration status and evaluation | `GET /organizer/volunteers`, `GET /organizer/registrations/:id`, `PATCH /organizer/registrations/:id/status`, `GET /organizer/registrations/:id/evaluation`, `POST /organizer/registrations/:id/evaluation` |
| F021 | Organizer | `/organizer/volunteers/:id/history` and members panel | Check volunteer history and members list | `GET /organizer/volunteers/:id/history`, `GET /organizer/members` |
| F022 | Admin | `/admin` | Admin overview dashboard metrics | `GET /admin/dashboard` |
| F023 | Admin | `/admin/approvals` | Approve/reject pending events | `GET /admin/events/approvals`, `PATCH /admin/events/:id/status` |
| F024 | Admin | `/admin/users` | Manage users status and role | `GET /admin/users`, `PATCH /admin/users/:id/status`, `PATCH /admin/users/:id/role` |
| F025 | Admin | `/admin/categories` | Category CRUD from UI | `GET /admin/categories`, `POST /admin/categories`, `PATCH /admin/categories/:id`, `DELETE /admin/categories/:id` |
| F026 | Admin | `/admin/moderation` | View moderation summary and queue | `GET /admin/moderation` |
| F027 | Guest | `/contact` | Submit contact form | `POST /contact` |

## 5) Detailed Test Cases

### F001 Browse Events
- Preconditions: Seeded events and categories exist.
- Steps:
  1. Open `/events`.
  2. Apply keyword filter.
  3. Apply category filter.
- Expected:
  - List updates correctly.
  - Empty state shown when no match.
- API checks:
  - `GET /events` returns `200` with paged list.
  - `GET /categories` returns `200` list.

### F003 Register and Login
- Preconditions: Email not used before.
- Steps:
  1. Register at `/register`.
  2. Login at `/login`.
  3. Refresh page and navigate to protected route.
- Expected:
  - User remains authenticated.
  - Correct role-based route access.
- API checks:
  - `POST /register` returns `201` and sets auth cookie.
  - `POST /login` returns `200` and sets auth cookie.
  - `GET /profile` returns `200` with current user.

### F007 Event Registration
- Preconditions: Logged in as volunteer, event open for registration.
- Steps:
  1. Open event detail.
  2. Submit registration form.
  3. Open `/volunteer/registrations`.
- Expected:
  - Success message shown.
  - New registration appears in list.
- API checks:
  - `POST /events/:id/register` returns `201`.
  - `GET /volunteers/:userId/registrations` returns item.

### F012 Donation Flow
- Preconditions: Logged in volunteer.
- Steps:
  1. Open `/donate`.
  2. Submit donation to create transaction.
  3. Open `/payment-result?transactionCode=...`.
  4. Open `/volunteer/donations`.
- Expected:
  - Payment request created.
  - Payment result reflects current status.
  - Donation history shows transaction.
- API checks:
  - `POST /payments/momo/create` returns `201`.
  - `GET /payments/:transactionCode` returns `200`.
  - `GET /volunteers/:userId/donations` returns `200` list.

### F019 Organizer Event Management
- Preconditions: Logged in organizer with organization.
- Steps:
  1. Open `/organizer/events`.
  2. Create event.
  3. Edit event.
  4. Hide and unhide event.
- Expected:
  - Event list reflects each action.
  - Hidden state toggles correctly.
- API checks:
  - `GET /organizer/events` returns `200`.
  - `POST /organizer/events` returns `201`.
  - `PUT /organizer/events/:id` returns `200`.
  - `PATCH /organizer/events/:id/hide` returns `200`.
  - `PATCH /organizer/events/:id/unhide` returns `200`.

### F023 Admin Approval Queue
- Preconditions: At least one pending event exists.
- Steps:
  1. Open `/admin/approvals`.
  2. Approve one event.
  3. Reject another event.
- Expected:
  - Row statuses update without stale data.
  - Counts/filters remain consistent after action.
- API checks:
  - `GET /admin/events/approvals` returns `200`.
  - `PATCH /admin/events/:id/status` returns `200` for both actions.

## 6) Negative and Security Cases
- Unauthorized access to protected volunteer route:
  - Open `/volunteer/dashboard` when logged out.
  - Expect redirect/login prompt.
  - API returns `401` and frontend interceptor triggers `api-unauthorized`.
- Role violation:
  - Login as volunteer and open `/admin/users`.
  - Expect forbidden UI handling.
  - API `GET /admin/users` returns `403`.
- Ownership violation:
  - Try `GET /volunteers/:otherUserId/profile` as non-admin.
  - Expect `403` and no sensitive data rendered.
- Validation error:
  - Submit `/contact` with missing fields.
  - API `POST /contact` returns `400`; frontend shows error message.

## 7) API-to-UI Assertions Checklist
- Every mutating action (POST/PUT/PATCH/DELETE) must re-fetch or update local cache.
- Toast/error messages map to API response message when available.
- Empty states are shown for zero-length API arrays.
- Loading indicators are visible during network requests.
- Role-based navigation hides inaccessible pages and handles direct URL access safely.

## 8) Suggested Automation Split
- Smoke (run on every PR): F001, F003, F007, F019, F023, F027
- Daily regression: F001-F016
- Full weekly regression: F001-F027 including negative/security cases
