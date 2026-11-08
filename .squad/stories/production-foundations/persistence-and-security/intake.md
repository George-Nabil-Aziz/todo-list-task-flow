# Story intake

- Folder: `.squad/stories/production-foundations/persistence-and-security/intake.md`

---

## Feature

- **Feature name (display):** Production Foundations
- **Feature slug (folder under `plans/`):** `production-foundations`

## Tracker (metadata only)

- **Tracker type:** `none`
- **Work item type:** `Backend / infrastructure`
- **Status:** `Implemented`
- **Assignee:** George Nabil
- **Labels:** `backend`, `database`, `security`, `validation`

---

## Title

```
Phase 1 — Persistence & security foundations
```

---

## Description

```
Move TaskFlow from a dev exercise toward production readiness on the server side:

1. Database persistence — replace the in-memory arrays in taskStore.js / userStore.js
   with a real database. Schema must be portable to PostgreSQL later. Keep the store
   module interfaces and error classes so the routes barely change. Tests use an
   isolated database reset between tests.
2. Configuration & secrets — dotenv + server/.env.example. With NODE_ENV=production a
   missing or weak JWT_SECRET must stop the server from starting.
3. HTTP hardening — restrict CORS to CORS_ORIGIN, add helmet, rate-limit /api/auth/*
   (429 + JSON error), limit JSON body size.
4. Centralized error handling — Express error middleware (generic 500, no stack
   traces), GET /api/health, request logging.
5. Input validation with zod — validate bodies and params; invalid :id returns 400.
   Keep existing error messages.
```

## Acceptance criteria

- All existing server and client tests still pass; new behavior is covered by tests.
- Data survives a server restart.
- Server refuses to start in production without a strong JWT_SECRET.
- No API contract changes other than additive fields (`createdAt`, `updatedAt`), new
  `/api/health`, and stricter `400`/`413`/`429` responses.
- README updated.
