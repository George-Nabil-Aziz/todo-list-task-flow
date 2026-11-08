const { getDb } = require('./db');

const VALID_STATUSES = ['pending', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_PRIORITY = 'medium';

class ValidationError extends Error {}
class NotFoundError extends Error {}

function toTask(row) {
  if (!row) {
    return undefined;
  }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getAll(userId) {
  return getDb().prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY id').all(userId).map(toTask);
}

function getById(id, userId) {
  return toTask(getDb().prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId));
}

function requireTask(id, userId) {
  const task = getById(id, userId);
  if (!task) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return task;
}

function normalizeTitle(title) {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  if (!trimmed) {
    throw new ValidationError('title is required and cannot be empty or whitespace-only');
  }
  return trimmed;
}

function normalizePriority(priority) {
  if (priority === undefined || priority === null) {
    return DEFAULT_PRIORITY;
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return priority;
}

// Updates one column of a task the user owns and returns the fresh row.
function updateField(id, userId, column, value) {
  requireTask(id, userId);
  getDb()
    .prepare(
      `UPDATE tasks SET ${column} = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND user_id = ?`,
    )
    .run(value, id, userId);
  return getById(id, userId);
}

function create(title, userId, priority) {
  const normalizedTitle = normalizeTitle(title);
  const normalizedPriority = normalizePriority(priority);
  const { lastInsertRowid } = getDb()
    .prepare('INSERT INTO tasks (user_id, title, priority) VALUES (?, ?, ?)')
    .run(userId, normalizedTitle, normalizedPriority);
  return getById(Number(lastInsertRowid), userId);
}

function update(id, title, userId) {
  return updateField(id, userId, 'title', normalizeTitle(title));
}

function remove(id, userId) {
  const task = requireTask(id, userId);
  getDb().prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId);
  return task;
}

function setStatus(id, status, userId) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return updateField(id, userId, 'status', status);
}

function setPriority(id, priority, userId) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return updateField(id, userId, 'priority', priority);
}

// Test helper: empties the table and restarts ids at 1.
function reset() {
  getDb().exec("DELETE FROM tasks; DELETE FROM sqlite_sequence WHERE name = 'tasks';");
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  setStatus,
  setPriority,
  reset,
  ValidationError,
  NotFoundError,
  VALID_PRIORITIES,
};
