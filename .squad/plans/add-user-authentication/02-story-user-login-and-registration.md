# Story 02 — User Login and Registration

## Prerequisites

- Story 01 completed: [../add-todo-task/01-story-todo-tasks.md](../add-todo-task/01-story-todo-tasks.md) — this story builds directly on the task store, task routes, and React client it scaffolded.

---

## Story Goal

Add authentication to the ToDo app so tasks belong to individual users instead of being shared globally:

1. A visitor can register a new account with an email and password.
2. A registered user can log in and receive a JWT that authenticates their subsequent requests.
3. Every task-related request requires a valid, non-expired JWT; missing/invalid/expired tokens are rejected with `401`.
4. Each user only ever sees and can modify their **own** tasks — the existing global task list becomes per-user.
5. A logged-in user can log out, which discards their token client-side.
6. Tokens expire after a fixed TTL; once expired, the client is returned to the login screen.

**Not in scope for this story** (per intake "Out of scope"): password reset/forgot-password, OAuth/social login, roles/permissions beyond basic ownership, email verification, and persisting users/tasks to a real database — storage stays in-memory, consistent with Story 01.

**Product decision — password hashing library:** use `bcryptjs` (pure JS) rather than `bcrypt` (native bindings) to avoid a native build step in this environment. **Product decision — token TTL:** JWTs expire after `1h`, signed with `process.env.JWT_SECRET` (falling back to a hardcoded dev secret when unset, since there is no `.env` mechanism in this repo yet).

---

## Context — Read These Files First

1. `server/src/taskStore.js` (all 76 lines) — the in-memory task store this story adds `userId` scoping to. Note `VALID_STATUSES` (line 1), the `ValidationError`/`NotFoundError` classes (lines 3–4), the `tasks`/`nextId` module state (lines 6–7), `requireTask` (lines 17–23), `normalizeTitle` (lines 25–31), and `create`/`update`/`remove`/`setStatus` (lines 33–58) — every one of these functions changes signature in this story.
2. `server/src/routes/tasks.js` (all 58 lines) — the Express router whose handlers (lines 18–56) call into `taskStore`; `handleStoreError` (lines 6–16) is the existing error-mapping pattern to keep using. Every handler needs the authenticated user's id to scope its `taskStore` call.
3. `server/src/app.js` (all 11 lines) — where `tasksRouter` is mounted at `/api/tasks` (line 9); this story adds an `/api/auth` mount and an auth-guarding middleware in front of the tasks mount.
4. `server/src/index.js` (all 7 lines) — server entry point; unaffected by this story.
5. `server/package.json` — current `dependencies` (`cors`, `express`) and `devDependencies` (`jest`, `nodemon`, `supertest`); this story adds `bcryptjs` and `jsonwebtoken` to `dependencies`.
6. `server/src/taskStore.test.js` and `server/src/routes/tasks.test.js` (existing tests) — both call store/routes without a `userId`; both must be updated to pass/assert per-user scoping alongside the new auth tests.
7. `client/src/App.jsx` (all 77 lines) — top-level component with `tasks`/`loading`/`error` state (lines 7–9), the `useEffect` load-on-mount (lines 11–16), and the `handleAdd`/`handleEdit`/`handleDelete`/`handleStatusChange` handlers (lines 18–56) that call `tasksApi`. This story wraps the existing task UI behind an authentication gate and adds a logout action.
8. `client/src/api/tasksApi.js` (all 46 lines) — `handleResponse` (lines 3–13) and the five `fetch`-based functions; every `fetch` call here needs an `Authorization` header added.
9. `client/src/main.jsx` (all 11 lines) — React root render; this story wraps `<App />` in a new `AuthProvider`.
10. `client/vite.config.js` — dev proxy for `/api` → `http://localhost:4000` (lines 6–9); the new `/api/auth` routes ride the same proxy, no config change needed.
11. `client/src/App.test.jsx` — mocks `./api/tasksApi.js` via `vi.mock` (line 6) and renders `<App />` directly; since `App` will now read auth state, tests must render it wrapped in `AuthProvider` with a pre-set authenticated state (or `AuthProvider` itself needs to be mockable/seedable — see Frontend Tasks).

