# production-foundations — plan overview

Entry point for the **production-foundations** feature (roadmap Phase 1). Stories execute in order by their `NN` prefix. Server-only: no client changes were required.

## Stories

| NN | File | Title | Tracker id | Depends on |
|----|------|-------|------------|------------|
| 08 | [08-story-database-persistence.md](08-story-database-persistence.md) | Database persistence (SQLite) | — | Stories 01–04 (stores and routes) |
| 09 | [09-story-configuration-and-secrets.md](09-story-configuration-and-secrets.md) | Configuration & secrets | — | — |
| 10 | [10-story-http-hardening.md](10-story-http-hardening.md) | HTTP hardening | — | Story 09 (config values) |
| 11 | [11-story-error-handling-and-ops.md](11-story-error-handling-and-ops.md) | Error handling, logging, health check | — | Stories 08, 10 |
| 12 | [12-story-server-validation.md](12-story-server-validation.md) | Server-side validation with zod | — | Story 11 (error handler for malformed JSON) |

## Key decision: better-sqlite3 instead of Prisma

The roadmap suggested Prisma. **better-sqlite3** was chosen because:

- Its API is synchronous, so `taskStore`/`userStore` kept their exact function signatures and the routes did not have to become async.
- Tests get a fresh `:memory:` database per Jest worker (when `NODE_ENV=test`), so there is no test-database file, global setup, or `--runInBand` requirement.
- Migrations are plain SQL in `server/migrations/`, which keeps a later move to PostgreSQL straightforward.

## Results

- Server: 7 test files, 80 tests passing (was 4 / 52).
- Client: 9 test files, 65 tests passing (unchanged). Production build succeeds.
- Manual smoke test: production boot without `JWT_SECRET` exits 1; `/api/health` returns ok; a registered user can log in after a server restart.
