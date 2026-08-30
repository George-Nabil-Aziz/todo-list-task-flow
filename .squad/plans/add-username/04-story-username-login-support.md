# Story 04 — Username Display Name

## Prerequisites

- Story 02 completed: [../add-user-authentication/02-story-user-login-and-registration.md](../add-user-authentication/02-story-user-login-and-registration.md) — this story extends the user store, auth routes, auth context, and Login/Register pages it created.

---

## Story Goal

Add a display-only username to user accounts, distinct from the existing login mechanism:

1. Registration collects a `username` in addition to the existing email and password.
2. Username is required (non-empty after trimming) but is **not** unique — two different users may register the same username value.
3. Login is unchanged: still email + password only. There is no "log in with username" path.
4. The register/login response includes the user's `username` alongside `id`/`email`.
5. Once logged in, the task dashboard shows the current user's username (e.g. "Logged in as `<username>`") near the existing Log Out button.

**Not in scope for this story** (per intake "Out of scope"): logging in with a username, enforcing username uniqueness, editing/changing the username after registration, and any username format/length validation beyond non-empty-after-trim.

---

## Context — Read These Files First

1. `server/src/userStore.js` (all 47 lines) — `normalizeEmail` (lines 7–13, the pattern to mirror for a new `normalizeUsername`), `register(email, passwordHash)` (lines 24–32, to extend with a `username` parameter and field), and the exported `ValidationError`/`ConflictError` (lines 1–2, 39–46) — username validation reuses `ValidationError`, and deliberately does **not** get a `ConflictError` path since duplicates are allowed.
2. `server/src/routes/auth.js` (all 58 lines) — the `/register` handler (lines 21–35, destructures `{ email, password }` from `req.body`, calls `userStore.register(email, passwordHash)`, and returns `user: { id: user.id, email: user.email }`) and the `/login` handler (lines 37–55, returns the same shape) — both response shapes need `username` added.
3. `server/src/userStore.test.js` (all 32 lines) — existing `register` tests to extend; note the `beforeEach(() => userStore.reset())` pattern (lines 3–5).
4. `server/src/routes/auth.test.js` (all 57 lines) — existing register/login supertest cases to extend.
5. `client/src/auth/tokenStorage.js` — the existing `getToken`/`setToken`/`clearToken` trio backed by a single `localStorage` key; this story adds a second key for the username using the same shape.
6. `client/src/context/AuthContext.jsx` (all 37 lines) — `login`/`register`/`logout` (lines 10–25) currently only track a `token` and derive `isAuthenticated` (line 27); this story adds a `username` piece of state alongside `token`, sourced from the `user` object in the `authApi.login`/`authApi.register` response.
7. `client/src/api/authApi.js` (all 26 lines) — `register(email, password)` (lines 12–18) sends `{ email, password }`; this story adds `username` to the request body. The response already passes through whatever the server returns (via `handleResponse`, lines 3–10), so no response-shape change is needed here.
8. `client/src/components/RegisterPage.jsx` (all 40 lines) — the controlled email/password inputs (lines 6–7, 22–30) and `handleSubmit` (lines 10–17, calls `register(email, password)`) — add a third controlled `username` input and pass it through.
9. `client/src/App.jsx` (all 172 lines) — `TaskDashboard` (lines 11–154), specifically the `<h1>`/Log Out button block (lines 106–108) where the username display goes, and `useAuth()` destructuring at line 12.
10. `client/src/components/RegisterPage.test.jsx`, `client/src/api/authApi.test.js`, `client/src/App.test.jsx` — existing tests to extend; `App.test.jsx` already mocks `AuthContext.useAuth` (lines 5, 8, 15–22), the pattern to follow for adding a `username` field to `mockAuth`.

---

## Backend Tasks

### 1 — Username on the user store

**File: `server/src/userStore.js`** — add a normalizer mirroring `normalizeEmail` (lines 7–13), and thread it through `register` (lines 24–32):

