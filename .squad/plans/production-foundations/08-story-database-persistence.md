# Story 08 — Database persistence (SQLite)

## Story Goal

Replace the in-memory `users[]` / `tasks[]` arrays with a SQLite database so data survives restarts, without changing the store interfaces the routes depend on.

## Files

- **New** `server/migrations/001_init.sql`: `users` and `tasks` tables. `tasks.user_id` is a foreign key with `ON DELETE CASCADE`. `CHECK` constraints on `status` and `priority`. Index on `tasks(user_id)`. ISO-8601 `created_at` / `updated_at`.
- **New** `server/src/db.js`: `open(path)`, `getDb()` (lazy singleton), `close()`, `migrate(db)`. Enables WAL and `foreign_keys`. Applies pending `*.sql` files in name order inside a transaction and records them in `schema_migrations`. Uses `:memory:` when `NODE_ENV=test`, otherwise `DATABASE_PATH` or `server/data/taskflow.db`.
- **Rewritten** `server/src/userStore.js` and `server/src/taskStore.js`: same exports and errors. Rows are mapped to camelCase objects. `reset()` (test helper) clears the tables and `sqlite_sequence` so ids restart at 1.
- **Changed** `server/src/taskStore.test.js`: `beforeEach` registers users 1 and 2, because tasks now need real owners (foreign key).
- **New** `server/src/db.test.js`: migrations are applied and recorded, `migrate` is idempotent, data persists across reopen, deleting a user cascades to tasks.
- `.gitignore`: `server/data/`, `.env`.

## Edge cases

- Users are normalized in `userStore` (lowercase email), and `UNIQUE(email)` backs up the duplicate check.
- Task objects gain `createdAt` / `updatedAt`. This is additive, and no client code breaks.

## Done criteria

- All existing tests pass unchanged except the `taskStore.test.js` setup. New db tests pass.