---

## Product rules (from story)

| Behavior | Before (Story 01) | After (this story) |
|---|---|---|
| Task visibility | `GET /api/tasks` returns **all** tasks in the process | `GET /api/tasks` returns only the requesting user's tasks |
| Task ownership | Tasks have no owner (`{ id, title, status }`) | Tasks carry `userId` (`{ id, title, status, userId }`) |
| Access to task routes | Unauthenticated | Requires `Authorization: Bearer <jwt>`; `401` otherwise |
| App entry (client) | Task list renders immediately | Login/Register screen renders first; task list renders only once authenticated |

---

## Backend Tasks

### 1 — Add auth dependencies

**File: `server/package.json`** — add to `dependencies`:

```json
"bcryptjs": "^2.4.3",
"jsonwebtoken": "^9.0.2"
```

### 2 — In-memory user store

**Create file: `server/src/userStore.js`** — mirrors the structure of `server/src/taskStore.js` (module-level array + counter, a `reset()` for tests, typed errors):

```js
class ValidationError extends Error {}
class ConflictError extends Error {}

let users = [];
let nextId = 1;

function normalizeEmail(email) {
  const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!trimmed) {
    throw new ValidationError('email is required and cannot be empty');
  }
  return trimmed;
}

function findByEmail(email) {
  const normalized = normalizeEmail(email);
  return users.find((user) => user.email === normalized);
}

function findById(id) {
  return users.find((user) => user.id === id);
}

function register(email, passwordHash) {
  const normalized = normalizeEmail(email);
  if (findByEmail(normalized)) {
    throw new ConflictError(`email ${normalized} is already registered`);
  }
  const user = { id: nextId++, email: normalized, passwordHash };
  users.push(user);
  return user;
}

function reset() {
  users = [];
  nextId = 1;
}

module.exports = {
  findByEmail,
  findById,
  register,
  reset,
  ValidationError,
  ConflictError,
};
```

`passwordHash` is computed by the route (bcrypt hashing is async; keep the store synchronous like `taskStore.js`).

### 3 — Auth middleware

**Create file: `server/src/authMiddleware.js`**:

```js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';
const TOKEN_TTL = '1h';

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET, TOKEN_TTL };
```

### 4 — Auth routes

**Create file: `server/src/routes/auth.js`** — follows the `try/catch` + typed-error-mapping pattern used in `server/src/routes/tasks.js` (lines 6–16, 22–29):

```js
const express = require('express');
const bcrypt = require('bcryptjs');
const userStore = require('../userStore');
const { signToken } = require('../authMiddleware');

const router = express.Router();
const SALT_ROUNDS = 10;

function handleStoreError(err, res) {
  if (err instanceof userStore.ValidationError) {
    res.status(400).json({ error: err.message });
    return true;
  }
  if (err instanceof userStore.ConflictError) {
    res.status(409).json({ error: err.message });
    return true;
  }
  return false;
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userStore.register(email, passwordHash);
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (!handleStoreError(err, res)) next(err);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = userStore.findByEmail(email || '');
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const matches = await bcrypt.compare(password || '', user.passwordHash);
  if (!matches) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken(user);
  res.status(200).json({ token, user: { id: user.id, email: user.email } });
});

module.exports = router;
```

`userStore.findByEmail` throws `ValidationError` on an empty email (via `normalizeEmail`); wrap the `/login` body in the same `handleStoreError`-aware pattern if that surfaces during implementation — the executor should add a `try/catch` around the `findByEmail` call mirroring `/register` if manual testing shows an uncaught throw on empty-email login.

### 5 — Wire routes and guard into the app

**File: `server/src/app.js`** — replace the current body (lines 1–11) with:

```js
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/tasks', requireAuth, tasksRouter);

module.exports = app;
```

### 6 — Scope the task store to users

**File: `server/src/taskStore.js`** — add `userId` to every function that reads or writes `tasks`:

