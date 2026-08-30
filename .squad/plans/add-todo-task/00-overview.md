# add-todo-task — plan overview

Entry point for the **add-todo-task** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 01 | [01-story-todo-tasks.md](01-story-todo-tasks.md) | ToDo Tasks | — | None |

## Dependency notes

Story 01 scaffolds the entire app (React client + Node/Express server) from an empty repo — there is no existing code to build on. Tasks are stored in-memory on the server (no persistence layer); a future story would need to add real persistence before any story depending on data surviving a restart.
