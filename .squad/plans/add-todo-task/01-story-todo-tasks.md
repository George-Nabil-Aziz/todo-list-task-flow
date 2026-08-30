# Story 01 — ToDo Tasks

## Prerequisites

None. This is the first story in the `add-todo-task` feature and the repo currently contains no application code (only `.gitignore` and `.squad/`), so this story scaffolds the app from scratch.

---

## Story Goal

Build a minimal full-stack ToDo task manager:

1. A user can create a task with a title.
2. A user can view the list of all tasks.
3. A user can edit an existing task's title.
4. A user can delete a task.
5. A user can mark a pending task as completed, and a completed task back to pending.
6. A task always has exactly one status: `pending` or `completed`.
7. A task title is required and cannot be empty or whitespace-only — enforced on both client and server.

**Not in scope for this story** (explicit, per intake "Out of scope"): authentication/user accounts/guest users, task priorities/categories/due dates, search/filters/notifications, and any advanced feature beyond basic CRUD + status toggling.

**Product decision — persistence:** tasks are stored **in memory** on the Node server (a plain array/counter, no database or file persistence). Data resets whenever the server restarts. This keeps the story simple per the intake's instruction; persisting across restarts is a separate future story, not a bug in this one.

---

## Context — Read These Files First

1. `.squad/config.yaml` — confirms `primaryLanguage: JavaScript`, `tracker.type: none`, and `naming.includeTrackerId: false` / `naming.globalSequence: true`, which is why this file has no tracker id in its name.
2. `.squad/stories/add-todo-task/todo-tasks/intake.md` — full source of the Description, Acceptance Criteria, and Out-of-scope list this plan implements.
3. Repo root (`.`) — verified via directory listing to contain only `.gitignore` and `.squad/`. There is no existing `client/`, `server/`, `src/`, or `package.json` anywhere in the repo. Every path below is a **new** file/directory this story creates.

---

## Backend Tasks

### 1 — Scaffold the server package

**Create file: `server/package.json`**

Node.js + Express, CommonJS (`require`), no ESM config needed.

```json
{
  "name": "todo-server",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.0",
    "supertest": "^7.0.0"
  }
}
```

### 2 — In-memory task store

**Create file: `server/src/taskStore.js`**

Exposes: `getAll()`, `create(title)`, `getById(id)`, `update(id, title)`, `remove(id)`, `setStatus(id, status)`. Task shape: `{ id, title, status }` where `status` is `'pending' | 'completed'`. Use an incrementing numeric id counter, reset on module load (i.e. on server start).

- `create(title)` and `update(id, title)` must **trim** the title and reject (return `null` or throw a typed error the router turns into 400) when the trimmed title is empty.
- `setStatus(id, status)` must reject any `status` value other than `'pending'` or `'completed'`.

### 3 — Express app + routes

