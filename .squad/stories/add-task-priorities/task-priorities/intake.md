# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/add-task-priorities/task-priorities/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** Task Priorities
- **Feature slug (folder under `plans/`):** `add-task-priorities`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** `` *(used in filenames and plan tables; fill manually if empty)*
- **Work item type:** ``
- **Status:** ``
- **Assignee:** ``
- **Labels:** ``

External tracker links are **not** followed by the planner. Keep the id for naming and traceability only.

---

## Title

*(Paste the work item title verbatim. Prefilled when `squad new-story` fetched from a tracker.)*

```
Task priorities
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
Add a priority field to tasks so users can indicate how important a
task is, see it at a glance, and sort/filter their task list by it.

- Priority is one of three levels: Low, Medium, High.
- Priority can be set when creating a task and changed when editing
  an existing task.
- Tasks without an explicit priority default to Medium (never
  "unset").
- The task list shows each task's priority visually (e.g. a colored
  badge/label), similar to how pending/completed status is already
  shown.
- The task list can be sorted by priority (e.g. High -> Low) and/or
  filtered to show only tasks of a selected priority level.
- This builds on the existing per-user task store from the
  add-user-authentication feature: priority is just another field on
  the existing task object, still scoped to the owning user.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
- [ ] Creating a task accepts an optional `priority` of `low`,
      `medium`, or `high`; an invalid value is rejected with a clear
      error; an omitted value defaults to `medium`.
- [ ] Editing a task allows changing its priority independently of
      its title/status.
- [ ] Each task in the list displays its priority visually (distinct
      per level, not color alone — include text/label too).
- [ ] The task list can be sorted by priority (High -> Medium -> Low
      or the reverse).
- [ ] The task list can be filtered to show only tasks matching a
      selected priority (or "All").
- [ ] Priority remains scoped to the owning user like the rest of
      the task data (no cross-user leakage).
- [ ] Existing create/edit/delete/status-toggle behavior from prior
      stories continues to work unchanged.
```

---

## Attachments

Place files in `attachments/` next to this `intake.md`, then list them here so the planner knows what to open.

| File (relative to this folder) | What it is |
| ------------------------------ | ---------- |
| *(e.g. `attachments/flow.png`)* | *(e.g. UX flow)* |

None.

---

## Dependencies

- **Blocked by / related ids:** None (tracker type is `none`).
- **Depends on code areas or other stories:** Builds on `add-todo-task` Story 01 (task store/routes/UI) and `add-user-authentication` Story 02 (per-user task scoping, auth-guarded `/api/tasks`) — see `.squad/plans/add-todo-task/01-story-todo-tasks.md` and `.squad/plans/add-user-authentication/02-story-user-login-and-registration.md`.

## Extra notes (optional)

- Priority levels fixed to a 3-value enum (Low/Medium/High) rather than a numeric scale, to mirror the existing `pending`/`completed` status enum pattern already used for tasks.

## Technical hints (optional)

- Repos/roots: `.`. Primary language: `JavaScript`. Existing stack: React (`client/`, Vite) + Node/Express (`server/`), in-memory per-user task store, JWT auth already in place.
- Extend the existing task shape (`{ id, title, status, userId }`) with a `priority` field; extend `server/src/taskStore.js`'s create/update logic and `server/src/routes/tasks.js`'s request handling accordingly.
- Client: extend the task creation/edit UI (`client/src/components/TaskForm.jsx`, `TaskItem.jsx`) with a priority selector, add a priority badge to the task display, and add sort/filter controls to `TaskList.jsx` or `App.jsx`.

## Out of scope

- Custom/user-defined priority levels beyond Low/Medium/High.
- Automatic priority suggestions or due-date-based prioritization.
- Multi-field sorting (priority is the only sortable field for this story).
