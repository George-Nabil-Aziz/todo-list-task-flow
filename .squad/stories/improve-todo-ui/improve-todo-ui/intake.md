# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/improve-todo-ui/improve-todo-ui/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** Improve Todo UI/UX
- **Feature slug (folder under `plans/`):** `improve-todo-ui`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** `` *(used in filenames and plan tables; fill manually if empty)*
- **Work item type:** `UI/UX improvement`
- **Status:** `Intake`
- **Assignee:** George Nabil
- **Labels:** `ui`, `ux`, `frontend`, `no-new-features`

External tracker links are **not** followed by the planner. Keep the id for naming and traceability only.

---

## Title

*(Paste the work item title verbatim. Prefilled when `squad new-story` fetched from a tracker.)*

```
Improve Todo UI
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
Improve the overall UI/UX of the existing Todo application. Make it
modern, clean, professional, responsive, and visually consistent.

The app today (client/, React + Vite, no UI framework — a single
plain index.css file, no CSS variables, no design tokens) has only
bare-bones styling: an unstyled system font, default form controls,
plain bordered list items for tasks, and plain-text loading / empty /
error states. There is no visual language for status or priority
beyond two small colored badges.

This story should visually redesign, restyle, and rework the layout
of the existing screens and pieces without changing what they do:

- Login screen and Register screen (client/src/components/LoginPage.jsx,
  RegisterPage.jsx) — forms, inputs, buttons, headings, error text.
- Task dashboard header (client/src/App.jsx TaskDashboard) — app title,
  "Logged in as <username>" line, Log Out button.
- Add-task form (client/src/components/TaskForm.jsx) — title input,
  priority select, Add button, validation error.
- Filter/sort controls in the dashboard (priority filter select, sort
  select).
- Task list and task cards (client/src/components/TaskList.jsx,
  TaskItem.jsx) — card layout, status checkbox/badge, priority badge
  and its select, title text, inline edit mode (input + Save/Cancel),
  Edit/Delete actions, completed-task styling.
- Loading state, empty states (no tasks yet vs. no tasks match the
  filter), and error/alert states across all of the above.

Improve layout, spacing, typography (type scale, weights, line
height), buttons (primary/secondary/destructive, hover/focus/active/
disabled states), inputs and selects (borders, focus rings, sizing),
task cards, status and priority indicators, the dashboard header, and
the empty/loading/error states, so the whole app reads as one
consistent, professional design system rather than unstyled HTML.

The app must remain fully responsive from small mobile widths up
through desktop.

Keep all existing functionality unchanged: every feature — login,
registration, logout, add/edit/delete task, toggle status, change
priority, filter by priority, sort by priority, per-user task
isolation, validation and error handling — must keep working exactly
as it does today. Do not add new business features, new API calls, or
new data fields. This is a visual/structural (HTML/CSS/JSX markup)
restyle, not a functionality change.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
Visual design & consistency
- [ ] Login, Register, and the Task Dashboard share one consistent
      visual language: same color palette, spacing scale, typography
      (font sizes/weights/line-height), border-radius, and
      shadow/elevation treatment across buttons, inputs, cards, and
      badges.
- [ ] A shared, reusable set of base styles/tokens (e.g. CSS custom
      properties for colors/spacing/radius) replaces today's ad hoc
      values in client/src/index.css so the look is defined once, not
      per component.

Layout & responsiveness
- [ ] The app is fully usable and visually correct from a small mobile
      viewport (~360px wide) up through a wide desktop viewport
      (~1440px+), with no horizontal scrolling, clipped text, or
      overlapping controls at any width in between.
- [ ] Touch targets (buttons, checkboxes, selects) are comfortably
      sized on mobile widths.
- [ ] The dashboard header (title, "Logged in as <username>", Log Out)
      is clearly laid out and does not break when the username is
      long.

Buttons & inputs
- [ ] Buttons have a clear, consistent visual hierarchy (e.g. primary
      for Add/Save/Log In/Register, secondary for Cancel/switch-view
      links, a visually distinct treatment for destructive actions
      like Delete) with visible hover, focus, active, and disabled
      states.
- [ ] Text inputs and selects (login, register, task form, filter/sort,
      inline edit, per-task priority select) share consistent sizing,
      borders, spacing, and a visible keyboard focus style.

Task cards & indicators
- [ ] Each task is presented as a clearly delineated card showing
      title, status, and priority with distinguishable visual styling.
- [ ] Status (Pending/Completed) and priority (Low/Medium/High) are
      each distinguishable without relying on color alone (e.g. also
      by label, icon, or shape) for colorblind/accessibility reasons.
- [ ] Completed tasks are visually de-emphasized (e.g. muted color,
      strikethrough) in a way that looks intentional, not just
      browser-default `text-decoration`.
- [ ] Inline edit mode for a task is visually distinct from view mode,
      with clearly styled Save/Cancel actions.

Loading / empty / error states
- [ ] The "loading tasks" state shows a styled loading indicator
      instead of plain unstyled text.
- [ ] The "no tasks yet" empty state and the "no tasks match the
      selected priority filter" empty state are each styled distinctly
      and clearly (not just a plain `<p>`), and remain two visibly
      different messages for the two different situations.
- [ ] Validation and fetch error messages (login, register, task form,
      inline edit, dashboard-level fetch/401 errors) are styled
      consistently and are clearly legible as errors.

No functional regressions
- [ ] All existing behavior is unchanged: login, registration, logout,
      add/edit/delete task, toggle status, change priority, filter by
      priority, sort by priority, per-user task isolation, and all
      existing client-side validation continue to work exactly as
      before.
- [ ] No new API calls, endpoints, data fields, or business features
      are introduced. No changes to server/.
- [ ] The existing client test suite (App.test.jsx, TaskForm.test.jsx,
      TaskItem.test.jsx, TaskList.test.jsx, LoginPage.test.jsx,
      RegisterPage.test.jsx) continues to pass; where a test asserts on
      visible text, an `aria-label`, or a `role`, that text/label/role
      is preserved (or the test is updated in the same change if an
      accessible name is deliberately improved, without altering what
      the test is actually verifying).
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
- **Depends on code areas or other stories:** Purely additive restyle
  on top of everything built so far — `add-todo-task` (Story 01, base
  task CRUD + `TaskItem`/`TaskList`/`TaskForm`), `add-user-authentication`
  (Story 02, `LoginPage`/`RegisterPage`/`AuthContext`), `add-task-priorities`
  (Story 03, priority badges/filter/sort), and `add-username` (Story 04,
  the "Logged in as `<username>`" header line). No behavior from those
  stories should change, only presentation.

## Extra notes (optional)

- Current stack has **zero UI dependencies**: plain React components
  and one hand-written `client/src/index.css` (see current rules for
  `.task-form`, `.task-list`, `.task-item`, `.task-item__badge`,
  `.form-error`, etc.). There is no Tailwind, CSS-in-JS, or component
  library installed today.
- Prefer keeping the dependency footprint minimal (e.g. improve the
  plain CSS with a proper token/variable system, or a lightweight
  approach) rather than pulling in a heavy UI framework, unless the
  planner has a strong reason to — this is a styling/markup story, not
  an excuse to add a large new dependency.
- Edge cases the redesign must keep handling gracefully: very long
  task titles or usernames (wrap/truncate without breaking layout),
  long task lists (scroll without breaking page layout), and rapid
  toggling of loading/empty/error/populated states without layout
  jumps.
- Accessibility must not regress: keep (or improve) label associations,
  `aria-label`s, `role="alert"` usage, and visible focus outlines —
  do not remove `outline` on focus without a replacement focus style.

## Technical hints (optional)

- Repos/roots: `.`. Primary language: `JavaScript`. Stack: React 18 +
  Vite (`client/`), Vitest + Testing Library for tests.
- Files in scope: `client/src/index.css`, `client/src/App.jsx`
  (`TaskDashboard`), `client/src/components/TaskForm.jsx`,
  `client/src/components/TaskItem.jsx`, `client/src/components/TaskList.jsx`,
  `client/src/components/LoginPage.jsx`, `client/src/components/RegisterPage.jsx`.
- Existing test suites that exercise these components by visible text,
  `aria-label`, and `role` (must keep passing):
  `client/src/App.test.jsx`, `client/src/components/TaskForm.test.jsx`,
  `client/src/components/TaskItem.test.jsx`, `client/src/components/TaskList.test.jsx`,
  `client/src/components/LoginPage.test.jsx`, `client/src/components/RegisterPage.test.jsx`.
- No `server/` changes are needed for this story.

## Out of scope

- Any new business feature, API endpoint, data field, task property,
  or behavior change (e.g. no due dates, no tags, no drag-and-drop
  reordering, no bulk actions, no dark-mode toggle unless purely a
  visual nicety the planner wants to include).
- Changing routing/navigation structure (login vs. register vs.
  dashboard) beyond restyling the existing switch.
- Any change to `server/` code, API contracts, or the task/user data
  model.
- Introducing a heavy UI framework or large new dependency without
  clear justification.
