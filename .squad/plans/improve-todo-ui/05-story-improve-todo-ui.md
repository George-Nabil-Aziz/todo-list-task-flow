# Story 05 — Improve Todo UI/UX

## Prerequisites

- Stories 01–04 completed and already implemented in the current codebase — this story only restyles what they built, it does not change their behavior:
  - [../add-todo-task/01-story-todo-tasks.md](../add-todo-task/01-story-todo-tasks.md) — base task CRUD, `TaskForm`, `TaskItem`, `TaskList`.
  - [../add-user-authentication/02-story-user-login-and-registration.md](../add-user-authentication/02-story-user-login-and-registration.md) — `LoginPage`, `RegisterPage`, `AuthContext`.
  - [../add-task-priorities/03-story-task-priorities.md](../add-task-priorities/03-story-task-priorities.md) — priority badges, filter, sort.
  - [../add-username/04-story-username-login-support.md](../add-username/04-story-username-login-support.md) — the "Logged in as `<username>`" dashboard line.

---

## Story Goal

Restyle the existing Todo client (`client/`) into a modern, clean, professional, responsive, and visually consistent UI, **without changing any existing behavior**:

1. One consistent visual language (color palette, spacing scale, typography, radius, shadow) applied across the Login screen, Register screen, and the Task Dashboard.
2. A fully responsive layout from a ~360px mobile viewport up through a ~1440px+ desktop viewport — no horizontal scroll, clipped text, or overlapping controls.
3. Clearly styled buttons (primary/secondary/destructive, with hover/focus/active/disabled states) and form inputs/selects (consistent sizing, borders, visible focus rings).
4. Task cards with a clear, legible layout for title, status, and priority, and a visually distinct inline-edit mode.
5. A styled loading indicator, two visually distinct styled empty states ("no tasks yet" vs. "no tasks match the filter"), and consistently styled error/alert messages.
6. A clearly laid out dashboard header (title, "Logged in as `<username>`", Log Out) that does not break with a long username.

**Not in scope** (per intake "Out of scope"): any new business feature, API call, data field, or task property; any change to `server/`; any routing/navigation restructuring beyond restyling the existing login/register switch; introducing a heavy UI framework or large new dependency. This is a **JSX markup + CSS** restyle — every existing prop, handler, API call, `aria-label`, `role`, and piece of visible text that a test asserts on must keep working exactly as today unless a test is deliberately updated in the same change (see "Edge Cases & Failure Modes" and "Test Plan").

---

## Context — Read These Files First

