# Story 06 — Visual redesign (SaaS-grade), supersedes Story 05's execution

## Why this story exists

Story 05 (`05-story-improve-todo-ui.md`) was implemented exactly as scoped — a token layer (flat colors, one primary blue, `--space-*`/`--radius-*`/`--shadow-*`) plus straightforward class additions (`.btn`, `.alert`, `.auth-card`, `.task-item`). It is a correct, accessible, tested restyle, but it reads as "styled HTML," not a professional SaaS product: single flat shadow, no gradients, no iconography beyond three CSS-generated glyphs (`▽ ◆ ▲ ○ ✓`), a plain spinner + text loading state, and auth pages that are just a centered card. The user reviewed this result and asked for a **much stronger visual redesign** — not incremental cleanup — while explicitly keeping every existing behavior, API call, `aria-label`, `role`, accessible name, and test passing.

This story amends the plan for `improve-todo-ui` with a materially more ambitious visual target, on the same zero-new-dependency, zero-behavior-change constraints as Story 05. It supersedes Story 05's *visual output* (tokens, markup detail, CSS) while keeping Story 05's structural work (semantic `<header>`/`<div className="app__controls">` grouping, `.btn`/`.alert` class conventions, `field`/`auth-card` wrapper approach) as the foundation to build on rather than throw away.

## Goal

Make the app look like a modern, polished, professional SaaS/productivity product:

- A real primary/secondary/accent color system (indigo → violet gradient primary, teal accent, amber/rose/emerald semantic colors), not a single flat blue.
- A genuine icon system (hand-rolled inline SVG components, zero new dependency) for priority (High/Medium/Low), status (Pending/Completed), actions (Add/Edit/Delete/Log Out), and auth affordances (email/lock/user) — icons are additive to, never a replacement for, the existing literal text labels the test suite asserts on.
- Elevated, "real" cards: soft multi-layer shadows, hover lift/transition, a left priority-accent bar on task cards, rounded-2xl radii.
- A redesigned dashboard header: gradient banner, avatar-style username treatment, small stats strip (total/completed/pending counts) — computed client-side from already-fetched `tasks`, not a new API call.
- A skeleton-loader loading state (shimmering placeholder cards) instead of a spinner + text line.
- A polished empty state with an inline-SVG illustration, heading, and supporting copy — still two textually distinct messages for "no tasks yet" vs. "no tasks match the filter."
- Split-panel Login/Register pages: a decorative gradient brand panel (desktop) beside the real form panel, icon-adorned inputs.
- Subtle motion: hover/press transitions on buttons and cards, fade/slide-in on list items, shimmer on skeletons — all via CSS transitions/keyframes, respecting no new dependency.
- Fully responsive: the brand panel and stats strip collapse gracefully from ~1440px down to ~360px.

**Unchanged from Story 05's non-negotiables:** every `aria-label`, `htmlFor`/`id` pair, `role="alert"`, button/heading accessible name, and literal string asserted by a test (see Story 05 "Context" item 10 for the full enumerated list — it still applies verbatim) must keep working. No `server/` changes, no new API calls/fields, no new npm dependency, no routing changes beyond the existing login/register switch.

## Key visual/technical decisions

