# improve-todo-ui — plan overview

Entry point for the **improve-todo-ui** feature. Stories execute in order by their `NN` prefix.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 05 | [05-story-improve-todo-ui.md](05-story-improve-todo-ui.md) | Improve Todo UI/UX | — | Stories 01–04 (already implemented; restyle only) |
| 06 | [06-story-visual-redesign.md](06-story-visual-redesign.md) | Visual redesign (SaaS-grade) | — | Story 05 (implemented; this story upgrades its visual output, not its behavior) |

## Dependency notes

Story 05 is a pure visual/structural (JSX markup + CSS) restyle of the screens and components built by `add-todo-task` (01), `add-user-authentication` (02), `add-task-priorities` (03), and `add-username` (04). It does not require any further backend or behavioral changes from those stories — it only depends on their code already existing in `client/`.

Story 06 was added after the user reviewed Story 05's result and found it too conservative for the "modern, polished, professional SaaS" bar they wanted. Story 06 keeps Story 05's structural conventions (semantic header/controls grouping, `.btn`/`.alert`/`.field`/`.auth-*` class names) but replaces its flat single-hue token set and minimal iconography with a richer color/gradient system, a hand-rolled inline-SVG icon set, elevated motion-enabled cards, a skeleton loading state, an illustrated empty state, and a split-panel auth layout — all under the same zero-new-dependency, zero-behavior-change, full-existing-test-suite-passes constraints as Story 05.