1. `client/src/index.css` (all 65 lines) — the entire current stylesheet: `body` (lines 1–6, `max-width: 480px` container, `system-ui` font), `.task-form` (8–16), `.task-list` (18–24), `.task-item` (26–33, plain border/radius card), `.task-item--completed .task-item__title` (35–38, strike-through), `.task-item__badge` + `.task-item--pending`/`--completed` variants (40–54, the only existing status-color rules), `.form-error` (61–64). Note there is **no** rule at all for `.task-item__priority-badge` or `.task-list__empty` today — both render with browser-default styling.
2. `client/src/App.jsx` (all 172 lines) — `TaskDashboard` (11–155): `useAuth()` destructuring `logout`/`username` (line 12), the `fetchTasks` effect (19–29), the `<main className="app">` return block (105–154) — header content (`<h1>ToDo Tasks</h1>`, `<p>Logged in as {username || 'you'}</p>`, Log Out `<button>`, lines 107–109), the priority-filter `<label>`/`<select>` (111–123), the sort `<label>`/`<select>` (124–131), the error alert `<p role="alert" className="form-error">` (132–136), and the loading-vs-`TaskList` branch (137–152, `<p>Loading tasks...</p>` at line 138). `App` (157–170) switches between `LoginPage`/`RegisterPage`/`TaskDashboard` based on `isAuthenticated`.
3. `client/src/components/TaskForm.jsx` (all 44 lines) — the `<form className="task-form">` (20–39): title `<input aria-label="New task title">` (21–27), priority `<select aria-label="Priority">` (28–32), `<button type="submit">Add</button>` (33), and the `role="alert"` validation error (34–38).
4. `client/src/components/TaskItem.jsx` (all 99 lines) — the `<li className="task-item ...">` (36–95): the status checkbox + `.task-item__badge` (37–45), the priority badge span whose class is **already** built as `` `task-item__priority-badge task-item__priority-badge--${task.priority}` `` (line 47) plus its `<select aria-label={...}>` (50–58), the inline-edit block (`.task-item__edit`, 60–79, with `aria-label="Edit task title"` input at 62–67 and Save/Cancel buttons at 68–73), the view-mode `.task-item__title` span (81), and the Edit/Delete `.task-item__actions` buttons (84–93).
5. `client/src/components/TaskList.jsx` (all 32 lines) — the empty-state branch `<p className="task-list__empty">{emptyMessage}</p>` (11–13) and the `<ul className="task-list">` mapping over `<TaskItem>` (15–28).
6. `client/src/components/LoginPage.jsx` (all 41 lines) — the bare `<form onSubmit={handleSubmit}>` (20–36, no wrapping container/class at all): `<h1>Log In</h1>` (21), labeled email/password inputs (22–30, `htmlFor`/`id` pairs `login-email`/`login-password`), `role="alert"` error (31), submit `<button type="submit">Log In</button>` (32), and the plain `<button type="button">Need an account? Register</button>` (33–35).
7. `client/src/components/RegisterPage.jsx` (all 49 lines) — same shape as LoginPage: `<h1>Register</h1>` (22), labeled username/email/password inputs (23–38, ids `register-username`/`register-email`/`register-password`), `role="alert"` error (39), submit `<button type="submit">Register</button>` (40), and `<button type="button">Already have an account? Log in</button>` (41–43).
8. `client/index.html` (13 lines) — already has `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` (line 5); no font/CSS `<link>`s exist, so any new font must be self-hosted or system-stack (see "No heavy dependency" note below) — do not add a Google Fonts `<link>`.
9. `client/package.json` — confirms `client/` has **zero** UI/CSS dependencies (`react`, `react-dom` only) and its scripts: `"dev": "vite"`, `"build": "vite build"`, `"test": "vitest run"`.
10. Test files that assert on exact visible text, `aria-label`, `role`, or (in one case) a CSS class — every one of these must still pass unmodified after the restyle:
    - `client/src/App.test.jsx` — `mockAuth` fixture (lines 15–21, includes `username: 'testuser'`); asserts `screen.findByText('Logged in as testuser')` (34); `screen.getByLabelText('New task title'|'Priority'|'Change priority of "Buy milk"'|'Filter by priority'|'Sort by priority')` (43, 57, 94, 107, 123/129); `screen.getByText('Add'|'Delete')` (44, 70); `screen.getByRole('checkbox')` (82); `screen.getAllByRole('listitem')` for sort-order assertions (125, 131); `screen.getByRole('heading', { name: 'Log In' })` (139).
    - `client/src/components/TaskItem.test.jsx` — `screen.getByText('Pending')` (11); `screen.getByRole('checkbox')` (17); **`screen.getByText('High', { selector: '.task-item__priority-badge' })`** (31) — this is the one place a test depends on a literal CSS class name, and it must keep resolving to the element whose text is exactly `High`/`Low`/`Medium`; `screen.getByLabelText('Change priority of "Buy milk"')` (45); `screen.getByText('Delete'|'Edit'|'Save'|'Cancel')` (52, 59, 62, 72); `screen.getByLabelText('Edit task title')` (60, 70, 81); `screen.getByRole('alert')` (85).
    - `client/src/components/TaskForm.test.jsx` — `screen.getByLabelText('New task title'|'Priority')` (10, 22–23); `screen.getByText('Add')` (12, 24, 33); `screen.getByRole('alert')` (36).
    - `client/src/components/TaskList.test.jsx` — `screen.getByText(/no tasks yet/i)` (8, 33) and `screen.getByText('No tasks match the selected priority filter.')` (32) — both must remain the full, matchable text of the empty-state element (no extra sibling text nodes that would split the match).
    - `client/src/components/LoginPage.test.jsx` — `screen.getByLabelText('Email'|'Password')` (21–22, 32–33); `screen.getByRole('button', { name: 'Log In' })` (23, 34) — the submit button's **accessible name must stay exactly `Log In`**; `screen.findByRole('alert')` (36); `screen.getByText('Need an account? Register')` (43).
    - `client/src/components/RegisterPage.test.jsx` — `screen.getByLabelText('Username'|'Email'|'Password')` (21–23, 35–37); `screen.getByRole('button', { name: 'Register' })` (24, 38) — accessible name must stay exactly `Register`; `screen.findByRole('alert')` (40); `screen.getByText('Already have an account? Log in')` (47).
