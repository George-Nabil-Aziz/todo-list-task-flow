# Story 07 — Add Dark Mode

## Prerequisites

- Story 06 completed: [../improve-todo-ui/06-story-visual-redesign.md](../improve-todo-ui/06-story-visual-redesign.md) — this story extends the CSS custom-property ("design token") system Story 06 built in `client/src/index.css` (the richer indigo/violet color set, `.btn*`/`.alert`/`.field*`/`.auth-*`/`.task-item*`/`.panel`/`.badge` class conventions, and the `icons.jsx` inline-SVG icon set). It does not require reworking that token system, only adding a second, dark value set for the same token names.
- Stories 01–05 ([../add-todo-task/01-story-todo-tasks.md](../add-todo-task/01-story-todo-tasks.md), [../add-user-authentication/02-story-user-login-and-registration.md](../add-user-authentication/02-story-user-login-and-registration.md), [../add-task-priorities/03-story-task-priorities.md](../add-task-priorities/03-story-task-priorities.md), [../add-username/04-story-username-login-support.md](../add-username/04-story-username-login-support.md), [../improve-todo-ui/05-story-improve-todo-ui.md](../improve-todo-ui/05-story-improve-todo-ui.md)) are already implemented and superseded visually by Story 06; this story does not change any behavior from them.

---

## Story Goal

Add a Light/Dark theme to the app, purely as presentation on top of the existing token system, with no change to any existing behavior:

1. A visible, keyboard-operable, accessible theme toggle is reachable from the Login screen, the Register screen, and the Task Dashboard.
2. On first visit with no stored preference, the app renders using the OS/browser's `prefers-color-scheme`. Once the user explicitly toggles a theme, that explicit choice is persisted (`localStorage`) and wins over the system preference on every later visit, including after a full refresh.
3. Switching themes applies to the entire visible UI — Login, Register, and the Task Dashboard (header, add-task form, filter/sort controls, task cards, inline edit mode, badges, buttons, inputs, alerts, loading/empty states) — via the same CSS custom properties every component already consumes, not per-component overrides.
4. The switch uses a short, subtle CSS transition (already-existing `--transition-base`/`--transition-fast` tokens), with no flash of the wrong theme on initial page load.
5. Dark-mode colors keep at least WCAG AA contrast and the app stays fully responsive ~360px–1440px+ in both themes.
6. Dark Mode is a deliberately designed second theme, not a naive light-to-dark value inversion — see "Design Bar — Premium, Layered Dark Mode" below.

