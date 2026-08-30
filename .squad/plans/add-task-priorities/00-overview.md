# add-task-priorities — plan overview

Entry point for the **add-task-priorities** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 03 | [03-story-task-priorities.md](03-story-task-priorities.md) | Task Priorities | — | [add-todo-task Story 01](../add-todo-task/01-story-todo-tasks.md), [add-user-authentication Story 02](../add-user-authentication/02-story-user-login-and-registration.md) |

## Dependency notes

Story 03 adds a `priority` field to the existing per-user task store and UI from Stories 01–02. It must run after both: it extends `server/src/taskStore.js`/`routes/tasks.js` (per-user scoping from Story 02) and `client/src/components/TaskForm.jsx`/`TaskItem.jsx`/`TaskList.jsx`/`App.jsx` (task CRUD UI from Story 01).