11. Grep for other CSS class usages outside `client/src/index.css` and the components above to confirm nothing else depends on today's class names — `grep -rn "className=" client/src` — only the files listed above use `className`; no other component or test file references a CSS class name.

---

## Product rules (from story)

- **Current:** No design tokens; `body` alone sets `max-width: 480px` and a plain font stack; buttons/inputs use unstyled browser defaults; `.task-item__priority-badge` and `.task-list__empty` have no CSS at all; the loading state is plain text; there is no visual grouping (header, controls, cards use flat, un-wrapped siblings in `LoginPage`/`RegisterPage`/`TaskDashboard`).
- **New:** A small token layer (CSS custom properties for color, spacing, radius, shadow, type scale) drives every component's styling; buttons get an explicit primary/secondary/danger visual hierarchy; task cards, badges, header, controls, and empty/loading/error states are all explicitly styled and responsive.
- **Unchanged:** Every existing `aria-label`, `htmlFor`/`id` pair, `role="alert"`, button/heading accessible name, and piece of literal text asserted by a test (see item 10 above) — restyle CSS and wrap/add elements only; do not rename or remove any of these.

---

## Frontend Tasks

No backend changes required — `server/` is out of scope for this story.

### 1 — Design tokens and base styles

**File: `client/src/index.css`** — replace the file with a token-driven stylesheet. Keep every existing selector's *purpose* (task form, task list, task item, badges, form errors) but rebuild the rules on top of new `:root` custom properties instead of hard-coded one-off values. Suggested token set (names are free to adjust, but keep it a single `:root` block so the rest of the file — and Tasks 2–6 below — can reference it):

```css
:root {
  --color-bg: #f5f6f8;
  --color-surface: #ffffff;
  --color-border: #dde1e6;
  --color-text: #1f2430;
  --color-text-muted: #6b7280;
  --color-primary: #3b5bfd;
  --color-primary-hover: #2c46d6;
  --color-danger: #d1293d;
  --color-danger-hover: #b01f31;
  --color-success: #1e6b30;
  --color-success-bg: #d4edda;
  --color-warning: #7a5b00;
  --color-warning-bg: #fff3cd;
  --color-low: #1e6b30;
  --color-low-bg: #e3f5e8;
  --color-medium: #7a5b00;
  --color-medium-bg: #fff3cd;
  --color-high: #b01f31;
  --color-high-bg: #fde3e6;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0 4px 12px rgba(16, 24, 40, 0.08);

  --font-size-sm: 0.8125rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;

  --transition-fast: 120ms ease;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  margin: 0;
  padding: var(--space-4);
  line-height: 1.5;
}
```

Do **not** add a `<link>` to Google Fonts or any external stylesheet in `client/index.html` — keep the system font stack so the app has zero new network dependencies (per intake "Extra notes").

### 2 — Auth screens (Login / Register)

**Files: `client/src/components/LoginPage.jsx`, `client/src/components/RegisterPage.jsx`.**