- `getAll(userId)` → `return tasks.filter((task) => task.userId === userId);`
- `requireTask(id, userId)` → find via `tasks.find((task) => task.id === id && task.userId === userId)`; throw `NotFoundError` when not found **or not owned by `userId`** (do not leak whether the id exists for another user — see Edge Cases).
- `create(title, userId)` → task shape becomes `{ id: nextId++, title: normalizeTitle(title), status: 'pending', userId }`.
- `update(id, title, userId)`, `remove(id, userId)`, `setStatus(id, status, userId)` → each calls `requireTask(id, userId)` instead of `requireTask(id)`.
- `getById` (currently unused by routes but exported) → add `userId` param the same way for consistency, or remove it if grep confirms no remaining caller after this story's route changes (`grep -r "taskStore.getById" server/`).

### 7 — Pass the authenticated user into task routes

**File: `server/src/routes/tasks.js`** — `requireAuth` (mounted in `app.js`) sets `req.userId`. Update each handler (lines 18–56) to pass it through:

- `GET /` → `taskStore.getAll(req.userId)`
- `POST /` → `taskStore.create(req.body?.title, req.userId)`
- `PUT /:id` → `taskStore.update(Number(req.params.id), req.body?.title, req.userId)`
- `DELETE /:id` → `taskStore.remove(Number(req.params.id), req.userId)`
- `PATCH /:id/status` → `taskStore.setStatus(Number(req.params.id), req.body?.status, req.userId)`

`handleStoreError` (lines 6–16) needs no changes — a cross-user access attempt now surfaces as the existing `NotFoundError` → `404` path.

---

## Frontend Tasks

### 1 — Token storage helper

**Create file: `client/src/auth/tokenStorage.js`** — single source of truth for the persisted token, shared by the auth context and the API clients so `tasksApi.js` does not need to import React context:

```js
const STORAGE_KEY = 'todo_auth_token';

export function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}
```

### 2 — Auth API client

**Create file: `client/src/api/authApi.js`** — same `fetch` + `handleResponse` shape as `client/src/api/tasksApi.js` (lines 1–17):

```js
const BASE_URL = '/api/auth';

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export function register(email, password) {
  return fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);
}

export function login(email, password) {
  return fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);
}
```

### 3 — Attach the token to task requests

**File: `client/src/api/tasksApi.js`** — import `getToken` from `../auth/tokenStorage.js` and add an `Authorization` header to every request. Replace `handleResponse` (lines 3–13) to also attach the HTTP status to thrown errors, so the caller can detect `401`:

```js
import { getToken } from '../auth/tokenStorage.js';

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.status === 204) {
    return null;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}
```

Update each of the five exported functions (lines 15–45) to merge `authHeaders()` into their `headers` (or pass `{ headers: authHeaders() }` for the header-less `fetchTasks`/`deleteTask` calls).

### 4 — Auth context

**Create file: `client/src/context/AuthContext.jsx`** — holds the current token, exposes `login`/`register`/`logout`, and is the one place that calls `setToken`/`clearToken`:

```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { getToken, setToken, clearToken } from '../auth/tokenStorage.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback(async (email, password) => {
    const { token: newToken } = await authApi.login(email, password);
    setToken(newToken);
    setTokenState(newToken);
  }, []);

  const register = useCallback(async (email, password) => {
    const { token: newToken } = await authApi.register(email, password);
    setToken(newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  const value = { isAuthenticated: Boolean(token), login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
```

### 5 — Login and register pages

**Create file: `client/src/components/LoginPage.jsx`** — controlled email/password inputs (mirrors the controlled-input pattern in `client/src/components/TaskForm.jsx`), calls `useAuth().login`, shows an inline error (`role="alert"`, matching `App.jsx` line 63) on rejection, and includes a link/button to switch to the register view:

```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Log In</h1>
      <label htmlFor="login-email">Email</label>
      <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Log In</button>
      <button type="button" onClick={onSwitchToRegister}>
        Need an account? Register
      </button>
    </form>
  );
}

export default LoginPage;
```