```js
function normalizeUsername(username) {
  const trimmed = typeof username === 'string' ? username.trim() : '';
  if (!trimmed) {
    throw new ValidationError('username is required and cannot be empty or whitespace-only');
  }
  return trimmed;
}

function register(email, passwordHash, username) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  if (findByEmail(normalizedEmail)) {
    throw new ConflictError(`email ${normalizedEmail} is already registered`);
  }
  const user = { id: nextId++, email: normalizedEmail, passwordHash, username: normalizedUsername };
  users.push(user);
  return user;
}
```

Validate the username **before** the duplicate-email check so a bad username on an otherwise-duplicate email still reports the username problem first — either order is acceptable since both map to `400`/`409` respectively and are mutually exclusive failure paths, but validating both inputs before mutating state is the safer default. No `ConflictError` is raised for a duplicate username — usernames are intentionally not unique.

### 2 — Accept and return username in auth routes

**File: `server/src/routes/auth.js`**:

- `/register` handler (lines 21–35) — destructure `username` from the body and pass it through:

```js
const { email, username, password } = req.body || {};
// ...unchanged password-length check...
const user = userStore.register(email, passwordHash, username);
const token = signToken(user);
res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
```

- `/login` handler (lines 37–55) — the found `user` record already carries `username` once registered with it; just extend the response object:

```js
res.status(200).json({ token, user: { id: user.id, email: user.email, username: user.username } });
```

No change to `handleStoreError` (lines 9–19) — a missing/blank username throws the existing `userStore.ValidationError`, already mapped to `400`.

---

## Frontend Tasks

### 1 — Persist the username alongside the token

**File: `client/src/auth/tokenStorage.js`** — add a second key and a matching get/set/clear trio, following the existing `STORAGE_KEY` pattern for the token:

```js
const USERNAME_STORAGE_KEY = 'todo_auth_username';

export function getUsername() {
  return localStorage.getItem(USERNAME_STORAGE_KEY);
}

export function setUsername(username) {
  localStorage.setItem(USERNAME_STORAGE_KEY, username);
}

export function clearUsername() {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
}
```

### 2 — Track username in auth context

**File: `client/src/context/AuthContext.jsx`** — import the new storage functions, add `username` state, and update `login`/`register`/`logout` (lines 10–25) to read the `user.username` field from the `authApi` response:

```jsx
import { getToken, setToken, clearToken, getUsername, setUsername, clearUsername } from '../auth/tokenStorage.js';
```

```jsx
const [username, setUsernameState] = useState(() => getUsername());

const login = useCallback(async (email, password) => {
  const { token: newToken, user } = await authApi.login(email, password);
  setToken(newToken);
  setTokenState(newToken);
  setUsername(user.username);
  setUsernameState(user.username);
}, []);

const register = useCallback(async (email, password, username) => {
  const { token: newToken, user } = await authApi.register(email, password, username);
  setToken(newToken);
  setTokenState(newToken);
  setUsername(user.username);
  setUsernameState(user.username);
}, []);

const logout = useCallback(() => {
  clearToken();
  clearUsername();
  setTokenState(null);
  setUsernameState(null);
}, []);

const value = { isAuthenticated: Boolean(token), username, login, register, logout };
```

### 3 — Send username on register

**File: `client/src/api/authApi.js`** — `register` (lines 12–18) gains a third parameter and includes it in the body:

```js
export function register(email, password, username) {
  return fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  }).then(handleResponse);
}
```

### 4 — Username field on the register form

**File: `client/src/components/RegisterPage.jsx`** — add a controlled `username` input alongside email/password (lines 6–7, 22–30), and pass it to `register` in `handleSubmit` (lines 10–17):

```jsx
const [username, setUsername] = useState('');
```

```jsx
<label htmlFor="register-username">Username</label>
<input id="register-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
```

```jsx
await register(email, password, username);
```

Place the username field before the email field (or after — either order is acceptable; put it first since it is the first thing `handleSubmit` needs conceptually), keeping the same label/input/`htmlFor` structure as the existing fields.

### 5 — Show the username on the task dashboard

**File: `client/src/App.jsx`** — destructure `username` from `useAuth()` (line 12) and render it next to the Log Out button (lines 106–108):

```jsx
const { logout, username } = useAuth();
```

```jsx
<h1>ToDo Tasks</h1>
<p>Logged in as {username || 'you'}</p>
<button onClick={logout}>Log Out</button>
```

