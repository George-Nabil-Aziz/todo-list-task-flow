# dark-mode — plan overview

Entry point for the **dark-mode** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 07 | [07-story-add-dark-mode.md](07-story-add-dark-mode.md) | Add Dark Mode | — | Story 06 (`improve-todo-ui`, implemented; extends its token system, adds no new behavior) |

## Dependency notes

Story 07 is a pure visual/structural addition (CSS dark token set + a small theme hook/toggle component) on top of the token system and components `improve-todo-ui` (Stories 05–06) already built. It does not require any further backend or behavioral changes from Stories 01–06 — it only depends on their code already existing in `client/`. It deliberately does not add a `ThemeProvider`/React Context, since `App.jsx`, `LoginPage.jsx`, and `RegisterPage.jsx` are exercised by tests that render them standalone with no provider wrapper (see Story 07 "Implementation approach").

Before implementation began, the user reviewed the initial dark palette and asked for a stronger design bar: a premium, layered dark theme (Linear/Raycast/Vercel-style) rather than a naive light-to-dark value inversion. Story 07 was revised in place (not superseded by a new story, unlike `improve-todo-ui`'s Story 05→06 amendment, since nothing had been implemented yet) to add its own from-scratch dark palette, a fourth "surface-hover" depth layer, dark-specific shadow/elevation values, and a small set of dark-only hover/focus/badge/alert refinement rules — see Story 07's "Design Bar — Premium, Layered Dark Mode" section.
