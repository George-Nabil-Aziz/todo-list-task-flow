# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/dark-mode/add-dark-mode/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** Add Dark Mode
- **Feature slug (folder under `plans/`):** `dark-mode`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** `` *(used in filenames and plan tables; fill manually if empty)*
- **Work item type:** `UI/UX enhancement`
- **Status:** `Intake`
- **Assignee:** George Nabil
- **Labels:** `ui`, `ux`, `frontend`, `dark-mode`, `no-new-features`

External tracker links are **not** followed by the planner. Keep the id for naming and traceability only.

---

## Title

*(Paste the work item title verbatim. Prefilled when `squad new-story` fetched from a tracker.)*

```
Add Dark Mode
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```

Add a Light/Dark theme to the existing Todo application as its own,
self-contained story, separate from the `improve-todo-ui` visual
redesign story. This story does **not** change what any screen does —
only how it looks under a dark theme, plus the mechanism to switch
between themes.

The app today (client/, React + Vite) already went through a visual
redesign (`improve-todo-ui`) that introduced a CSS custom-property
("design token") system in `client/src/index.css` (`:root { --color-*,
--space-*, --radius-*, --shadow-*, --font-size-*, --transition-* }`)
used by every component's styling: Login screen and Register screen
(client/src/components/LoginPage.jsx, RegisterPage.jsx), the task
dashboard header (client/src/App.jsx `TaskDashboard`), the add-task
form (client/src/components/TaskForm.jsx), the filter/sort controls,
and the task list/cards (client/src/components/TaskList.jsx,
TaskItem.jsx) with their status and priority badges. Today those
tokens only define one (light) palette.

This story should:

- Introduce a dark color palette as an alternate set of values for the
  same design tokens (not a parallel, divergent styling system), so
  every screen and component that already consumes the tokens
  automatically looks correct in both themes.
- Add a theme toggle control (light/dark) that is reachable from every
  authenticated and unauthenticated screen (Login, Register, and the
  Task Dashboard), is keyboard-operable, and clearly communicates
  its current state to assistive technology.
- On first load with no stored preference, respect the user's OS/browser
  theme preference (`prefers-color-scheme`). Once the user explicitly
  picks a theme via the toggle, that explicit choice persists (e.g. via
  `localStorage`) and overrides the system preference on future visits,
  including after a full page refresh.
- Apply the theme to the entire frontend consistently: Login, Register,
  and the Task Dashboard (header, add-task form, filter/sort controls,
  task cards, inline edit mode, status badges, priority badges,
  buttons of every variant, inputs/selects, loading/empty states, and
  validation/error alerts).
- Use a smooth, subtle transition when switching themes (e.g. a short
  CSS transition on color/background/border properties) rather than an
  abrupt, jarring flash, while avoiding a "flash of wrong theme" on
  initial page load.
- Keep contrast and accessibility at least as good as the current light
  theme in the dark theme (e.g. meeting WCAG AA contrast ratios for
  text and interactive elements), and keep the app fully responsive on
  desktop, tablet, and mobile widths in both themes.

This is a purely visual/structural (CSS + minimal JSX for the toggle
control and theme state) addition. It must not change any existing
business behavior, API calls, data model, or authentication logic.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
Theme toggle & switching
- [ ] A visible, clearly labeled Light/Dark theme toggle is present and
      reachable from the Login screen, the Register screen, and the
      Task Dashboard.
- [ ] The toggle is operable by keyboard alone (focusable, activates on
      Enter/Space) and exposes its current state and purpose to
      assistive technology (e.g. `aria-label` or `aria-pressed`/`role="switch"`
      reflecting Light vs. Dark).
- [ ] Activating the toggle switches the entire visible UI between
      light and dark immediately, with a smooth, subtle transition on
      color/background/border (not an instant hard cut, and not a
      slow/distracting animation).
- [ ] The toggle's own visual state (icon/label/position) always
      matches the theme actually applied.

Persistence & system preference
- [ ] On first visit (no stored preference), the app renders using the
      OS/browser's `prefers-color-scheme` (dark or light) automatically.
- [ ] Once a user explicitly picks a theme via the toggle, that choice
      is persisted (e.g. `localStorage`) and is restored exactly after
      a full page refresh or reopening the app, overriding the system
      preference from then on.
