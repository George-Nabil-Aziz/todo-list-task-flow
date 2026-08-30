# add-username — plan overview

Entry point for the **add-username** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 04 | [04-story-username-login-support.md](04-story-username-login-support.md) | Username Display Name | — | [add-user-authentication Story 02](../add-user-authentication/02-story-user-login-and-registration.md) |

## Dependency notes

Story 04 adds a display-only `username` field to the user store and auth routes from Story 02, and shows it in the task dashboard. It does not change the login mechanism (still email + password) and does not touch task priority/store logic from Story 03.