Wrap each form in a centered card container and group each label+input pair. Keep every `htmlFor`/`id`, `aria-label`, and button/heading text byte-for-byte identical. Example for `LoginPage.jsx` (lines 19–37 today):

```jsx
return (
  <div className="auth-page">
    <form onSubmit={handleSubmit} className="auth-card">
      <h1>Log In</h1>
      <div className="field">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="alert alert--error">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--block">
        Log In
      </button>
      <button type="button" className="btn btn--link" onClick={onSwitchToRegister}>
        Need an account? Register
      </button>
    </form>
  </div>
);
```

Apply the equivalent structure to `RegisterPage.jsx` (lines 20–45), keeping its username/email/password field order and the `Register`/`Already have an account? Log in` button text unchanged. The submit button's rendered text must remain exactly `Log In` / `Register` — those strings are matched via `getByRole('button', { name: ... })` in both test files (see Context item 10), so do not wrap them in extra elements that would change the accessible name (icons are fine as long as they carry `aria-hidden="true"` and don't add extra text nodes).

Style `.auth-page` (full-viewport centering, `min-height: 100vh`, `display: flex; align-items: center; justify-content: center;`) and `.auth-card` (bounded width e.g. `max-width: 360px`, `background: var(--color-surface)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-md)`, `padding: var(--space-8)`) and `.field` (stacked label above input, `margin-bottom: var(--space-4)`) in `client/src/index.css`.

### 3 — Dashboard header and controls

**File: `client/src/App.jsx`** — restructure the `TaskDashboard` return block (currently flat siblings at lines 105–154) into semantic groups, without changing any handler, prop, or piece of text:

```jsx
return (
  <main className="app">
    <header className="app__header">
      <div>
        <h1>ToDo Tasks</h1>
        <p className="app__welcome">Logged in as {username || 'you'}</p>
      </div>
      <button onClick={logout} className="btn btn--secondary">
        Log Out
      </button>
    </header>

    <TaskForm onAdd={handleAdd} />

    <div className="app__controls">
      <label className="field field--inline">
        Filter by priority
        <select
          value={filterPriority}
          onChange={(event) => setFilterPriority(event.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="field field--inline">
        Sort by priority
        <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort by priority">
          <option value="none">None</option>
          <option value="high-first">High to Low</option>
          <option value="low-first">Low to High</option>
        </select>
      </label>
    </div>

    {error && (
      <p role="alert" className="alert alert--error">
        {error}
      </p>
    )}

    {loading ? (
      <p className="loading-state">
        <span className="spinner" aria-hidden="true" />
        Loading tasks...
      </p>
    ) : (
      <TaskList
        tasks={visibleTasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        emptyMessage={
          tasks.length === 0
            ? 'No tasks yet. Add one above to get started.'
            : 'No tasks match the selected priority filter.'
        }
      />
    )}
  </main>
);
```

Style `.app` as the page container (`max-width: 640px`, `margin: 0 auto`, `display: flex; flex-direction: column; gap: var(--space-6);`), `.app__header` as a responsive flex row (`justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);` so it stacks under narrow widths instead of overflowing — this is what keeps a long `username` from breaking the layout), `.app__welcome` as muted secondary text (`color: var(--color-text-muted); font-size: var(--font-size-sm);`), `.app__controls` as a responsive flex row of the two filter/sort fields (`flex-wrap: wrap; gap: var(--space-4);`), and `.loading-state`/`.spinner` (a small CSS-only spinner via `border` + `@keyframes spin` rotating `transform`, no image asset).

### 4 — Task form

**File: `client/src/components/TaskForm.jsx`** — keep `className="task-form"` on the `<form>` (line 20) and the same `aria-label`s/text; only add button styling and let the error render through the shared alert style:

```jsx
<button type="submit" className="btn btn--primary">
  Add
</button>
{error && (
  <p role="alert" className="alert alert--error">
    {error}
  </p>
)}
```