- [ ] There is no visible "flash" of the wrong theme between initial
      page paint and the stored/system theme being applied.
- [ ] If the user changes their OS theme while an explicit in-app
      preference is already stored, the app keeps honoring the stored
      explicit preference (does not silently override the user's
      choice).

Full-app coverage
- [ ] Login screen (inputs, buttons, headings, error text) is fully
      styled and legible in Dark Mode.
- [ ] Register screen (inputs, buttons, headings, error text) is fully
      styled and legible in Dark Mode.
- [ ] Task Dashboard header (app title, "Logged in as `<username>`",
      Log Out button) is fully styled and legible in Dark Mode.
- [ ] Add-task form (title input, priority select, Add button,
      validation error) is fully styled and legible in Dark Mode.
- [ ] Filter/sort controls (priority filter select, sort select) are
      fully styled and legible in Dark Mode.
- [ ] Task cards, including inline edit mode (input + Save/Cancel) and
      completed-task styling, are fully styled and legible in Dark
      Mode.
- [ ] Buttons in every variant (primary, secondary, destructive) show
      correct, distinguishable colors and visible hover/focus/active/
      disabled states in Dark Mode.
- [ ] Text inputs and selects show correct borders, backgrounds, and a
      clearly visible keyboard focus style in Dark Mode.
- [ ] Alerts/validation and fetch/error messages (login, register, task
      form, inline edit, dashboard-level errors) remain clearly
      legible and identifiable as errors/warnings/success in Dark Mode.
- [ ] Priority badges (Low/Medium/High) and status indicators
      (Pending/Completed) remain visually distinguishable from each
      other (not just by hue, but by adequate lightness/contrast
      difference) and legible in Dark Mode.
- [ ] Loading and empty states (no tasks yet / no tasks match filter)
      are correctly styled and legible in Dark Mode.

Design tokens & implementation
- [ ] Theme is implemented via CSS variables/design tokens (extending
      the existing `:root` custom-property system in
      `client/src/index.css`), with a dark-mode value set (e.g. via a
      `[data-theme="dark"]` attribute or class on a root element, or an
      equivalent token-swap mechanism) rather than one-off, per-component
      dark-mode overrides or duplicated component styles.
- [ ] No component hardcodes a light-only color that breaks in Dark
      Mode (e.g. a literal hex/rgb color bypassing the token system) in
      any of the files touched by this story.

Contrast, accessibility & responsiveness
- [ ] Text and interactive elements in Dark Mode meet at least WCAG AA
      contrast ratios (4.5:1 for normal text, 3:1 for large
      text/UI components) against their backgrounds.
- [ ] Visible focus outlines remain present and clearly visible in Dark
      Mode for every focusable element (inputs, selects, buttons, the
      theme toggle itself, links).
- [ ] The app remains fully responsive and visually correct in both
      themes from a small mobile viewport (~360px) through tablet and
      desktop widths (~1440px+), with no horizontal scrolling, clipped
      text, or overlapping controls.

No functional/behavioral regressions
- [ ] No existing behavior changes: login, registration, logout,
      add/edit/delete task, toggle status, change priority, filter by
      priority, sort by priority, and per-user task isolation continue
      to work exactly as before, in both themes.
- [ ] No new API calls, endpoints, data fields, or business features
      are introduced. No changes to `server/`.
- [ ] The existing client test suite (App.test.jsx, TaskForm.test.jsx,
      TaskItem.test.jsx, TaskList.test.jsx, LoginPage.test.jsx,
      RegisterPage.test.jsx) continues to pass; where a test asserts on
      visible text, an `aria-label`, or a `role`, that text/label/role
      is preserved (or updated in the same change only if an accessible
      name is deliberately improved, without altering what the test is
      actually verifying).
- [ ] `npm run build` and `npm test` in `client/` both succeed after
      the change.
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
- **Depends on code areas or other stories:** Builds directly on the
  CSS custom-property/design-token system introduced by
  `improve-todo-ui` (`client/src/index.css`, `:root { --color-*,
  --space-*, --radius-*, --shadow-*, --font-size-*, --transition-* }`)
  and every component that already consumes those tokens: `add-todo-task`
  (Story 01, `TaskItem`/`TaskList`/`TaskForm`), `add-user-authentication`
  (Story 02, `LoginPage`/`RegisterPage`/`AuthContext`), `add-task-priorities`
  (Story 03, priority badges/filter/sort), `add-username` (Story 04,
  the "Logged in as `<username>`" header line), and `improve-todo-ui`
  itself (Story 05/06, the token system and current visual design).
  This story is intentionally sequenced **after** `improve-todo-ui` and
  should treat that light palette/token set as the baseline it extends
  with a dark variant, not something it reworks from scratch. No
  behavior from any prior story should change — only presentation, plus
  the new theme-toggle mechanism.

