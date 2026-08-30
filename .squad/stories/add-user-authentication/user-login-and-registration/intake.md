# Story intake

Fill this template for each story you want planned. Keep it copy-paste-friendly: the planner reads **this file and the files in `attachments/`**, nothing else.

- Folder: `.squad/stories/add-user-authentication/user-login-and-registration/intake.md`
- Binaries (screenshots, PDFs, exports): put them in `attachments/` next to this file and list them below.
- Do **not** rely on external links (tracker URLs, wiki, chat) — the planner cannot open them. Paste the content you want considered.

This is **not** an implementation prompt. It is the input to the plan-generation meta-prompt bundled with squad-kit (`generate-plan.md` in the installed package).

---

## Feature

- **Feature name (display):** User Login and Registration
- **Feature slug (folder under `plans/`):** `add-user-authentication`

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
User login and registration
```

---

## Description

*(Paste the full work item description. Prefilled when fetched from a tracker.)*

```
Add user authentication to the ToDo List app so that todos belong to
individual users instead of being shared globally in one in-memory list.

- Users can register with an email/username and password.
- Users can log in and receive a JWT used to authenticate subsequent
  requests (stateless, no server-side session store).
- Passwords are hashed with bcrypt before being stored; plaintext
  passwords are never persisted or logged.
- Existing todo CRUD endpoints are scoped to the authenticated user:
  each user only sees and can modify their own todos.
- Users can log out (client discards the token) and tokens expire
  after a set TTL, after which protected requests are rejected and
  the client must log in again.
- Storage stays in-memory for this story (users list + per-user
  todos), consistent with the existing add-todo-task story — no
  database is introduced.
```

---

## Acceptance criteria

*(Checklist, bullets, Gherkin, etc. Prefilled for Azure DevOps when the work item has acceptance criteria.)*

```
- [ ] POST /register creates a user with a hashed (bcrypt) password;
      duplicate email/username is rejected with a clear error.
- [ ] POST /login validates credentials and returns a signed JWT on
      success, or a 401 on invalid credentials.
- [ ] Todo endpoints (list/create/update/delete/toggle) require a
      valid JWT (via Authorization header) and reject requests with
      a missing/invalid/expired token with 401.
- [ ] Each user only ever sees and mutates their own todos — one
      user cannot read or modify another user's todos.
- [ ] JWT has an expiry (TTL); requests made with an expired token
      are rejected and the client redirects to login.
- [ ] Client has Register and Login pages/forms with basic
      validation and error display.
- [ ] Client stores the token (e.g. localStorage) and attaches it to
      todo API calls; a Logout action clears the token and returns
      the user to the login screen.
- [ ] Client redirects unauthenticated users away from the todo view
      to the login page.
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
- **Depends on code areas or other stories:** Builds on the `add-todo-task` story (`.squad/plans/add-todo-task/01-story-todo-tasks.md`) — the existing global in-memory todo list/endpoints in `server/src` and the todo UI in `client/src` need to become user-scoped.

## Extra notes (optional)

- Mechanism decided up front: JWT + bcrypt, chosen over server-side sessions to keep the backend stateless and match the existing in-memory (no DB) approach.

## Technical hints (optional)

- Repos/roots: `.`. Primary language: `JavaScript`. Existing stack: React (`client/`, Vite) + Node/Express (`server/`), in-memory storage, no auth currently.
- Use `bcrypt` (or `bcryptjs`) for password hashing and `jsonwebtoken` for issuing/verifying JWTs.
- New in-memory users store alongside the existing in-memory todos store; todos need a `userId` field added.
- Auth middleware on Express to protect existing todo routes; new `/register` and `/login` routes.
- React: new Register/Login pages, auth context or similar for holding the token, protected-route wrapper around the existing todo view, token attached via `Authorization: Bearer <token>` header on API calls.

## Out of scope

- Password reset / forgot-password flow.
- OAuth / social login, roles or permissions beyond basic per-user ownership.
- Persisting users/todos to a real database (still in-memory for this story).
- Email verification.
