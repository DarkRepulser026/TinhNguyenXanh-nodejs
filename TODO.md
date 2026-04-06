# TODO: Implement Report Event Button

## Plan approved - Breakdown into steps:

✅ **Step 1: Create TODO.md** (current)

✅ **Step 2: Created public/lib/moderation.ts with reportEvent service**

✅ **Step 2.5: Merged moderationService into public/lib/api.ts + deleted moderation.ts**
- Add export const moderationService with reportEvent function

**Step 3: Update EventDetails.tsx**
- Add report button after register button
- Add state for report modal (showModal, reason, details)
- Add modal with reason dropdown + details textarea
- Add handleReportSubmit function

**Step 4: Test**
- npm run dev:frontend
- Login → EventDetails → Test report button → Check API call & DB

**Step 5: attempt_completion**

