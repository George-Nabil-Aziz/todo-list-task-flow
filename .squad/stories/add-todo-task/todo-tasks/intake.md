# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/add-todo-task/todo-tasks/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):**
- **Feature slug (folder under `plans/`):** `add-todo-task`

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
ToDo Tasks
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
Basic ToDo task management feature.

- The user can create a new task.
- The user can view the list of tasks.
- The user can edit an existing task.
- The user can delete a task.
- The user can mark a task as completed.
- The user can mark a completed task as pending.
- Each task should have a title and a status.
- A task title is required and cannot be empty or whitespace only.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
1. The user can add a task with a valid title.
2. A newly created task appears in the task list.
3. The user cannot create a task with an empty or whitespace-only title.
4. The user can view all existing tasks.
5. The user can edit the title of an existing task.
6. The user can delete an existing task.
7. The user can mark a pending task as completed.
8. The user can mark a completed task as pending.
9. The task status is clearly distinguishable between pending and completed.
10. Deleting a task removes it from the task list.
```

---

## Attachments

Place files in `attachments/` next to this `intake.md`, then list them here so the planner knows what to open.

| File (relative to this folder) | What it is |
| ------------------------------ | ---------- |
| *(e.g. `attachments/flow.png`)* | *(e.g. UX flow)* |

*(Add rows per file. If none, write "None.")*

---

## Dependencies

- **Blocked by / related ids:** (tracker ids only; optional short note)
- **Depends on code areas or other stories:**

## Extra notes (optional)

- Anything not captured above (e.g. chat context) — keep short.

## Technical hints (optional)

- APIs, screens, services already discussed. Repos/roots: `.`. Primary language: `JavaScript`.
- Tech stack: React frontend, Node.js backend.

## Out of scope

- What this story explicitly does **not** cover:
  - Authentication / user accounts / guest users.
  - Task priorities, categories, or due dates.
  - Search, filters, or notifications.
  - Any other advanced features beyond basic CRUD + complete/pending toggling.