Restyle `.task-form` in `client/src/index.css` (currently lines 8–16: flex row with `gap: 0.5rem`) to use the new tokens and `flex-wrap: wrap` so the input/select/button stack cleanly on narrow viewports instead of overflowing.

### 5 — Task cards and badges

**File: `client/src/components/TaskItem.jsx`** — keep every existing `className`, `aria-label`, and text node exactly as-is (including the dynamically-built `` `task-item__priority-badge task-item__priority-badge--${task.priority}` `` at line 47, which the test suite depends on); only add `btn` classes to the four action buttons:

- Save (line 68) → `className="btn btn--primary btn--sm"`
- Cancel (line 71) → `className="btn btn--secondary btn--sm"`
- Edit (line 86) → `className="btn btn--secondary btn--sm"`
- Delete (line 89) → `className="btn btn--danger btn--sm"`

Wrap the inline-edit error (lines 74–78, `role="alert" className="form-error"`) with the same shared alert styling used elsewhere — either keep `form-error` as an alias in CSS or switch this instance to `alert alert--error` too, applied consistently everywhere `role="alert"` is used in this codebase (`App.jsx`, `TaskForm.jsx`, `TaskItem.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`).

**File: `client/src/index.css`** — rebuild `.task-item` (currently lines 26–33) as a card: `background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: var(--space-4); gap: var(--space-3); flex-wrap: wrap;` (the `flex-wrap` keeps the checkbox/badges/title/actions from overflowing on mobile — see "Edge Cases"). Add CSS-only, non-text icon cues (via `::before { content: ... }` pseudo-elements, which do **not** appear in `element.textContent` and therefore cannot break `getByText`) so priority/status are distinguishable by shape as well as color, on top of the text label that already exists:

```css
.task-item__priority-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}
.task-item__priority-badge--low {
  color: var(--color-low);
  background: var(--color-low-bg);
}
.task-item__priority-badge--low::before {
  content: '▽';
}
.task-item__priority-badge--medium {
  color: var(--color-medium);
  background: var(--color-medium-bg);
}
.task-item__priority-badge--medium::before {
  content: '◆';
}
.task-item__priority-badge--high {
  color: var(--color-high);
  background: var(--color-high-bg);
}
.task-item__priority-badge--high::before {
  content: '▲';
}
```

Do the same `::before` treatment for `.task-item--pending .task-item__badge` / `.task-item--completed .task-item__badge` (existing rules at index.css lines 46–54) so Pending/Completed also carry a shape cue, not only their existing background-color difference. Also add a rule for `.task-item__edit` (currently just `flex: 1` at line 57–58) to lay its input + Save/Cancel buttons out cleanly (`display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;`).

**File: `client/src/components/TaskList.jsx`** — keep `className="task-list__empty"` (line 12) and `className="task-list"` (line 16) as-is; style `.task-list__empty` in `index.css` (currently no rule at all) as a bordered/dashed placeholder panel (`border: 1px dashed var(--color-border); border-radius: var(--radius-md); padding: var(--space-8); text-align: center; color: var(--color-text-muted);`).

### 6 — Buttons, inputs, and shared alert style

