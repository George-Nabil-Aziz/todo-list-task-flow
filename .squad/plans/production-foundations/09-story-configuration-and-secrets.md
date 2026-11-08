# Story 09 — Configuration & secrets

## Story Goal

Centralize environment configuration and make a missing or weak `JWT_SECRET` fatal in production.

## Files

- **New** `server/src/config.js`: loads `.env` via `dotenv` (quiet). `loadConfig(env)` is a pure function exporting `nodeEnv`, `port`, `jwtSecret`, `corsOrigins`, `authRateLimitMax`, `authRateLimitWindowMs`, and `logLevel`. In production it throws `ConfigError` if `JWT_SECRET` is missing, under 32 characters, or equals the dev fallback. Invalid numeric values also throw. Exports a `config` singleton.
- **New** `server/.env.example`, documenting every variable.
- **Changed** `server/src/authMiddleware.js`: the secret comes from `config.jwtSecret`, and verification is pinned to `HS256`.
- **Changed** `server/src/index.js`: catches config errors, prints `Failed to start todo-server: <reason>`, and exits 1.
- **New** `server/src/config.test.js`.

## Done criteria

- `NODE_ENV=production node src/index.js` without a secret exits 1 with a clear message.
