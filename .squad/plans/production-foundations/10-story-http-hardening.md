# Story 10 — HTTP hardening

## Story Goal

Close the open CORS policy, add security headers, protect auth endpoints from brute force, and cap request size.

## Files

- **Changed** `server/src/app.js`: now a `createApp(options)` factory. The default instance is still the module export, so existing `require('../app')` calls keep working, and it is also exposed as `app.createApp` for tests.
  - `helmet()`
  - `cors({ origin: config.corsOrigins })`
  - `express.json({ limit: '10kb' })`
  - `express-rate-limit` on `/api/auth`: default 10 requests per 15 minutes (1000 under `NODE_ENV=test` so suites aren't throttled), `draft-8` standard headers, and a `{ error: 'Too many attempts, please try again later' }` body.
- **New** `server/src/app.test.js`: helmet headers, CORS allow/deny, 413 on an oversized body, 429 after the limit (using `createApp({ authRateLimitMax: 2 })`).

## Client impact

None required. `authApi.js` already shows `data.error`, so a 429 surfaces as "Too many attempts, please try again later" on the login and register forms.

## Notes

- Behind a reverse proxy, Express `trust proxy` must be set for per-client limits. This is documented in the README, not configured.