1. **Icons via hand-rolled inline SVG**, in a new file `client/src/components/icons.jsx` — small function components (`PlusIcon`, `EditIcon`, `TrashIcon`, `LogOutIcon`, `CheckCircleIcon`, `ClockIcon`, `FlameIcon` (high), `EqualIcon` (medium), `ArrowDownIcon` (low), `MailIcon`, `LockIcon`, `UserIcon`, `AlertIcon`, `ClipboardIcon` (empty state), `SpinnerIcon`). Every icon renders `aria-hidden="true" focusable="false"` and carries no text nodes, so it never changes any element's accessible name (icons are excluded from name computation) nor its `textContent` used by `getByText`/`getNodeText` (which only aggregates direct text-node children — an icon placed as a sibling element inside a button/badge does not affect a `getByText` match on that button/badge's own direct text). This is why Story 05's plan text for badges/buttons can be extended with real icons instead of CSS `::before` glyphs, without touching any selector-based test (`TaskItem.test.jsx` line 31's `.task-item__priority-badge` selector still resolves to an element whose direct text child is exactly `High`/`Medium`/`Low`).
2. **Color system** — replace Story 05's flat `--color-primary: #3b5bfd` single-hue system with a richer token set: `--color-primary`/`--color-primary-dark`/`--color-primary-light` (indigo), `--color-accent` (teal, used sparingly for secondary emphasis), plus distinct, higher-contrast semantic pairs for `--color-high`/`--color-medium`/`--color-low` (rose/amber/emerald) and `--color-pending`/`--color-completed`. A `--gradient-primary` token (`linear-gradient(135deg, indigo, violet)`) drives the header banner, primary buttons, and the auth brand panel — used with restraint (not on every surface, per the user's "don't overdo it" instruction).
3. **Stats strip is derived data, not a new feature** — `TaskDashboard` already holds `tasks` in state; a small computed `{ total, completed, pending }` (via `.length`/`.filter`) feeds three small stat cards in the header. This is presentation of existing data, not a new business feature or API call.
4. **Skeleton loading** replaces the spinner+text line. No test asserts on the old `Loading tasks...` text or `.loading-state`/`.spinner` classes (confirmed by grep across all `*.test.jsx`), so this is a safe, purely additive visual change under the same `loading ? X : <TaskList/>` branch in `App.jsx`.
5. **Split-panel auth layout** — `.auth-page` becomes a two-column grid on `≥ 900px` (decorative gradient panel + form panel) and collapses to a single centered card below that, same as Story 05's mobile behavior. The decorative panel is `aria-hidden="true"` (pure decoration, no content a screen reader needs) so it cannot affect any accessible-name or label test.
6. **No new npm dependency, no external font/icon library, no Google Fonts `<link>`** — same constraint as Story 05. All icons are inline SVG JSX; all motion is CSS `transition`/`@keyframes`.

## Scope of changed files

- `client/src/index.css` — full rewrite on richer tokens (colors, gradients, elevation scale, radii, motion durations/easings); same selector *names* Story 05 established are kept where they still apply (`.btn*`, `.alert`, `.field*`, `.app*`, `.task-item*`, `.auth-*`) so JSX changes stay minimal and additive.
- `client/src/components/icons.jsx` — **new file**, the inline-SVG icon set described above.
- `client/src/App.jsx` — `TaskDashboard`: add the stats strip (computed, no new state beyond a derived `const`), skeleton loading block, wire icons into the header/Log Out button; no change to any handler, effect, or API call.
- `client/src/components/TaskForm.jsx`, `TaskItem.jsx`, `TaskList.jsx`, `LoginPage.jsx`, `RegisterPage.jsx` — add icons and structural wrapper `<span>`s for icon+label pairs; every existing `aria-label`, `id`/`htmlFor`, `role="alert"`, and literal button/heading text stays byte-for-byte identical.

## Test & verification plan (unchanged bar from Story 05)

1. `cd client && npm test` — full existing suite (`App.test.jsx`, `TaskForm.test.jsx`, `TaskItem.test.jsx`, `TaskList.test.jsx`, `LoginPage.test.jsx`, `RegisterPage.test.jsx`) must pass **unmodified**.
2. `cd client && npm run build` must succeed.
3. Manual pass at ~360px, ~768px, ~1024px, ~1440px+ widths: no horizontal scroll, no clipped text/controls, header/stats/brand-panel reflow correctly, long username and long task title still wrap without breaking layout (same edge cases as Story 05).
4. Keyboard pass: every interactive element still shows a visible focus indicator (icons must never intercept focus — no `tabindex` added to any icon).

## Done criteria

- [ ] Visually distinct from Story 05's output: gradient-driven header/brand panel, real icon system, elevated cards with hover motion, skeleton loading, illustrated empty state, split-panel auth.
- [ ] All Story 05 "Done Criteria" still hold (they are not superseded, only visually upgraded): consistent token-driven design language, full responsiveness ~360px–1440px+, complete button/input state coverage, accessible priority/status differentiation beyond color, distinct empty/loading/error states, zero behavior change, full existing test suite green, successful build, no `server/` changes, no new dependency.