**Create file: `client/src/components/RegisterPage.jsx`** — same shape, calling `useAuth().register`, with a "Log In instead" switch back:

```jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>
      <label htmlFor="register-email">Email</label>
      <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Register</button>
      <button type="button" onClick={onSwitchToLogin}>
        Already have an account? Log in
      </button>
    </form>
  );
}

export default RegisterPage;
```

### 6 — Gate the app behind authentication and add logout

**File: `client/src/App.jsx`** — no `react-router` is installed and this story does not add one; gate with a small local component instead of the existing default export:

- Rename the current `App` function (lines 6–74, everything using `tasks`/`loading`/`error`/`handleAdd`/etc.) to `TaskDashboard`, keep its body as-is, and add a `<button onClick={logout}>Log Out</button>` inside the `<main className="app">` block (after the `<h1>`, alongside the existing `TaskForm`/error/list rendering).
- Add a new default-exported `App` component that reads `useAuth().isAuthenticated`: when `false`, render a small internal `view` state (`'login' | 'register'`, default `'login'`) toggling between `<LoginPage onSwitchToRegister={...} />` and `<RegisterPage onSwitchToLogin={...} />`; when `true`, render `<TaskDashboard />`.
- In `TaskDashboard`'s existing `useEffect`/handlers (lines 11–56), when a `tasksApi` call throws an error with `err.status === 401` (see Frontend Task 3), call `logout()` (from `useAuth()`) in addition to `setError(err.message)`, so an expired token drops the user back to the login screen instead of showing a stuck error state.

### 7 — Wrap the root in `AuthProvider`

**File: `client/src/main.jsx`** — wrap `<App />` (line 8) with the new provider:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

---

## Edge Cases & Failure Modes

- Registering with an email that already exists → `userStore.register` throws `ConflictError`; `POST /api/auth/register` returns `409` (`server/src/routes/auth.js`).
- Registering with a password under 6 characters → `POST /api/auth/register` returns `400` before hashing (`server/src/routes/auth.js`, explicit length check).
- Logging in with an unknown email or wrong password → `POST /api/auth/login` returns `401` with a generic "Invalid email or password" message in both cases, so the client cannot distinguish "no such user" from "wrong password" (`server/src/routes/auth.js`).
- Calling any `/api/tasks*` route with no `Authorization` header, a malformed one (no `Bearer` scheme), or an invalid/expired JWT → `requireAuth` returns `401` before the request reaches `server/src/routes/tasks.js` (`server/src/authMiddleware.js`).
- User A calling `PUT`/`DELETE`/`PATCH` on a task id that belongs to user B → `taskStore.requireTask(id, userId)` treats this identically to "task does not exist" and throws `NotFoundError`, surfacing as `404`, not `403` — this intentionally avoids confirming the task id exists at all to a non-owner (`server/src/taskStore.js`).
- JWT expires mid-session (after `1h`) while the client has the task dashboard open → the next `tasksApi` call receives `401`; `client/src/App.jsx`'s `TaskDashboard` handlers call `logout()` on `err.status === 401`, clearing the stored token and returning the user to `LoginPage` (`client/src/context/AuthContext.jsx`, `client/src/api/tasksApi.js`).
- Server restarts → both `userStore` and `taskStore` reset to empty (in-memory by design, same as Story 01); any previously issued JWT still verifies (the secret is static) but `requireAuth` sets `req.userId` to an id with no matching user, so the first task request after a restart returns an empty list rather than an error — acceptable for this story since there is no user-existence check in `requireAuth`, and is not a regression since Story 01 already resets all task data on restart.
- Two registrations for the same email racing concurrently → both reads of `findByEmail` can pass before either `push` in a truly concurrent environment, but Node's single-threaded event loop combined with the synchronous `userStore.register` body (checked-then-pushed with no `await` in between) makes this non-reproducible in practice; not treated as a defect in this story.

---

## Test Plan

Backend (Jest + Supertest), under `server/`:

