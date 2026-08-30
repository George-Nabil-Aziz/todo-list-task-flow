# Story 03 — Task Priorities

## Prerequisites

- Story 01 completed: [../add-todo-task/01-story-todo-tasks.md](../add-todo-task/01-story-todo-tasks.md) — this story extends the task store, task routes, and React components it created.
- Story 02 completed: [../add-user-authentication/02-story-user-login-and-registration.md](../add-user-authentication/02-story-user-login-and-registration.md) — every task operation this story touches is already scoped by `userId` and guarded by `requireAuth`; priority must respect that same scoping.

---

## Story Goal

Add a priority to every task so users can indicate, see, sort, and filter by importance:

1. A task has a priority of `low`, `medium`, or `high`.
2. Creating a task accepts an optional priority; when omitted, the task defaults to `medium`.
3. A task's priority can be changed independently of its title or status.
4. The task list shows each task's priority visually, distinguishable by more than color alone.
5. The task list can be sorted by priority (High → Low or Low → High).
6. The task list can be filtered to show only tasks of a selected priority (or all).
7. Priority stays scoped to the owning user, like every other task field.

**Not in scope for this story** (per intake "Out of scope"): custom/user-defined priority levels beyond the fixed three, automatic/due-date-based priority suggestions, and multi-field sorting (priority is the only sortable field).

---

## Context — Read These Files First

1. `server/src/taskStore.js` (all 76 lines) — `VALID_STATUSES` (line 1), the `tasks`/`nextId` module state (lines 6–7), `normalizeTitle` (lines 25–31, the pattern to mirror for a new `normalizePriority`), `create` (lines 33–37, task shape `{ id, title, status, userId }` to extend with `priority`), and `setStatus` (lines 51–58, the pattern to mirror for a new `setPriority`).
2. `server/src/routes/tasks.js` (all 58 lines) — `handleStoreError` (lines 6–16, reused unchanged), the `POST /` handler (lines 22–29, to pass an optional `priority` through), and the `PATCH /:id/status` handler (lines 49–56, the pattern to mirror for a new `PATCH /:id/priority` route).
3. `client/src/components/TaskItem.jsx` (all 86 lines) — the status checkbox + badge (lines 37–45, `task-item__badge` pattern to mirror for a priority badge) and the `onStatusChange`/`toggleStatus` wiring (lines 3, 31–33) — priority gets an equivalent standalone control, not folded into the title edit flow (lines 47–66).
4. `client/src/components/TaskList.jsx` (all 18 lines) — the empty-state message (line 5); this story needs a second, distinct empty message for "no tasks match the filter" vs. "no tasks yet".
5. `client/src/components/TaskForm.jsx` (all 38 lines) — the controlled-input + `onAdd(title)` pattern (lines 3–16); extend to also collect and pass a priority.
6. `client/src/App.jsx` (all 114 lines) — `TaskDashboard`'s `tasks`/`loading`/`error` state (lines 11–13) and `handleAdd` (lines 27–38); this story adds `sortOrder`/`filterPriority` state here and a `handlePriorityChange` handler alongside `handleStatusChange` (lines 66–77).
7. `client/src/api/tasksApi.js` (all 55 lines) — `createTask` (lines 28–34, add `priority` to the body) and `setTaskStatus` (lines 48–54, the pattern to mirror for a new `setTaskPriority`).
8. `server/src/taskStore.test.js`, `server/src/routes/tasks.test.js`, `client/src/components/TaskForm.test.jsx`, `client/src/components/TaskItem.test.jsx`, `client/src/components/TaskList.test.jsx`, `client/src/App.test.jsx` — existing tests to extend; note `App.test.jsx` already mocks `./context/AuthContext.jsx` (lines 5, 8, 15–22) and `./api/tasksApi.js` (line 7) — new tests follow the same mocking style.

---

## Backend Tasks

### 1 — Priority field in the task store

