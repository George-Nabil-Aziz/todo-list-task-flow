# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/frontend-validation/add-frontend-form-validation/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** Add Frontend Form Validation
- **Feature slug (folder under `plans/`):** `frontend-validation`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item id:** `` *(used in filenames and plan tables; fill manually if empty)*
- **Work item type:** ``
- **Status:** ``
- **Assignee:** ``
- **Labels:** ``

External tracker links are **not** followed by the planner. Keep the id for naming and traceability only.

---

## Title

*(Paste the work item title verbatim. Prefilled when `squad new-story` fetched from a tracker.)*

```
Add Frontend Form Validation
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
This story is ONLY for frontend validation of user inputs and forms across the existing Login,
Register, Add Task, and Edit Task forms. It adds client-side field validation, error messaging,
and accessible error states to forms that currently either have no client-side validation
(Login, Register) or only a partial, form-level version of it (Add Task, Edit Task). It does not
touch the backend, API contracts, authentication behavior, or Todo business logic, and it does
not add new product features — only validation UX for existing fields.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
1. Login form (client/src/components/LoginPage.jsx)
   - Email is required.
   - Email must have a valid email format.
   - Password is required.
   - Show clear validation messages.
   - Show a clear visual error state on invalid inputs.
   - Do not show validation errors aggressively before the user interacts with the form
     (i.e. no errors on initial render; validate on submit and/or on blur/change after the
     user has touched the field, not before).

2. Register form (client/src/components/RegisterPage.jsx)
   - Username is required.
   - Username must not be empty or whitespace-only.
   - Email is required.
   - Email must have a valid email format.
   - Password is required.
   - Password must satisfy the existing frontend password requirements, if any (see Extra
     notes: none currently exist client-side — confirm before assuming a rule).
   - Show clear validation messages.
   - Show clear visual error states.

3. Add Task form (client/src/components/TaskForm.jsx)
   - Task title is required.
   - Whitespace-only titles are invalid.
   - Trim the title before validation/submission where appropriate.
   - Priority selection should remain compatible with existing behavior (no change to the
     priority `<select>` or its values).
   - Prevent submitting the form when the title is invalid.
   - Show a clear validation message.
   (Note: TaskForm already has this exact rule implemented at a basic level — see Extra notes.
   Preserve and extend it rather than replacing it.)

4. Edit Task (client/src/components/TaskItem.jsx, inline edit mode)
   - Apply the same title validation rules as Add Task.
   - Prevent saving an empty or whitespace-only title.
   - Show a clear validation message.
   (Note: TaskItem's inline edit already has this exact rule implemented at a basic level —
   see Extra notes. Preserve and extend it rather than replacing it.)

5. Validation UX
   - Validation errors should appear near the relevant input (per-field, not just a single
     page-level banner).
   - Invalid inputs should have a clear visual error state.
   - Errors should disappear when the user corrects the input.
   - Do not unnecessarily change existing business logic or API behavior.
   - Do not introduce backend validation in this story.

6. Accessibility
   - Use aria-invalid on invalid inputs.
   - Associate validation messages with their inputs using aria-describedby where appropriate.
   - Keep labels correctly associated with inputs (all four forms already use htmlFor/id or
     aria-label — preserve these associations).
   - Ensure validation messages are accessible to screen readers (e.g. role="alert" or an
     equivalent live region, consistent with the existing role="alert" pattern already used
     for the page-level/form-level error messages).
   - Maintain visible keyboard focus states (do not regress the recently-fixed focus-ring
     behavior in client/src/index.css).

7. Testing
   - Add/update frontend tests (Vitest + @testing-library/react) for all validation rules
     above.
   - Test valid and invalid values.
   - Test empty and whitespace-only values.
   - Test that invalid forms cannot be submitted.
   - Test that validation errors disappear after correcting the input.
   - Keep all existing frontend tests passing (see existing test files listed in Technical
     hints) — do not weaken or delete existing assertions to make new ones pass.
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

- **Blocked by / related ids:** None.
- **Depends on code areas or other stories:**
  - `client/src/components/LoginPage.jsx`, `LoginPage.test.jsx`
  - `client/src/components/RegisterPage.jsx`, `RegisterPage.test.jsx`
  - `client/src/components/TaskForm.jsx`, `TaskForm.test.jsx`
  - `client/src/components/TaskItem.jsx`, `TaskItem.test.jsx`
  - `client/src/context/AuthContext.jsx` (read-only reference; `login`/`register` are called
    only after validation passes — no change expected here)
  - `client/src/index.css` (new per-field error-message and invalid-input visual states need
    to be added; none currently exist)
  - Depends on the recently completed dark-mode focus-ring fix in `index.css` — new invalid
    states must not reintroduce a competing `box-shadow`/`outline` rule the same way the old
    focus bug did.

## Extra notes (optional)

- Findings from inspecting the current implementation before writing this intake:
  - **Login/Register forms have zero client-side validation today.** `handleSubmit` calls
    `login()`/`register()` directly with whatever is in state; the only user-visible error
    is a single page-level `role="alert"` banner populated from a rejected promise (i.e. the
    backend's error message). Inputs use `type="email"`/`type="password"` but are not marked
    `required`, and the `<form>` elements do not set `noValidate`, so the browser's native
    HTML5 validation UI could still fire for the `type="email"` field on submit. The plan
    should decide explicitly whether to add `noValidate` to suppress native browser bubbles
    in favor of the new custom per-field messages (recommended, for a consistent UI).
  - **No existing frontend password complexity rule exists.** The backend
    (`server/src/routes/auth.js`) enforces a minimum password length of 6 characters, but
    this is a backend rule only — nothing in the client mirrors it today. Acceptance
    criterion 2's "if any" should therefore currently resolve to "password is required,
    nothing more" unless the story owner decides to newly mirror the backend's 6-character
    minimum as a frontend pre-check (that would be a product decision, not something implied
    by "existing" frontend behavior — flag this explicitly in the plan rather than assuming).
  - **Add Task and Edit Task already implement the empty/whitespace-only title rule**,
    including trimming before calling `onAdd`/`onEdit`, a form-level error message, and a
    test for it. The gap in both is that the error, once set, is not cleared as the user
    edits the field afterward — it only clears on the next successful submit. The new work
    should make errors clear on correction (per AC 5) without duplicating the existing
    trim/empty check that already works.
  - **No CSS for invalid/error states exists anywhere in `index.css`.** There's no
    `:invalid`, `[aria-invalid]`, or per-field error-text styling — only the generic
    `.alert`/`.form-error` banner components and the plain `.input-group`/`input` focus
    styles. New styling is needed for a per-field error message and an invalid-input border/
    indicator in both Light and Dark Mode, consistent with the existing design system
    (see the memory note: this app expects bold, professional SaaS-level visual design, not
    a bare-minimum restyle).
  - The priority `<select>` controls (Add Task's standalone select, and TaskItem's
    `.task-item__priority-select` overlay control) are explicitly out of scope for new
    validation — they always have a valid selected value by construction.

## Technical hints (optional)

- APIs, screens, services already discussed. Repos/roots: `.`. Primary language: `JavaScript`.
- Frontend stack: React 18, plain CSS (no CSS framework/component library). Test stack:
  Vitest + @testing-library/react + jsdom, run via `npm test` in `client/`.
- Existing frontend test files to keep passing: `client/src/api/authApi.test.js`,
  `client/src/App.test.jsx`, `client/src/components/LoginPage.test.jsx`,
  `client/src/components/RegisterPage.test.jsx`, `client/src/components/TaskForm.test.jsx`,
  `client/src/components/TaskItem.test.jsx`, `client/src/components/TaskList.test.jsx`,
  `client/src/components/ThemeToggle.test.jsx`, `client/src/hooks/useTheme.test.js`.
- No shared form-validation utility currently exists in the client — the plan should decide
  whether to add one small shared helper (e.g. an email-format check) reused by Login and
  Register, versus inlining per component, given there are only two forms that need an email
  check.

## Out of scope

- What this story explicitly does **not** cover:
  - Any change to the backend (`server/`), including its existing password-length check.
  - Any change to API endpoints or request/response contracts.
  - Any change to authentication behavior (token handling, session logic, login/register
    success paths).
  - Any change to Todo business logic (task CRUD, status, priority, sorting/filtering).
  - Any new product feature (e.g. password strength meters, confirm-password fields, email
    verification) beyond what's needed to validate the fields that already exist today.
  - Any UI redesign beyond what's necessary to display validation states and messages.