## Extra notes (optional)

- Split out from `improve-todo-ui` as its own story on purpose: the
  visual redesign should land first and establish the token system;
  this story then adds the dark palette and the toggle on top of it.
- Prefer implementing this as a token-swap (e.g. a `data-theme="dark"`
  attribute or class toggled on `<html>`/`<body>`, with a second block
  of the same CSS custom properties scoped under it, plus a
  `prefers-color-scheme: dark` media-query fallback for the
  no-preference-stored case) rather than duplicating component CSS
  per theme or introducing a CSS-in-JS/theming library — keep the
  dependency footprint minimal, consistent with `improve-todo-ui`'s
  "no heavy UI framework" preference.
- Edge cases the theme must keep handling gracefully: rapid toggling
  back and forth without layout jumps or transition glitches; the
  toggle control itself remaining visible/usable in both themes;
  images/icons (if any) that need a dark-aware variant or sufficient
  contrast against a dark background; browsers/environments without
  `localStorage` access (e.g. private browsing) falling back gracefully
  to system preference or a sensible default instead of erroring; and
  multiple tabs open at once (a stored preference change in one tab
  does not need to live-sync to another open tab, but must not error).
- Accessibility must not regress: keep all existing label associations,
  `aria-label`s, `role="alert"` usage, and visible focus outlines in
  both themes; the new toggle control must have an accessible name and
  state.

## Technical hints (optional)

- Repos/roots: `.`. Primary language: `JavaScript`. Stack: React 18 +
  Vite (`client/`), Vitest + Testing Library for tests.
- Existing token system to extend: `client/src/index.css` (`:root`
  block defining `--color-primary`, `--color-bg`, `--color-surface`,
  `--color-text`, `--color-border`, `--color-danger`, `--color-success`,
  `--color-warning`, `--color-high`/`--color-medium`/`--color-low`
  (priority), `--color-pending`/`--color-completed` (status),
  `--space-*`, `--radius-*`, `--shadow-*`, `--font-size-*`,
  `--transition-*`).
- Files likely in scope: `client/src/index.css` (add dark token values
  and `prefers-color-scheme`/`data-theme` handling), `client/src/App.jsx`
  (mount point for theme state/toggle placement across Login/Register/
  Dashboard), a new small theme context/hook (e.g.
  `client/src/context/ThemeContext.jsx`) and toggle component (e.g. in
  `client/src/components/icons.jsx` or a new `ThemeToggle.jsx`) for the
  toggle control and `localStorage` persistence.
- Existing test suites that exercise these components by visible text,
  `aria-label`, and `role` (must keep passing): `client/src/App.test.jsx`,
  `client/src/components/TaskForm.test.jsx`, `client/src/components/TaskItem.test.jsx`,
  `client/src/components/TaskList.test.jsx`, `client/src/components/LoginPage.test.jsx`,
  `client/src/components/RegisterPage.test.jsx`.
- No `server/` changes are needed for this story.

## Out of scope

- Any new Todo/business functionality, API endpoint, or data field
  (no due dates, tags, drag-and-drop, bulk actions, etc.).
- Any authentication changes (login/register/logout flow, session
  handling, validation rules) beyond restyling for Dark Mode.
- Any change to priority behavior (values, filtering, sorting logic) —
  only the visual treatment of priority badges under Dark Mode.
- Any `server/`/API/data-model changes.
- Per-user or per-device theme preference stored server-side (this
  story is client-only, local-storage-based persistence).
- Multiple/custom themes beyond a single Light and single Dark theme
  (e.g. no additional accent-color pickers or "auto" tri-state UI
  beyond system-preference-as-default-on-first-visit).
- Redesigning layout, typography, or component structure beyond what's
  needed to support both themes (that is the scope of `improve-todo-ui`,
  not this story).