**File: `server/src/taskStore.js`** — add a priority enum, a normalizer mirroring `normalizeTitle` (lines 25–31), a default, and a new `setPriority` mirroring `setStatus` (lines 51–58):

```js
const VALID_STATUSES = ['pending', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_PRIORITY = 'medium';
```

```js
function normalizePriority(priority) {
  if (priority === undefined || priority === null) {
    return DEFAULT_PRIORITY;
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return priority;
}
```

- `create(title, userId, priority)` (lines 33–37) — task shape becomes `{ id: nextId++, title: normalizeTitle(title), status: 'pending', userId, priority: normalizePriority(priority) }`.
- Add `setPriority(id, priority, userId)`, mirroring `setStatus` (lines 51–58) but **not** defaulting — an explicit invalid value is rejected, an explicit valid value is required:

```js
function setPriority(id, priority, userId) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  const task = requireTask(id, userId);
  task.priority = priority;
  return task;
}
```

- Export `setPriority` and `VALID_PRIORITIES` alongside the existing exports (lines 65–75).

### 2 — Priority route

**File: `server/src/routes/tasks.js`**:

- `POST /` handler (lines 22–29) — pass the optional priority through: `taskStore.create(req.body?.title, req.userId, req.body?.priority)`.
- Add a new route mirroring `PATCH /:id/status` (lines 49–56):

```js
router.patch('/:id/priority', (req, res) => {
  try {
    const task = taskStore.setPriority(Number(req.params.id), req.body?.priority, req.userId);
    res.status(200).json(task);
  } catch (err) {
    if (!handleStoreError(err, res)) throw err;
  }
});
```

No changes needed to `handleStoreError` (lines 6–16) — an invalid priority throws the existing `taskStore.ValidationError`, already mapped to `400`.

---

## Frontend Tasks

### 1 — Priority in task creation

**File: `client/src/components/TaskForm.jsx`** — add a controlled `priority` select (default `'medium'`) alongside the existing title input (lines 3–16), and change `onAdd` to `onAdd(title.trim(), priority)`:

```jsx
const [priority, setPriority] = useState('medium');
```

```jsx
<select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>
```

Call `onAdd(title.trim(), priority)` in `handleSubmit` (currently `onAdd(title.trim())`, line 13); leave `priority` at `'medium'` after submit (do not reset it, so repeated additions of the same priority are convenient).

### 2 — Priority badge and control on each task

**File: `client/src/components/TaskItem.jsx`** — add a priority `<select>` next to the existing status control (lines 37–45), and a badge mirroring `task-item__badge` (line 44):

```jsx
<span className={`task-item__priority-badge task-item__priority-badge--${task.priority}`}>
  {task.priority === 'high' ? 'High' : task.priority === 'low' ? 'Low' : 'Medium'}
</span>
<select
  value={task.priority}
  onChange={(event) => onPriorityChange(task.id, event.target.value)}
  aria-label={`Change priority of "${task.title}"`}
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>
```

Add `onPriorityChange` to the component's props (alongside `onEdit`, `onDelete`, `onStatusChange`, line 3). This control is independent of the title edit flow (lines 47–66) and of `toggleStatus` (lines 31–33) — changing priority does not require entering edit mode.

### 3 — Wire priority through the list

**File: `client/src/components/TaskList.jsx`** — add an `onPriorityChange` prop, pass it to each `TaskItem` (line 11), and accept an `emptyMessage` prop with the current text (line 5) as its default, so `App.jsx` can supply a different message when a filter (not the absence of any tasks) produces zero rows:

```jsx
function TaskList({ tasks, onEdit, onDelete, onStatusChange, onPriorityChange, emptyMessage = 'No tasks yet. Add one above to get started.' }) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">{emptyMessage}</p>;
  }
  // ...map, passing onPriorityChange={onPriorityChange} to each TaskItem
}
```

### 4 — Priority API calls

