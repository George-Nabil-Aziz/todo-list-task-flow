# Story 11 — Error handling, logging, health check

## Story Goal

Always answer JSON, never leak internals, and give operators a health endpoint and request logs.

## Files

- **New** `server/src/errorHandler.js`:
  - `notFoundHandler`: JSON 404 for unknown `/api/*` routes.
  - `errorHandler`: malformed JSON → 400 `Malformed JSON body`, oversized body → 413, other exposed 4xx errors pass through, and everything else is logged and returns 500 `Internal server error`.
- **Changed** `server/src/app.js`: `pino-http` request logging (level from `LOG_LEVEL`, `silent` in tests), `GET /api/health` (runs `SELECT 1`, then 200 `{status:'ok'}` or 503), and the 404 and error handlers mounted last.
- Tests in `server/src/app.test.js`: health, JSON 404, malformed JSON.
