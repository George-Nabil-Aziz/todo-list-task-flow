# Story 12 — Server-side validation with zod

## Story Goal

Validate every request body and `:id` param with zod before handlers run, keeping existing error messages.

## Files

- **New** `server/src/validation.js`: zod v4 schemas `idParams`, `createTask`, `updateTask`, `taskStatus`, `taskPriority`, `register`, `login`, plus a `validate({ params, body })` middleware that returns 400 with the first issue's message and replaces `req.params` / `req.body` with the parsed values.
  - title: trimmed, 1–200 characters
  - email: trimmed, lowercased, valid format
  - username: trimmed, 1–50 characters
  - password: 6–72 characters (bcrypt ignores bytes past 72)
  - priority on create: optional or null, defaults to medium
- **Changed** `server/src/routes/tasks.js`: validation on every route. `Number(req.params.id)` is replaced by the coerced `req.params.id`.
- **Changed** `server/src/routes/auth.js`: validation on register and login. The manual password-length check is removed (now in the schema). Login with missing fields now returns 400 instead of 401.
- The stores keep their own checks as defense in depth.
- Tests appended to `routes/tasks.test.js` and `routes/auth.test.js`.

## Behavior changes

- `PUT /api/tasks/abc` → 400 (was 404).
- Malformed emails are rejected at registration (previously accepted).