**Implementation approach — no React Context.** `client/src/context/AuthContext.jsx` (lines 1–44) is the only existing context in the app, and it is a real `createContext`/`Provider` pair mounted once in `client/src/main.jsx` (lines 7–13). This story does **not** add a matching `ThemeProvider`, because `client/src/App.test.jsx` (lines 25–150), `client/src/components/LoginPage.test.jsx` (lines 8–47), and `client/src/components/RegisterPage.test.jsx` (lines 8–51) all `render(<App />)` / `render(<LoginPage .../>)` / `render(<RegisterPage .../>)` directly, with no provider wrapper at all (they mock `AuthContext` entirely instead of wrapping a real provider). Since `App`, `LoginPage`, and `RegisterPage` are never simultaneously mounted (the app always shows exactly one of them, per `App.jsx` lines 216–229), a plain custom hook that reads/writes a shared source of truth (`localStorage` + the `<html>` element's `data-theme` attribute) is sufficient and needs no Provider — it works identically whether the component is mounted standalone in a test or inside the real app, so no existing test file needs a new wrapper.

---

## Design Bar — Premium, Layered Dark Mode

The user reviewed the original design and explicitly rejected a "swap light values for dark values" outcome. The bar is a **modern, premium appearance comparable to Linear, Raycast, Vercel, or a contemporary SaaS dashboard** — this is a visual-design requirement only; it changes CSS values and adds a couple of dark-only CSS rules, nothing else, and introduces no new business functionality. Concretely, this means the dark palette in Task 5 below is a **from-scratch dark design**, not a derived inversion, and it is deliberately **richer than Light Mode in specific, targeted places**, not merely recolored:

1. **Layered surfaces with real depth.** Dark Mode gets four distinct luminance steps instead of reusing Light Mode's two (`--color-bg`/`--color-surface`): a near-black page background (`--color-bg`), a slightly lifted card/panel surface (`--color-surface`), a muted/completed-state surface (`--color-surface-muted`), and a new **`--color-surface-hover`** step (a token that only exists in the dark palette) for interactive hover/raised states. This app has no modal/popover surface today (confirmed: no such component exists in `client/src/components/`), so no token or CSS is added for one — the four steps above are the full depth ladder this UI actually needs; a future overlay surface would slot in as a fifth step without disturbing this one.
2. **Vibrant, carefully chosen accent colors.** The dark primary/accent/semantic hues (Task 5) are their own selections tuned for legibility and vividness against a near-black background (verified below), not the Light Mode hues with lightness flipped.
3. **Shadows and elevation tuned specifically for dark surfaces.** Light Mode's shadow tokens use soft, low-opacity navy (`rgba(23, 26, 43, ...)`) because that reads as elevation on a pale background; that same rgba is nearly invisible on a near-black background. The dark `--shadow-*` tokens (Task 5) use higher-opacity black plus a **1px hairline highlight ring** (`0 0 0 1px rgba(255, 255, 255, 0.03–0.04)`) on `--shadow-md`/`--shadow-lg` — a standard technique in the referenced products for giving a dark card a crisp, defined edge against a dark page background, since a soft shadow alone barely reads there.
4. **Richer hover/active/focus states than Light Mode.** A handful of small, dark-only CSS rules (grouped at the end of Task 5, each scoped with the `:root[data-theme='dark']` prefix so they never affect Light Mode) add treatment Light Mode does not have: task cards gain a visible background lift on hover (`--color-surface-hover`), the primary button gains a more vivid glow on hover, secondary buttons hover into the new raised surface, badges gain a hairline `currentColor` border, and alerts gain a left accent bar — all on top of the same base rules from Task 5, using CSS specificity (an extra `:root[data-theme='dark']` attribute selector) rather than duplicating whole rule blocks.
5. **Contrast stays verified, not assumed.** The two highest-traffic text/background pairs were computed by hand (WCAG relative-luminance formula) against the final dark values chosen in Task 5: body text `#eef0f7` on page background `#08090c` ≈ 17.5:1, and primary color `#8b8cf9` used as text/icon color on card surface `#111318` ≈ 6.4:1 — both comfortably clear the WCAG AA bar (4.5:1) carried over from the Story Goal.

---

## Context — Read These Files First

1. `client/src/index.css` (all 1114 lines) — the `:root { ... }` token block (lines 1–79) defining every color/space/radius/shadow/font-size/transition token; `body` (lines 91–102, no `transition` today); `.task-item` (lines 640–652, its `transition` at line 650 lists `box-shadow`/`transform`/`border-color` but not `background-color`/`color`); `.priority-control` (lines 783–789, its `transition` at line 788 lists only `box-shadow`); `input[type='text'], input[type='email'], input[type='password'], select` (lines 976–987, its `transition` at line 986 lists only `border-color`/`box-shadow`); the reduced-motion override (lines 139–146, already zeroes all transition/animation durations — dark-mode transitions inherit this for free); `.badge` (lines 752–762, `border: 1px solid transparent` at line 761, overridden to `currentColor` in dark mode); `.btn--primary`/`.btn--secondary`/`.btn--primary:hover` (lines 913–935); `.alert`/`.form-error` (lines 1015–1041); the final `@media (max-width: 480px)` block (lines 1077–1113, end of file) — the new "Dark mode refinements" rule group in Task 5 is appended after it.
2. `client/index.html` (all 13 lines) — `<head>` (lines 3–7); add a blocking inline script here, before `main.jsx` (a `type="module"` script, which is deferred) ever runs, so the correct theme is set before first paint.
3. `client/src/main.jsx` (all 14 lines) — confirms there is exactly one context provider (`AuthProvider`, line 9) wrapping `<App />`; no theme provider is added here (see "Implementation approach" above).
4. `client/src/App.jsx` (all 232 lines) — `TaskDashboard` (lines 12–214), its header's `app__header-top` block (lines 114–133) where the toggle is added next to the existing `Log Out` button (lines 129–132); the `App` component's login/register/dashboard switch (lines 216–229) confirming the three screens are mutually exclusive.
5. `client/src/components/LoginPage.jsx` (all 120 lines) — the outer `<div className="auth-page">` (lines 27–28) where the corner toggle is added as the first child. Note: lines 63 and 65 use typo'd classes `fielddd`/`input-groupss` (not `field`/`input-group`) on the email field — this is a pre-existing, unrelated bug; do **not** fix it as part of this story.
6. `client/src/components/RegisterPage.jsx` (all 121 lines) — the outer `<div className="auth-page">` (lines 22–23), same toggle placement as `LoginPage.jsx`.
7. `client/src/components/icons.jsx` (all 203 lines) — the `base(props)` helper (lines 5–19, sets `aria-hidden`/`focusable="false"` so icons never affect accessible names) and the exported icon function pattern (e.g. `ClockIcon`, lines 76–83) to mirror for two new icons, `SunIcon`/`MoonIcon`.
8. `client/src/context/AuthContext.jsx` (all 44 lines) and `client/src/auth/tokenStorage.js` (all 26 lines) — the existing `localStorage`-wrapper pattern (`getToken`/`setToken`, lines 4–10 of `tokenStorage.js`) that the new theme storage helpers mirror.
9. `client/src/App.test.jsx` (all 151 lines, especially `beforeEach` at lines 13–23), `client/src/components/LoginPage.test.jsx` (all 47 lines, `beforeEach` at lines 11–15), `client/src/components/RegisterPage.test.jsx` (all 51 lines, `beforeEach` at lines 11–15) — none mocks `window.matchMedia` and `client/src/setupTests.js` (1 line, only imports `@testing-library/jest-dom`) sets up nothing else; new code must feature-detect `window.matchMedia` rather than assume it exists, and the new/modified tests below must reset `localStorage` and the `<html>` element's `data-theme` attribute in each file's existing `beforeEach` so real browser-global state doesn't leak between tests.
10. `client/node_modules/@testing-library/react/dist/pure.js` — confirms the installed `@testing-library/react@16.3.2` exports `renderHook`, used by the new hook test.

---

## Frontend Tasks

No backend changes required — this story does not touch `server/`.

### 1 — Theme hook and persistence

**Create file: `client/src/hooks/useTheme.js`** — a plain hook, no Context/Provider (see "Implementation approach" above):

```js
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'todo_theme_preference';

function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function persistTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable (e.g. private browsing) — theme still applies for this session.
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }

  return { theme, toggleTheme };
}
```

### 2 — Prevent a flash of the wrong theme on load

**File: `client/index.html`** — add a blocking (non-`module`) script inside `<head>`, before the closing `</head>` at line 7, so it runs and sets the attribute before `main.jsx` (a deferred `type="module"` script) mounts React or applies any CSS:

```html
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('todo_theme_preference');
          var theme =
            stored === 'light' || stored === 'dark'
              ? stored
              : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
          document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      })();
    </script>
```

The storage key (`'todo_theme_preference'`) must stay in sync with `STORAGE_KEY` in `client/src/hooks/useTheme.js` — they intentionally duplicate the literal because this script runs before any JS module (and its exports) exist.

### 3 — Sun/Moon icons

**File: `client/src/components/icons.jsx`** — append two new icons after `SpinnerIcon` (after line 202), following the existing `base(props)` pattern (lines 5–19):

```jsx
export function SunIcon(props) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}
```

### 4 — Theme toggle component

**Create file: `client/src/components/ThemeToggle.jsx`**:

```jsx
import { MoonIcon, SunIcon } from './icons.jsx';

function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle ${className}`.trim()}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default ThemeToggle;
```

`role="switch"` + `aria-checked` exposes both the toggle's purpose and current state to assistive technology; the icon itself is `aria-hidden` (via `base(props)`), so it never contributes to the button's accessible name — the `aria-label` is the sole accessible name.

### 5 — Dark token set and transitions in `index.css`

**File: `client/src/index.css`**:

- Insert a new rule immediately after the `:root { ... }` block's closing `}` (after line 79), before the `*, *::before, *::after` rule (line 81):

```css
:root[data-theme='dark'] {
  /* Brand — its own vivid dark-mode selection, not a lightness-flip of Light Mode */
  --color-primary: #8b8cf9;
  --color-primary-dark: #b4b6ff;
  --color-primary-light: rgba(139, 140, 249, 0.28);
  --color-accent: #2ee6c8;
  --color-accent-light: rgba(46, 230, 200, 0.2);

  /* Layered neutrals — four distinct depth steps (bg < surface < surface-muted / surface-hover) */
  --color-bg: #08090c;
  --color-bg-alt: #0d0f14;
  --color-surface: #111318;
  --color-surface-muted: #161922;
  --color-surface-hover: #1c202b;
  --color-border: #262b38;
  --color-border-strong: #3a4256;
  --color-text: #eef0f7;
  --color-text-muted: #a8afc4;
  --color-text-faint: #6f7690;

  /* Semantic — brighter than Light Mode's saturated-on-pastel pairing, tuned for a near-black surface */
  --color-danger: #ff6b81;
  --color-danger-dark: #ffb4c0;
  --color-danger-bg: rgba(255, 107, 129, 0.14);
  --color-success: #2fe6a5;
  --color-success-bg: rgba(47, 230, 165, 0.14);
  --color-warning: #ffc857;
  --color-warning-bg: rgba(255, 200, 87, 0.14);

  --color-high: #ff6b81;
  --color-high-bg: rgba(255, 107, 129, 0.14);
  --color-medium: #ffc857;
  --color-medium-bg: rgba(255, 200, 87, 0.14);
  --color-low: #2fe6a5;
  --color-low-bg: rgba(47, 230, 165, 0.14);

  --color-pending: #6ea8ff;
  --color-pending-bg: rgba(110, 168, 255, 0.14);
  --color-completed: #2ee6c8;
  --color-completed-bg: rgba(46, 230, 200, 0.14);

  /* Shadows — higher-opacity black (Light Mode's soft navy rgba is invisible on near-black) plus a
     1px hairline highlight ring on the two "raised" shadow steps, for a crisp card edge against
     a dark page background (the technique behind Linear/Raycast/Vercel-style dark elevation). */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.55), 0 1px 2px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 10px 24px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03);
  --shadow-lg: 0 24px 48px rgba(0, 0, 0, 0.7), 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04);
  --shadow-primary: 0 12px 28px rgba(139, 140, 249, 0.4), 0 0 0 1px rgba(139, 140, 249, 0.15);
}
```

  `--gradient-primary` and `--gradient-radial` are deliberately **not** overridden: the header banner (`.app__header`, uses `#fff` text hardcoded) and the auth brand panel (`.auth-brand`, also hardcoded `#fff` text) already render on a fixed vivid gradient in both themes today, so they need no dark variant — this is intentional, not a missed token.

  `--color-surface-hover` is a **new token that exists only in the dark palette** (Light Mode's hover states use `transform`/`box-shadow` only, per Story 06, and keep doing so unchanged) — it is consumed exclusively by the dark-only refinement rules added at the end of this task.

- `body` (lines 91–102): add a `transition` declaration (it currently has none) so the page background/text animate on toggle:

```css
  transition: background-color var(--transition-base), color var(--transition-base);
```

- `.task-item` (line 650): change the existing `transition` to also include `background-color` and `color` (it changes on theme toggle via `--color-surface`/`--color-text-faint`, but nothing in the current list animates it):

```css
  transition: background-color var(--transition-base), color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base), border-color var(--transition-base);
```

- `.priority-control` (line 788): change the existing `transition` to also include `background-color` and `color`:

```css
  transition: background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
```

- `input[type='text'], input[type='email'], input[type='password'], select` (line 986): change the existing `transition` to also include `background-color` and `color`:

```css
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
```

- Add one new rule (none of these selectors has a `transition` today) — place it right after the `@media (prefers-reduced-motion: reduce)` block (after line 146), before the `/* Auth screens */` comment (line 148):

```css
.panel,
.auth-shell,
.badge,
.alert,
.form-error,
.skeleton-card,
.stat-card,
.task-list__empty {
  transition: background-color var(--transition-base), color var(--transition-base), border-color var(--transition-base);
}
```

- Add a new rule for the toggle itself and its two placement variants, alongside the other component sections (e.g. after the `/* Buttons */` section, after line 970, before `/* Inputs */` at line 972):

```css
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.theme-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.theme-toggle:active {
  transform: scale(0.92);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-toggle--on-brand {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
}

.theme-toggle--on-brand:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.theme-toggle--corner {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 2;
}
```

  `.auth-page` (line 152) already has `position: relative`, so `.theme-toggle--corner` positions correctly inside it without further changes.

- Add `.app__header-actions` next to the existing `.app__header-top`/`.app__title` rules (after line 382, before line 384's `.app__title-icon`):

```css
.app__header-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
```

- Add a final new rule group, **"Dark mode refinements"**, at the very end of `index.css` (after the last `@media (max-width: 480px)` block). Every selector here is prefixed with `:root[data-theme='dark']`, which gives each rule higher specificity than the base rule it layers on top of (e.g. `:root[data-theme='dark'] .task-item:hover` beats `.task-item:hover`), so these rules only ever add or override the specific properties they declare — they never apply in Light Mode and never need a Light Mode counterpart:

```css
/* ---------------------------------- */
/* Dark mode refinements               */
/* (extra depth/richness with no Light Mode equivalent, per the "Design Bar" requirement) */
/* ---------------------------------- */

:root[data-theme='dark'] .task-item:hover {
  background: var(--color-surface-hover);
}

:root[data-theme='dark'] .btn--secondary:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

:root[data-theme='dark'] .btn--primary {
  box-shadow: var(--shadow-primary), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

:root[data-theme='dark'] .btn--primary:hover:not(:disabled) {
  box-shadow: 0 14px 32px rgba(139, 140, 249, 0.5), 0 0 0 1px rgba(139, 140, 249, 0.25);
}

:root[data-theme='dark'] .badge {
  border-color: currentColor;
}

:root[data-theme='dark'] .alert,
:root[data-theme='dark'] .form-error {
  border: 1px solid rgba(255, 107, 129, 0.35);
  border-left: 3px solid var(--color-danger);
}

:root[data-theme='dark'] input:focus-visible,
:root[data-theme='dark'] select:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-light), 0 0 0 1px var(--color-primary);
}

:root[data-theme='dark'] .theme-toggle:hover {
  box-shadow: 0 0 12px var(--color-primary-light);
}
```

  Property-by-property, each rule only touches what it declares and leaves everything else from the base rule (Task 5's earlier edits, or the pre-existing Story 06 rules) in place: `.task-item:hover`'s existing `transform`/`box-shadow`/`border-color` (unchanged from Task 5) still apply alongside the new `background`; `.btn--primary`'s `background`/`color` (Story 06) and `:hover`'s existing `filter`/`transform` (Story 06) still apply alongside the richer `box-shadow`; `.badge`'s existing `border: 1px solid transparent` (Story 06) is overridden only on `border-color`, so every status/priority badge (`--color-pending`, `--color-completed`, `--color-high`, `--color-medium`, `--color-low` — all already set as that badge's `color`) gets a matching hairline outline "for free" via `currentColor`, with no per-badge-variant CSS needed.

No changes are needed to `client/src/components/TaskItem.jsx`, `TaskList.jsx`, or `TaskForm.jsx` — every color they render comes from the CSS classes above via tokens (confirmed: no literal hex/rgb colors exist in any `.jsx` file under `client/src` except the unrelated `style={{ paddingLeft: "40px" }}` in `LoginPage.jsx` line 70, which is a spacing value, not a color).

### 6 — Wire the toggle into Login, Register, and the Dashboard

**File: `client/src/components/LoginPage.jsx`** — add imports and mount the toggle as the first child of `.auth-page`:

```jsx
import { useTheme } from "../hooks/useTheme.js";
import ThemeToggle from "./ThemeToggle.jsx";
```

```jsx
function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  ...
  return (
    <div className="auth-page">
      <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle--corner" />
      <div className="auth-shell">
```

**File: `client/src/components/RegisterPage.jsx`** — identical pattern (same imports, same `useTheme()` call, same `<ThemeToggle .../>` placed as the first child of `.auth-page`, lines 22–23).

**File: `client/src/App.jsx`** — add imports:

```jsx
import { useTheme } from './hooks/useTheme.js';
import ThemeToggle from './components/ThemeToggle.jsx';
```

Inside `TaskDashboard` (after line 13's `const { logout, username } = useAuth();`):

```jsx
  const { theme, toggleTheme } = useTheme();
```

Replace the existing `Log Out` button (lines 129–132) with:

```jsx
          <div className="app__header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle--on-brand" />
            <button onClick={logout} className="btn btn--ghost">
              <LogOutIcon />
              Log Out
            </button>
          </div>
```

---

## Edge Cases & Failure Modes

- `window.matchMedia` does not exist or throws (e.g. under `jsdom` in tests, which has no implementation) → `getSystemTheme` in `client/src/hooks/useTheme.js` feature-detects with `typeof window.matchMedia !== 'function'` and wraps the call in `try/catch`, falling back to `'light'`.
- `localStorage` is unavailable or throws (e.g. private browsing with storage disabled) → `getStoredTheme`/`persistTheme` in `client/src/hooks/useTheme.js` wrap every call in `try/catch`; the hook falls back to the system theme on every mount and toggling still works in-memory for that page load, it just does not persist across reloads.
- No stored preference and the OS theme changes while the app is already open → not live-synced; the hook only reads `matchMedia` once at initial mount. This is a deliberate scope decision (the intake's persistence/system-preference acceptance criteria only require the initial-load behavior, not a live subscription), not a missed case.
- An explicit stored preference already exists and the OS theme changes → the stored preference is never re-read from `matchMedia` after mount, so the explicit choice keeps winning, satisfying the "keep honoring the stored preference" acceptance criterion by construction.
- Multiple tabs open at once → each tab's `useTheme()` only reads `localStorage` on its own mount; a change in one tab does not push into another already-open tab, and no error occurs in either tab (per intake, live cross-tab sync is out of scope).
- Rapid toggling → `--transition-base`/`--transition-fast` are both under 250ms and the existing `@media (prefers-reduced-motion: reduce)` rule (`client/src/index.css` lines 139–146) already zeroes every `transition`/`animation` duration app-wide, so this also covers the new theme transition with no extra code.
- The blocking script in `client/index.html` and `STORAGE_KEY` in `client/src/hooks/useTheme.js` both hardcode the literal `'todo_theme_preference'` — if one changes without the other, the anti-flash script and the React hook fall out of sync (the page would flash the previous theme once per session). Keep them identical if this key is ever renamed.
- Login/Register screens below the `900px` breakpoint hide `.auth-brand` entirely (`client/src/index.css` lines 1047–1060) — the toggle is placed on `.auth-page` itself (not inside `.auth-brand`), so it stays visible and reachable at every width, including the collapsed single-column mobile layout.
- The "Dark mode refinements" rules (Task 5) all use the `:root[data-theme='dark']` attribute-selector prefix, which is strictly additive specificity over the base selector it targets (e.g. `.task-item:hover`) — they cannot accidentally apply when `data-theme` is `'light'` or unset, and they cannot be accidentally weaker than the base rule regardless of source order, so Light Mode's existing hover/focus/badge/alert/button appearance (Story 06) is guaranteed unchanged by this story.
- `--color-surface-hover` has no Light Mode definition and must never be referenced from an unscoped (theme-agnostic) rule — every reference to it in Task 5 is inside a `:root[data-theme='dark'] ...` selector, so the variable is always defined wherever it is used; referencing it from a base rule would make that property resolve to nothing in Light Mode.

---

## Test Plan

Frontend (Vitest + React Testing Library), under `client/`:

1. **Create file: `client/src/hooks/useTheme.test.js`** — using `renderHook`/`act` from `@testing-library/react` (confirmed exported by the installed `@testing-library/react@16.3.2`): defaults to the system theme via `window.matchMedia` (mock it to return `matches: true` for `(prefers-color-scheme: dark)`) when `localStorage` has no stored value; defaults to `'light'` when `window.matchMedia` is deleted/undefined and there is no stored value; prefers an existing stored `'dark'`/`'light'` value over the system theme; `toggleTheme()` flips the returned `theme` and calls `localStorage.setItem('todo_theme_preference', ...)`; `toggleTheme()` sets `document.documentElement`'s `data-theme` attribute to match; `toggleTheme()` does not throw when `localStorage.setItem` throws (spy and mock it to throw). Reset `localStorage` and `document.documentElement`'s `data-theme` attribute in a `beforeEach`.
2. **Create file: `client/src/components/ThemeToggle.test.jsx`** — renders with `role="switch"`; `theme="light"` renders `aria-checked="false"` and an accessible name of `"Switch to dark mode"`; `theme="dark"` renders `aria-checked="true"` and an accessible name of `"Switch to light mode"`; clicking the button calls the `onToggle` prop.
3. `client/src/App.test.jsx` (modify) — extend the `beforeEach` (lines 13–23) with `localStorage.clear()` and `document.documentElement.removeAttribute('data-theme')`; add a test that the dashboard renders a `role="switch"` element and clicking it toggles `document.documentElement`'s `data-theme` attribute between `'light'` and `'dark'`.
4. `client/src/components/LoginPage.test.jsx` (modify) — extend the `beforeEach` (lines 11–15) the same way; add a test that the Login screen renders a `role="switch"` element and clicking it toggles `document.documentElement`'s `data-theme` attribute.
5. `client/src/components/RegisterPage.test.jsx` (modify) — same addition as `LoginPage.test.jsx`, mirroring its `beforeEach` (lines 11–15).

No changes needed to `client/src/components/TaskItem.test.jsx`, `TaskList.test.jsx`, or `TaskForm.test.jsx` — those components receive no new props or markup from this story.

---

## Verification Steps

1. **Frontend builds:** `cd client && npm test` — full suite (existing + new `useTheme.test.js`, `ThemeToggle.test.jsx`) passes.
2. **Frontend builds:** `cd client && npm run build` succeeds.
3. **Frontend runs:** `cd client && npm run dev` — with no `localStorage` value set, confirm the app matches the OS theme on load; toggle on the Login screen, refresh, and confirm the explicit choice (not the OS theme) persists; log in and confirm the Task Dashboard, task cards, badges, buttons, inputs, and alerts are all legible in Dark Mode; toggle back to Light and confirm the same for every screen.
4. **Manual accessibility/responsive pass:** at ~360px, ~768px, and ~1440px+ widths in both themes — confirm the toggle stays reachable and keyboard-operable (Tab to it, Enter/Space to activate), every focus outline stays visible, and use a browser contrast checker on the priority/status badge pill combinations (`--color-high`/`--color-medium`/`--color-low`/`--color-pending`/`--color-completed` text over their `-bg` tokens) to confirm at least 4.5:1 in Dark Mode.
5. **Manual design-bar pass (Dark Mode only):** confirm — task cards visibly lift to `--color-surface-hover` on hover (not just the existing translate/shadow); the primary button (Log In/Register/Add/Save) shows a brighter glow on hover than at rest; status/priority badges show a faint hairline border matching their text color; the error `.alert` shows a left accent bar; input/select focus rings look brighter than Light Mode's; and, side by side with Light Mode, Dark Mode reads as a deliberately designed second theme (own accent vibrancy, own shadow/elevation treatment) rather than an inverted copy — the bar is a contemporary SaaS dashboard (Linear/Raycast/Vercel-style), suitable for a portfolio/demo.
6. **Regression:** re-run the Story 01–06 flows (login/register/logout, add/edit/delete/toggle-status a task, change priority, filter, sort) in both themes, confirming no behavior differs from before this story.

---

## Done Criteria

- [ ] A labeled, keyboard-operable theme toggle (`role="switch"`, `aria-checked`, `aria-label`) is present on Login, Register, and the Task Dashboard.
- [ ] With no stored preference, the app matches `prefers-color-scheme` on first load; once toggled, the explicit choice persists across a full refresh and overrides the system preference thereafter.
- [ ] No visible flash of the wrong theme on initial page load (`client/index.html` blocking script).
- [ ] Every screen and component (Login, Register, Dashboard header, add-task form, filter/sort, task cards, inline edit, buttons, inputs, alerts, priority badges, status indicators, loading/empty states) is fully styled and legible in Dark Mode via the shared token system, not per-component overrides.
- [ ] Theme changes animate with the existing `--transition-base`/`--transition-fast` durations and respect `prefers-reduced-motion` (inherited from the existing rule, no new code).
- [ ] No component under `client/src` hardcodes a literal color that bypasses the token system (confirmed by the discovery grep; stays true after this change).
- [ ] Dark Mode is a from-scratch dark palette (own primary/accent/semantic hues, own shadow/elevation values), not a lightness-inverted copy of Light Mode's tokens, with layered surfaces (`--color-bg`/`--color-surface`/`--color-surface-muted`/`--color-surface-hover`) and dark-specific hover/active/focus richness on task cards, buttons, badges, alerts, and inputs (the "Dark mode refinements" rule group).
- [ ] `npm run build` and `npm test` in `client/` both succeed, including the new `useTheme.test.js` and `ThemeToggle.test.jsx` and the extended `App.test.jsx`/`LoginPage.test.jsx`/`RegisterPage.test.jsx`.
- [ ] No existing behavior (login, registration, logout, add/edit/delete task, toggle status, change priority, filter, sort, per-user isolation) changes in either theme, and no `server/` files change.
