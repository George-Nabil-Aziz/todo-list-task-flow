# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/add-username/username-login-support/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** Username Display Name
- **Feature slug (folder under `plans/`):** `add-username`

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
Username login support
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
Add a username field to user accounts, shown in the app UI so a
logged-in user can see who they're logged in as. This is a
DISPLAY-ONLY addition, not a new login mechanism:

- Registration collects a username in addition to the existing
  email + password.
- Username is required at registration (cannot be empty/whitespace
  after trimming), but does NOT need to be unique across users —
  it is not a lookup key, just a label.
- Login continues to work exactly as it does today: email + password
  only. There is no "login with username" path in this story.
- Once logged in, the task dashboard header shows the current user's
  username (e.g. "Logged in as <username>"), near the existing
  Log Out button.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
- [ ] POST /api/auth/register requires a non-empty (post-trim)
      `username` in addition to email + password; a missing or
      whitespace-only username is rejected with 400.
- [ ] Two different users may register with the same username value
      — it is not checked for uniqueness and does not affect the
      existing duplicate-email check.
- [ ] The register/login response's `user` object includes
      `username` alongside the existing `id`/`email`.
- [ ] POST /api/auth/login behavior is unchanged: still email +
      password only, no username-based lookup.
- [ ] The Register form has a username input alongside email and
      password.
- [ ] Once logged in, the task dashboard shows the current user's
      username (e.g. "Logged in as <username>") near the Log Out
      button.
- [ ] Existing auth flows (register, login, logout, 401-triggered
      logout, per-user task isolation) continue to work unchanged.
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
- **Depends on code areas or other stories:** Builds on `add-user-authentication` Story 02 (`server/src/userStore.js`, `server/src/routes/auth.js`, `client/src/components/RegisterPage.jsx`, `client/src/context/AuthContext.jsx`, `client/src/App.jsx`'s `TaskDashboard`) — see `.squad/plans/add-user-authentication/02-story-user-login-and-registration.md`.

## Extra notes (optional)

- Explicitly decided: username is display-only. Login stays email + password only — do not add a "login with username" path in this story. Username does not need to be unique.

## Technical hints (optional)

- Repos/roots: `.`. Primary language: `JavaScript`. Existing stack: React (`client/`) + Node/Express (`server/`), JWT auth (Story 02) already in place.
- `server/src/userStore.js`'s `register(email, passwordHash)` needs a `username` param added to the stored user object; `server/src/routes/auth.js`'s `/register` handler needs to validate and pass it through; the JWT payload / response `user` object should include `username` so the client can read it without an extra request.
- Client: `AuthContext` currently only tracks a boolean `isAuthenticated`/token — it will need to also expose the current user's `username` (e.g. decoded from the login/register response, or from the JWT payload) so `TaskDashboard` can display it.

## Out of scope

- Logging in with a username instead of / in addition to email.
- Enforcing username uniqueness.
- Changing or displaying username after registration (no "edit profile" UI).
- Username format/length validation beyond non-empty-after-trim.
