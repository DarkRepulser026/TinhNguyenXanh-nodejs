# Used Model Usage Map

This file maps models that are actively used in runtime and seed flows.

## Coverage Scope

- Runtime usage: `controllers/*.js` (through `utils/models.js`)
- Seed usage: `scripts/db-seed.js`
- Removed from project: `EventTask`, `EventTaskAssignment`, `Notification`, `VolunteerSkill`

## Runtime-Used Models

### AppUser

- Primary files:
  - `controllers/authController.js`
  - `controllers/adminController.js`
  - `controllers/eventController.js`
  - `controllers/organizationController.js`
  - `controllers/volunteerController.js`
- Usage patterns:
  - account lookup and registration
  - role and activation management
  - profile updates and identity checks

### Donation

- Primary file:
  - `controllers/paymentController.js`
- Usage patterns:
  - create donation transaction records
  - read by transaction code
  - update payment status on callback

### Event

- Primary files:
  - `controllers/eventController.js`
  - `controllers/organizerController.js`
  - `controllers/adminController.js`
  - `controllers/moderationController.js`
  - `controllers/organizationController.js`
  - `controllers/volunteerController.js`
- Usage patterns:
  - browse and filter events
  - create and manage organizer-owned events
  - admin approval and hide/unhide lifecycle
  - event validation before favorite/comment/rating/report actions

### EventCategory

- Primary files:
  - `controllers/adminController.js`
  - `controllers/eventController.js` (populate/reference via event data)
- Usage patterns:
  - full category CRUD in admin
  - event categorization and category population

### EventComment

- Primary files:
  - `controllers/volunteerController.js`
  - `controllers/moderationController.js`
- Usage patterns:
  - volunteer create and list event comments
  - moderated list of visible comments

### EventFavorite

- Primary files:
  - `controllers/eventController.js`
  - `controllers/volunteerController.js`
- Usage patterns:
  - toggle favorite status for event and volunteer pair
  - list and remove favorites for volunteer profile/dashboard

### EventRating

- Primary files:
  - `controllers/volunteerController.js`
- Usage patterns:
  - create event ratings
  - list event ratings and user-specific checks

### EventRegistration

- Primary files:
  - `controllers/eventController.js`
  - `controllers/organizerController.js`
  - `controllers/volunteerController.js`
  - `controllers/adminController.js`
- Usage patterns:
  - register volunteer for events
  - capacity checks and registration counts
  - organizer confirmation/rejection flow
  - volunteer registration history and cancellation

### EventReport

- Primary files:
  - `controllers/moderationController.js`
  - `controllers/adminController.js`
- Usage patterns:
  - create event abuse/issue reports
  - admin moderation queue retrieval

### Organization

- Primary files:
  - `controllers/organizationController.js`
  - `controllers/organizerController.js`
  - `controllers/moderationController.js`
  - `controllers/adminController.js`
- Usage patterns:
  - create and list organizations
  - organizer ownership and profile management
  - fetch organization context for events and reviews

### OrganizationMember

- Primary file:
  - `controllers/organizationController.js`
- Usage patterns:
  - create/update owner membership when organization is created

### OrganizationReview

- Primary files:
  - `controllers/moderationController.js`
- Usage patterns:
  - create or update user review draft/pending review
  - list approved organization reviews

### Volunteer

- Primary files:
  - `controllers/authController.js`
  - `controllers/eventController.js`
  - `controllers/volunteerController.js`
  - `controllers/adminController.js`
- Usage patterns:
  - ensure volunteer profile exists for user
  - profile creation and updates
  - joins with registrations/favorites for volunteer dashboard metrics

### VolunteerEvaluation (underused but runtime-used)

- Primary file:
  - `controllers/organizerController.js`
- Usage patterns:
  - read evaluation by registration id in volunteer detail flow
- Gap:
  - no create/update/list workflow yet

## Seed-Used Models

From `scripts/db-seed.js`, these models are populated during local data bootstrap:

- `AppUser`
- `EventCategory`
- `Volunteer`
- `Organization`
- `OrganizationMember`
- `Event`
- `EventRegistration`
- `EventRating`
- `EventComment`
- `OrganizationReview`

## Notes

- Model registration is centralized in `utils/models.js` and resolved from `mongoose.models` lazily.
- This map complements `SCHEMA_USAGE_PLAN.md` by focusing only on models already in active use.