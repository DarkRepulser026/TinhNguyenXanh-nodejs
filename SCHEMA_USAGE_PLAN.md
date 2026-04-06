# Schema Usage Plan

## Audit Summary

The project already uses most schemas through the controller layer and seed scripts. After checking schema definitions, `utils/models.js`, controllers, routes, and scripts, these models are the only ones that appear unused or underused in runtime code.

## Findings

### Removed unused models

- `EventTask`
- `EventTaskAssignment`
- `Notification`
- `VolunteerSkill`

These models were removed from `schemas/` and from `utils/models.js`.

### Underused in runtime code

- `VolunteerEvaluation` - currently read once in `controllers/organizerController.js`, but there is no full create/update/list workflow yet.

## Recommended Adoption Plan

### 1. Add notifications first

Use `Notification` as the shared event layer for the app.

- Add notification CRUD routes.
- Create notifications when an event is approved, a registration changes, a donation completes, or moderation actions happen.
- Surface unread notifications in the header UI.

Why first: it connects multiple existing flows without needing a large domain redesign.

### 2. Wire volunteer skills into profiles and matching

Use `VolunteerSkill` to make volunteer profiles more useful.

- Add skill management endpoints to volunteer controllers.
- Show skills in the volunteer profile page.
- Let organizers filter or recommend volunteers by skill.

Why second: it improves organizer workflows and creates better data for future task assignment.

### 3. Build event task management

Use `EventTask` and `EventTaskAssignment` for organizer operations.

- Add organizer endpoints for task creation, assignment, and completion tracking.
- Tie tasks to existing events and volunteer registrations.
- Show task progress in organizer dashboards.

Why third: it extends the event/volunteer flow already present in the project and gives the unused task schemas a direct purpose.

### 4. Complete volunteer evaluation workflows

Expand `VolunteerEvaluation` beyond the current lookup.

- Add create/update/list endpoints for organizer evaluations.
- Show evaluation history in the volunteer profile.
- Use evaluations as a reputation signal for future assignments.

Why last: the schema is already partially used, so this becomes a follow-on feature once notifications and task/skill data exist.

## Suggested Implementation Order

1. Notifications
2. Volunteer skills
3. Event tasks and assignments
4. Volunteer evaluation workflow

## Notes

- `utils/models.js` already exposes all schemas through a single model registry, so no additional model loading pattern is needed.
- The current codebase favors thin routes and controller-driven logic, so these features should be added in controllers first and then surfaced through routes and UI pages.
- `scripts/db-seed.js` now populates all runtime-used models, including `Donation`, `EventFavorite`, `EventReport`, and `VolunteerEvaluation`.