# add-user-authentication — plan overview

Entry point for the **add-user-authentication** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 02 | [02-story-user-login-and-registration.md](02-story-user-login-and-registration.md) | User Login and Registration | — | [add-todo-task Story 01](../add-todo-task/01-story-todo-tasks.md) |

## Dependency notes

Story 02 adds JWT + bcrypt authentication on top of the app scaffolded by `add-todo-task` Story 01, and changes the existing task store/routes to scope tasks per-user. It must run after Story 01 and modifies files Story 01 created (`server/src/taskStore.js`, `server/src/routes/tasks.js`, `server/src/app.js`, `client/src/App.jsx`, `client/src/api/tasksApi.js`, `client/src/main.jsx`) rather than only adding new ones.