The `username || 'you'` fallback covers the edge case where `username` is unexpectedly absent (see Edge Cases) without crashing or rendering the literal text `null`/`undefined`.

---

## Edge Cases & Failure Modes

- `POST /api/auth/register` with a missing or whitespace-only `username` → `400` via `userStore.ValidationError` (`server/src/userStore.js`'s `normalizeUsername`), same as the existing empty-email case.
- Two different users register with the identical `username` value → both succeed (`201` each); no `ConflictError` is raised for username, only for a duplicate email (`server/src/userStore.js`).
- `POST /api/auth/login` — completely unchanged behavior; a `username` in the request body (if a client mistakenly sends one) is simply ignored since the handler only reads `email`/`password` (`server/src/routes/auth.js`).
- A user's `AuthContext` `username` state is absent (e.g. `localStorage` was partially cleared, or an old token predates this story and no username was ever stored) → `client/src/App.jsx` renders `"Logged in as you"` instead of crashing on `null`/`undefined`.
- Registering, then logging out, then logging back in as a **different** user → `login` overwrites both the stored token and the stored username (`client/src/context/AuthContext.jsx`), so the dashboard shows the newly-logged-in user's username, not a stale one from the previous session.
- Server restart clears the in-memory `userStore` (unchanged from Story 02's behavior) — any token issued before the restart still verifies but there is no backing user record; this is an existing, accepted limitation, not something this story changes.

---

## Test Plan

Backend (Jest + Supertest), under `server/`:

1. `server/src/userStore.test.js` (modify) — `register` stores and returns a `username` on the created user; `register` rejects an empty/whitespace-only username (`ValidationError`); `register` allows two different users to share the same username (no error, two distinct user ids).
2. `server/src/routes/auth.test.js` (modify) — `POST /api/auth/register` without a `username` returns `400`; `POST /api/auth/register` response `user` object includes `username`; two registrations with the same `username` but different emails both succeed (`201` each); `POST /api/auth/login` response `user` object also includes `username`.

Frontend (Vitest + React Testing Library), under `client/`:

3. `client/src/api/authApi.test.js` (modify) — `register('a@b.com', 'secret1', 'alice')` sends a body containing `username: 'alice'` (assert via `global.fetch`'s call arguments, mirroring the existing `expect.objectContaining` check at lines 25–28).
4. `client/src/components/RegisterPage.test.jsx` (modify) — filling in the username field along with email/password and submitting calls `useAuth().register` with all three values in order (mirrors the existing test at lines 17–26).
5. `client/src/App.test.jsx` (modify) — add `username: 'testuser'` to the `mockAuth` fixture (lines 15–20) and add a test asserting `TaskDashboard` renders `"Logged in as testuser"` when authenticated; existing tests continue to pass since they don't assert on the absence of this text.

---

## Verification Steps

1. **Backend builds:** `cd server && npm test`
2. **Backend runs:** `cd server && npm run dev` — confirm `POST /api/auth/register` with `{ "email": "a@b.com", "password": "secret1", "username": "alice" }` returns `201` with `user.username === "alice"`; confirm a second registration with a different email and the same `username: "alice"` also succeeds; confirm registering with no `username` returns `400`.
3. **Frontend builds:** `cd client && npm test`
4. **Frontend runs:** `cd client && npm run dev` — register a new account with a username, confirm the task dashboard shows "Logged in as `<username>`" next to Log Out; log out and back in, confirm the username still displays.
5. **Regression:** Re-run the Story 01–03 flows (task CRUD, status toggle, priority, login/logout, per-user isolation) confirming they still work unchanged.

---

## Done Criteria

- [ ] `POST /api/auth/register` requires a non-empty username and rejects a missing/whitespace-only one with `400` (AC1).
- [ ] Two users may register with the same username value with no error (AC2).
- [ ] The register/login response's `user` object includes `username` (AC3).
- [ ] `POST /api/auth/login` behavior is unchanged — email + password only (AC4).
- [ ] The Register form has a username input alongside email and password (AC5).
- [ ] The task dashboard shows the logged-in user's username near the Log Out button (AC6).
- [ ] Existing auth flows (register, login, logout, 401-triggered logout, per-user task isolation) continue to work unchanged (AC7).
