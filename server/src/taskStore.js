const VALID_STATUSES = ['pending', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_PRIORITY = 'medium';

class ValidationError extends Error {}
class NotFoundError extends Error {}

let tasks = [];
let nextId = 1;

function getAll(userId) {
  return tasks.filter((task) => task.userId === userId);
}

function getById(id, userId) {
  return tasks.find((task) => task.id === id && task.userId === userId);
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

function create(title, userId, priority) {
  const task = {
    id: nextId++,
    title: normalizeTitle(title),
    status: 'pending',
    userId,
    priority: normalizePriority(priority),
  };
  tasks.push(task);
  return task;
}

function update(id, title, userId) {
  const task = requireTask(id, userId);
  task.title = normalizeTitle(title);
  return task;
}

function remove(id, userId) {
  const task = requireTask(id, userId);
  tasks = tasks.filter((t) => t.id !== id);
  return task;
}

function setStatus(id, status, userId) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const task = requireTask(id, userId);
  task.status = status;
  return task;
}

function setPriority(id, priority, userId) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new ValidationError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  const task = requireTask(id, userId);
  task.priority = priority;
  return task;
}

function reset() {
  tasks = [];
  nextId = 1;
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