1. `server/src/userStore.test.js` (new) — mirrors `server/src/taskStore.test.js`'s `beforeEach(() => store.reset())` pattern: `register` creates a user and rejects a duplicate email (`ConflictError`); `register` rejects an empty email (`ValidationError`); `findByEmail` finds a registered user case-insensitively (registers `Foo@Example.com`, looks up `foo@example.com`).
2. `server/src/routes/auth.test.js` (new) — supertest against `app`, resetting `userStore` in `beforeEach`: `POST /api/auth/register` succeeds (`201`, returns `token` + `user.email`) and rejects a duplicate email (`409`) and a short password (`400`); `POST /api/auth/login` succeeds with correct credentials (`200`, returns `token`) and rejects a wrong password and an unknown email (both `401`).
3. `server/src/taskStore.test.js` (modify) — update every call site to pass a `userId` (e.g. `taskStore.create('Buy milk', 1)`); add a new test that `getAll(userId)` only returns that user's tasks when two different `userId`s have created tasks, and that `update`/`remove`/`setStatus` on another user's task id throw `NotFoundError`.
4. `server/src/routes/tasks.test.js` (modify) — obtain a real JWT per test (register + login via supertest, or sign directly with `authMiddleware.signToken`) and send it as `Authorization: Bearer <token>` on every request; add cases: no `Authorization` header → `401`; a second user's token cannot `GET`/`PUT`/`DELETE`/`PATCH` the first user's task (→ empty list / `404`).

Frontend (Vitest + React Testing Library), under `client/`:

5. `client/src/api/authApi.test.js` (new, mirrors the fetch-mocking style implied by `client/src/api/tasksApi.js`'s consumers) — `register`/`login` resolve with the parsed body on success and throw with the server's `error` message on a non-2xx response.
6. `client/src/components/LoginPage.test.jsx` / `RegisterPage.test.jsx` (new, same render/fireEvent style as `client/src/components/TaskForm.test.jsx`) — submitting valid credentials calls the corresponding `useAuth()` method; a rejected promise renders the error text via `role="alert"`.
7. `client/src/App.test.jsx` (modify) — wrap `render(<App />)` in `AuthProvider` (or mock `../context/AuthContext.jsx`'s `useAuth` directly, matching the existing `vi.mock('./api/tasksApi.js')` style on line 6); add a case that renders `LoginPage` when unauthenticated, and a case that a task-fetch `401` triggers `logout` and returns to the login view. Existing tests (lines 13–55) continue to pass by seeding an authenticated state before rendering.

---

## Verification Steps

1. **Backend builds:** `cd server && npm install && npm test`
2. **Backend runs:** `cd server && npm run dev` — confirm `POST http://localhost:4000/api/auth/register` with `{ "email": "a@b.com", "password": "secret1" }` returns `201` with a `token`; confirm `GET http://localhost:4000/api/tasks` with no header returns `401`, and with `Authorization: Bearer <token>` returns `200` and `[]`.
3. **Frontend builds:** `cd client && npm install && npm test`
4. **Frontend runs:** `cd client && npm run dev` — with the backend also running, confirm: registering creates an account and lands on the task dashboard; logging out returns to the login screen; logging back in restores access; a second registered user does not see the first user's tasks.
5. **Regression:** Re-run the Story 01 flows (add/edit/delete/toggle-status a task) while logged in, confirming they work unchanged aside from now requiring authentication.

---

## Done Criteria

- [ ] `POST /register` creates a user with a bcrypt-hashed password; a duplicate email is rejected with a clear error (AC1).
- [ ] `POST /login` returns a JWT on valid credentials and `401` on invalid credentials (AC2).
- [ ] All task endpoints require a valid JWT and reject missing/invalid/expired tokens with `401` (AC3).
- [ ] Each user only sees and can mutate their own tasks; another user's task id is treated as not found (AC4).
- [ ] JWTs expire after `1h`; requests with an expired token are rejected and the client returns to login (AC5).
- [ ] The client has working Register and Login forms with validation and inline error display (AC6).
- [ ] The client stores the token, attaches it to task API calls, and Logout clears it and returns to the login screen (AC7).
- [ ] An unauthenticated visitor sees the login screen, not the task dashboard (AC8).