**File: `client/src/api/tasksApi.js`**:

- `createTask` (lines 28–34) — accept a `priority` param and include it in the body: `body: JSON.stringify({ title, priority })`.
- Add `setTaskPriority`, mirroring `setTaskStatus` (lines 48–54):

```js
export function setTaskPriority(id, priority) {
  return fetch(`${BASE_URL}/${id}/priority`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ priority }),
  }).then(handleResponse);
}
```

### 5 — Sort and filter controls, wired in the dashboard

**File: `client/src/App.jsx`** — in `TaskDashboard` (lines 9–96):

- Import `setTaskPriority` alongside the other `tasksApi` imports (line 6).
- Add state: `const [sortOrder, setSortOrder] = useState('none');` (`'none' | 'high-first' | 'low-first'`) and `const [filterPriority, setFilterPriority] = useState('all');` (`'all' | 'low' | 'medium' | 'high'`).
- Add `handlePriorityChange`, mirroring `handleStatusChange` (lines 66–77):

```jsx
async function handlePriorityChange(id, priority) {
  try {
    const updated = await setTaskPriority(id, priority);
    setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
    setError('');
  } catch (err) {
    setError(err.message);
    if (err.status === 401) {
      logout();
    }
  }
}
```

- Compute the displayed list from `tasks`, `filterPriority`, and `sortOrder` before rendering `TaskList` (replacing the direct `tasks` prop passed at line 92):

```jsx
const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

const visibleTasks = tasks
  .filter((task) => filterPriority === 'all' || task.priority === filterPriority)
  .slice()
  .sort((a, b) => {
    if (sortOrder === 'high-first') return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (sortOrder === 'low-first') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return 0;
  });
```

- Add sort/filter `<select>` controls above `TaskList` (after `TaskForm`, before the error/loading block, lines 83–88):

```jsx
<label>
  Filter by priority
  <select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value)} aria-label="Filter by priority">
    <option value="all">All</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
</label>
<label>
  Sort by priority
  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort by priority">
    <option value="none">None</option>
    <option value="high-first">High to Low</option>
    <option value="low-first">Low to High</option>
  </select>
</label>
```

- Pass `visibleTasks` (not `tasks`) and `onPriorityChange={handlePriorityChange}` to `TaskList` (line 92), and an `emptyMessage` that distinguishes "no tasks at all" from "no tasks match the filter":

```jsx
<TaskList
  tasks={visibleTasks}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
  onPriorityChange={handlePriorityChange}
  emptyMessage={
    tasks.length === 0
      ? 'No tasks yet. Add one above to get started.'
      : 'No tasks match the selected priority filter.'
  }
/>
```

- Update `handleAdd` (lines 27–38) to accept and forward a priority: `async function handleAdd(title, priority) { ... createTask(title, priority) ... }`.

---

## Edge Cases & Failure Modes