**File: `client/src/index.css`** — add the shared classes referenced by Tasks 2–5 above:

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
}
.btn--block {
  width: 100%;
}
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover {
  background: var(--color-primary-hover);
}
.btn--secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.btn--secondary:hover {
  background: var(--color-bg);
}
.btn--danger {
  background: #fff;
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.btn--danger:hover {
  background: var(--color-danger);
  color: #fff;
}
.btn--link {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-weight: 500;
  padding: var(--space-2) 0;
}

input[type='text'],
input[type='email'],
input[type='password'],
select {
  font: inherit;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
  border-color: var(--color-primary);
}

.alert,
.form-error {
  color: var(--color-danger);
  background: var(--color-high-bg);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}
```

Never set `outline: none` without the `:focus-visible` replacement above — keyboard focus must stay visible on every interactive element (buttons, inputs, selects, the status checkbox).

### 7 — Responsive breakpoints

**File: `client/src/index.css`** — add a single mobile breakpoint (e.g. `@media (max-width: 480px)`) that: stacks `.app__header` children (`flex-direction: column; align-items: flex-start;`), makes `.task-form` and `.app__controls` children full-width (`flex-direction: column; align-items: stretch;`), and lets `.task-item` wrap its badges/actions onto their own line (already covered by the `flex-wrap: wrap` from Task 5, but verify visually at 360–400px widths that no control is clipped or overlaps — see "Verification Steps").

---

## Edge Cases & Failure Modes

- **Long task title** — `.task-item__title` (index.css, new rule) must allow wrapping (`overflow-wrap: anywhere; min-width: 0;` and ensure the flex item can shrink, e.g. `.task-item { flex-wrap: wrap; }` from Task 5) so a long title wraps within the card instead of pushing the checkbox/badges/actions off-screen or causing horizontal scroll.
- **Long username** — `client/src/App.jsx`'s `.app__welcome` text and the `.app__header` flex row (Task 3) must wrap/stack (`flex-wrap: wrap`) rather than overflow; the existing `username || 'you'` fallback (`App.jsx` line 108) is unchanged.
- **Long task list (many items)** — `.task-list` (index.css lines 18–24) keeps its natural block flow inside `.app`; do not introduce a fixed-height scroll container that would clip content — the page itself scrolls, consistent with today's behavior.
- **Rapid state transitions (loading → populated / loading → empty / populated → error)** — because `.loading-state`, `.task-list__empty`, `.task-list`, and the `.alert` all reserve their own vertical space via normal flow (no `position: absolute` overlays), switching between them must not cause a visible layout jump beyond the natural reflow of content appearing/disappearing; verify manually per "Verification Steps" step 4.
- **Two different empty messages** (`TaskList.jsx` lines 9, 11–13, and `App.jsx` lines 146–150: `'No tasks yet. Add one above to get started.'` vs. `'No tasks match the selected priority filter.'`) — both must remain the full text content of the same `.task-list__empty` element with no additional sibling text, or `TaskList.test.jsx`'s `getByText(/no tasks yet/i)` (line 8) / exact-string match (line 32) will fail.
- **Priority/status conveyed by more than color** — do not remove the literal `High`/`Medium`/`Low` or `Pending`/`Completed` text (`TaskItem.jsx` lines 44, 48) when adding the `::before` icon cues from Task 5; the icon is additive (via CSS, invisible to `textContent`), the text label is the primary means of the distinction and must stay.
- **Keyboard focus** — every interactive element (buttons, text/email/password inputs, the two `<select>`s, the status checkbox) must show a visible focus indicator (`:focus-visible` rules from Task 6); do not add `outline: none` anywhere without an equivalent replacement.
- **401 during fetch while restyled error alert is showing** — `App.jsx`'s existing `err.status === 401` → `logout()` branches (lines 24–26, 38–40, 50–52, 62–64, 76–78, 88–90) are untouched by this story; only the `<p role="alert">`'s class changes (Task 3), so the alert must still render before the resulting re-render swaps to the login screen.
- **`.task-item__priority-badge` class must survive restyling** — `TaskItem.test.jsx` line 31 resolves the priority text via `{ selector: '.task-item__priority-badge' }`; do not rename, remove, or split this class off the element containing the exact text `High`/`Medium`/`Low`.

---

## Test Plan

No new tests are required by this story — it is a pure restyle and the acceptance criteria are "the existing suite still passes" plus manual visual verification. Re-run the full existing client suite after the change and confirm every test still passes without modification:

1. `client/src/App.test.jsx` — all 11 tests (task load/add/delete/status/priority/filter/sort, login-screen render, 401 logout) — run via `cd client && npm test -- App.test.jsx`.
2. `client/src/components/TaskForm.test.jsx` — all 3 tests (submit, priority selection, empty-title validation).
3. `client/src/components/TaskItem.test.jsx` — all 8 tests, in particular the `.task-item__priority-badge` selector test (line 31) and the `role="alert"` validation test (line 85).
4. `client/src/components/TaskList.test.jsx` — all 3 tests (default empty message, one-item-per-task, custom empty message).
5. `client/src/components/LoginPage.test.jsx` — all 3 tests, in particular `getByRole('button', { name: 'Log In' })` (lines 23, 34) — the button's accessible name must still be exactly `Log In` after restyling.
6. `client/src/components/RegisterPage.test.jsx` — all 3 tests, in particular `getByRole('button', { name: 'Register' })` (lines 24, 38).

If — and only if — a genuinely equivalent accessible-name improvement is made somewhere (none is required by this story), update the corresponding test assertion in the same change and note it in the PR description; otherwise leave every test file untouched.

---

## Verification Steps

1. **Frontend builds:** `cd client && npm run build` — must succeed with no errors.
2. **Frontend tests:** `cd client && npm test` — all existing suites (see "Test Plan") must pass unmodified.
3. **Frontend runs:** `cd client && npm run dev` — manually walk through: register a new account → confirm the styled Register card, field spacing, and button hierarchy; log out and log back in → confirm the styled Login card; add a task with each priority → confirm the task card, priority badge (with icon + color per priority), and status badge render correctly; toggle status, change priority, edit a title (Save and Cancel), delete a task → confirm all still work and the inline-edit state is visually distinct; filter by a priority with no matches → confirm the styled "no tasks match" empty state; clear all tasks → confirm the styled "no tasks yet" empty state; trigger a validation error (empty title) → confirm the styled alert; force a fetch error (e.g. stop the backend) → confirm the styled dashboard-level alert and eventual logout-on-401 still occurs.
4. **Responsive check:** in the browser dev tools, resize the viewport from ~360px up to ~1440px+ (or use device presets) on the Login, Register, and Dashboard screens — confirm no horizontal scrollbar appears, no text is clipped, no control overlaps another, and the header/controls/task-form reflow (stack) at narrow widths per Task 3/4/7.
5. **Keyboard check:** tab through the Login form, Register form, and the Dashboard (add-task form, filter/sort selects, each task's checkbox/priority-select/Edit/Save/Cancel/Delete buttons, Log Out) — confirm a visible focus indicator is shown at every stop.
6. **Regression:** re-confirm the Story 01–04 flows still work end-to-end — task CRUD, status toggle, priority change/filter/sort, login/register/logout, 401-triggered logout, per-user task isolation, and the "Logged in as `<username>`" display.

---

## Done Criteria

- [ ] Login, Register, and the Task Dashboard share one consistent visual language (color, spacing, typography, radius, shadow) driven by a shared token layer in `client/src/index.css`.
- [ ] The app is fully usable and visually correct from ~360px up through ~1440px+ viewports, with no horizontal scroll, clipping, or overlap; the dashboard header does not break with a long username.
- [ ] Buttons have a consistent primary/secondary/danger hierarchy with visible hover/focus/active/disabled states; all text inputs and selects share consistent styling and a visible focus ring.
- [ ] Task cards clearly present title, status, and priority (text label plus color and icon cue); completed tasks are visually de-emphasized beyond default `text-decoration`; inline-edit mode is visually distinct with styled Save/Cancel.
- [ ] The loading state shows a styled indicator; the two empty states ("no tasks yet" vs. "no tasks match the filter") are styled distinctly and remain textually distinct; all validation/fetch error messages use a consistent alert style.
- [ ] All existing behavior (login, registration, logout, add/edit/delete task, toggle status, change priority, filter, sort, per-user isolation, 401-triggered logout) is unchanged, and the full existing client test suite passes without modification (`cd client && npm test`).
- [ ] `cd client && npm run build` succeeds.
- [ ] No changes were made under `server/`, and no new npm dependency was added.