**Create file: `server/src/app.js`** — Express app: `cors()`, `express.json()`, mount the router from `server/src/routes/tasks.js` at `/api/tasks`. Export the app (don't call `listen` here) so tests can import it directly.

**Create file: `server/src/routes/tasks.js`** — Router with:

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/tasks` | 200, returns all tasks |
| POST | `/api/tasks` | 201 + created task on valid `{ title }`; 400 on empty/whitespace-only title |
| PUT | `/api/tasks/:id` | 200 + updated task on valid `{ title }`; 400 on empty/whitespace-only title; 404 if id doesn't exist |
| DELETE | `/api/tasks/:id` | 204 on success; 404 if id doesn't exist |
| PATCH | `/api/tasks/:id/status` | 200 + updated task on valid `{ status }` (`'pending'` or `'completed'`); 400 on invalid status; 404 if id doesn't exist |

### 4 — Server entry point

**Create file: `server/src/index.js`** — imports the app from `server/src/app.js`, listens on `process.env.PORT || 4000`, logs the listening port.

---

## Frontend Tasks

### 1 — Scaffold the client package

**Create file: `client/package.json`** — React + Vite.

```json
{
  "name": "todo-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.0",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

### 2 — Vite config

**Create file: `client/vite.config.js`** — `@vitejs/plugin-react` plugin; dev server `proxy` for `/api` → `http://localhost:4000`; `test` block with `environment: 'jsdom'` and a setup file (`client/src/setupTests.js`, which just imports `@testing-library/jest-dom`).

### 3 — API client

**Create file: `client/src/api/tasksApi.js`** — `fetchTasks()`, `createTask(title)`, `updateTask(id, title)`, `deleteTask(id)`, `setTaskStatus(id, status)`. Each wraps `fetch` against `/api/tasks...`, throws on non-2xx responses (include the parsed error body/message so calling code can show it).

### 4 — Components

**Create file: `client/src/components/TaskForm.jsx`** — controlled text input + submit. Client-side validation: submit is a no-op (and an inline error is shown) when the trimmed input is empty; calls an `onAdd(title)` prop on valid submit and clears the input.

**Create file: `client/src/components/TaskItem.jsx`** — renders one task. Default mode: title text, a status control (e.g. checkbox or toggle button) calling `onStatusChange(id, newStatus)`, an "Edit" button, a "Delete" button calling `onDelete(id)`. Edit mode: text input pre-filled with the title, "Save" (calls `onEdit(id, newTitle)`, blocked/erroring on empty/whitespace) and "Cancel" buttons. Status must be visually distinct (e.g. a class or badge that differs between `pending` and `completed`, plus text, not color alone).

**Create file: `client/src/components/TaskList.jsx`** — renders a `TaskItem` per task; renders an explicit empty-state message when the task array is empty.

**Create file: `client/src/App.jsx`** — top-level state (`tasks`, `loading`, `error`). Loads tasks via `tasksApi.fetchTasks()` on mount. Wires `TaskForm`'s `onAdd`, and `TaskList`/`TaskItem`'s edit/delete/status-change callbacks, to the corresponding `tasksApi` functions, updating local `tasks` state on success and surfacing failures via the `error` state instead of throwing.

**Create file: `client/src/main.jsx`** — standard Vite/React 18 root render of `<App />` into `#root`.

**Create file: `client/index.html`** — Vite HTML entry with a `#root` div and a `<script type="module" src="/src/main.jsx">` tag.

---

## Edge Cases & Failure Modes

- Empty or whitespace-only title on create → server rejects with 400 (`server/src/routes/tasks.js` POST handler, backed by `taskStore.create`); client blocks submit and shows an inline error (`TaskForm.jsx`).
- Empty or whitespace-only title on edit → same validation on the PUT handler and in `TaskItem.jsx`'s save action.
- Update/delete/status-change targeting an id that no longer exists (already deleted, stale UI state after a second tab deleted it) → server returns 404; client removes the task from local state and/or shows a transient error rather than crashing (`App.jsx` error handling around the `tasksApi` calls).
- `PATCH /api/tasks/:id/status` called with a status other than `pending`/`completed` → server returns 400.
- Backend unreachable or errors on initial load → `App.jsx` shows an error state instead of an indefinite loading spinner.
- Server restart clears all tasks (in-memory store by design — see Story Goal's persistence decision); this is expected, not a defect to fix in this story.
- Two clients editing/toggling the same task concurrently → last write wins; no conflict detection or optimistic locking in this story (explicitly out of scope).

---

## Test Plan

Backend (Jest + Supertest), under `server/`:

1. `server/src/taskStore.test.js` — unit tests: `create` adds a task and rejects empty/whitespace titles; `getAll` returns created tasks; `update` changes the title and rejects empty/whitespace titles; `remove` deletes a task; `setStatus` toggles status and rejects invalid status values.
2. `server/src/routes/tasks.test.js` — supertest integration tests against the exported `app`: `POST /api/tasks` valid (201) and invalid title (400); `GET /api/tasks` returns created tasks; `PUT /api/tasks/:id` valid, invalid title (400), unknown id (404); `DELETE /api/tasks/:id` existing (204) and unknown id (404); `PATCH /api/tasks/:id/status` valid, invalid status (400), unknown id (404).

Frontend (Vitest + React Testing Library), under `client/`:

3. `client/src/components/TaskForm.test.jsx` — valid title submit calls `onAdd` and clears the input; empty/whitespace submit shows a validation message and does not call `onAdd`.
4. `client/src/components/TaskItem.test.jsx` — renders title and status; edit flow (click Edit → change text → Save calls `onEdit`; Cancel discards changes); Delete calls `onDelete`; status control calls `onStatusChange` with the toggled value.
5. `client/src/components/TaskList.test.jsx` — renders the empty-state message with no tasks; renders one `TaskItem` per task otherwise.
6. `client/src/App.test.jsx` — mock the `tasksApi` module; assert initial load renders fetched tasks, and that add/edit/delete/status-change interactions call the corresponding `tasksApi` function and update the rendered list.

---

## Verification Steps

1. **Backend builds:** `cd server && npm install && npm test`
2. **Backend runs:** `cd server && npm run dev` — confirm `GET http://localhost:4000/api/tasks` returns `[]` on a fresh start.
3. **Frontend builds:** `cd client && npm install && npm test`
4. **Frontend runs:** `cd client && npm run dev` — with the backend also running, confirm add/view/edit/delete/toggle-status all work end-to-end in the browser.
5. **Regression:** None — greenfield story, no prior behavior to regress.

---

## Done Criteria

- [ ] User can add a task with a valid title (AC1).
- [ ] A newly created task appears in the task list (AC2).
- [ ] Creating a task with an empty or whitespace-only title is rejected on client and server (AC3).
- [ ] User can view all existing tasks (AC4).
- [ ] User can edit the title of an existing task (AC5).
- [ ] User can delete an existing task (AC6).
- [ ] User can mark a pending task as completed (AC7).
- [ ] User can mark a completed task as pending (AC8).
- [ ] Pending vs. completed status is visually distinguishable in the UI (AC9).
- [ ] Deleting a task removes it from the task list (AC10).