- `POST /api/tasks` with no `priority` in the body → `taskStore.create` defaults it to `medium` via `normalizePriority` (`server/src/taskStore.js`); the client's `TaskForm` also always sends an explicit value so this path is mainly for direct API callers.
- `POST /api/tasks` or `PATCH /:id/priority` with a `priority` outside `low`/`medium`/`high` → `400` (`taskStore.ValidationError`, `server/src/taskStore.js`).
- `PATCH /:id/priority` on a task id belonging to another user → identical to today's cross-user behavior: `requireTask` throws `NotFoundError` → `404`, not `403` (`server/src/taskStore.js`, same pattern already covered by Story 02's cross-user tests).
- `PATCH /:id/priority` on an unknown id → `404` (`taskStore.NotFoundError`).
- Filtering to a priority with zero matching tasks while other tasks exist → `TaskList` renders the "no tasks match the selected priority filter" message, not the "no tasks yet" message (`client/src/App.jsx`, `client/src/components/TaskList.jsx`).
- Sorting is a pure client-side, in-memory re-order of the already-fetched list (`client/src/App.jsx`'s `visibleTasks`); it does not call the server and has no effect on task ownership or the underlying `tasks` state, so switching sort/filter and back never loses data.
- A task created before this story existed (impossible in practice since storage is in-memory and resets on every server restart, per Story 01's persistence decision) would have no `priority` field; this is not handled with a migration since there is no persistence layer to migrate — restarting the server clears all tasks.

---

## Test Plan

Backend (Jest + Supertest), under `server/`:

1. `server/src/taskStore.test.js` (modify) — `create` defaults to `medium` when no priority is given; `create` accepts an explicit `low`/`medium`/`high`; `create` rejects an invalid priority (`ValidationError`); `setPriority` changes the priority and rejects an invalid value or an unknown id (`NotFoundError`); `setPriority` on another user's task id throws `NotFoundError` (mirrors the existing "another user's task id" test at lines 65–74).
2. `server/src/routes/tasks.test.js` (modify) — `POST /api/tasks` with no priority defaults to `medium` in the response body; `POST /api/tasks` with an invalid priority returns `400`; add a `PATCH /api/tasks/:id/priority` block mirroring the existing `PATCH /api/tasks/:id/status` tests (lines 102–125): valid update (`200`), invalid priority (`400`), unknown id (`404`); extend the `cross-user access` `describe` block (lines 135–177) with a case that a second user's token cannot `PATCH` the first user's task priority (`404`).

Frontend (Vitest + React Testing Library), under `client/`:

3. `client/src/components/TaskForm.test.jsx` (modify) — selecting a priority and submitting a valid title calls `onAdd` with both the title and the selected priority.
4. `client/src/components/TaskItem.test.jsx` (modify) — renders the priority badge text for a task's priority; changing the priority `<select>` calls `onPriorityChange` with the task id and new value (mirrors the existing `toggles status` test at lines 14–19).
5. `client/src/components/TaskList.test.jsx` (modify) — renders the default empty message when `tasks` is empty and no `emptyMessage` prop is given; renders a custom `emptyMessage` when provided.
6. `client/src/App.test.jsx` (modify) — adding a task with a selected priority calls `tasksApi.createTask` with that priority; changing a rendered task's priority calls `tasksApi.setTaskPriority`; selecting a priority filter hides non-matching tasks and shows the "no tasks match" message when nothing matches; selecting a sort order changes the rendered task order (assert via the order of rendered titles).

---

## Verification Steps

1. **Backend builds:** `cd server && npm test`
2. **Backend runs:** `cd server && npm run dev` — with a valid JWT (register/login first), confirm `POST /api/tasks` with no `priority` returns a task with `"priority": "medium"`, and `PATCH /api/tasks/:id/priority` with `{ "priority": "high" }` updates it.
3. **Frontend builds:** `cd client && npm test`
4. **Frontend runs:** `cd client && npm run dev` — with the backend running and logged in: create tasks at different priorities, confirm badges render distinctly, change a task's priority via its dropdown, filter to a single priority, and sort High→Low and Low→High.
5. **Regression:** Re-run the Story 01/02 flows (add/edit/delete/toggle-status a task, login/logout, per-user isolation) confirming they still work with the added priority field present.

---

## Done Criteria

- [ ] Creating a task accepts an optional `priority` of `low`/`medium`/`high`, rejects an invalid value, and defaults to `medium` when omitted (AC1).
- [ ] A task's priority can be changed independently of its title and status (AC2).
- [ ] Each task's priority is shown visually with a text label, not color alone (AC3).
- [ ] The task list can be sorted High → Low and Low → High (AC4).
- [ ] The task list can be filtered to a single priority or "All" (AC5).
- [ ] Priority changes respect per-user task ownership — another user's task id returns `404` (AC6).
- [ ] Existing create/edit/delete/status-toggle behavior from Stories 01 and 02 continues to work unchanged (AC7).
