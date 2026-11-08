const { getDb } = require('./db');

class ValidationError extends Error {}
class ConflictError extends Error {}

function toUser(row) {
  if (!row) {
    return undefined;
  }
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

function normalizeEmail(email) {
  const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!trimmed) {
    throw new ValidationError('email is required and cannot be empty');
  }
  return trimmed;
}

function findByEmail(email) {
  const normalized = normalizeEmail(email);
  return toUser(getDb().prepare('SELECT * FROM users WHERE email = ?').get(normalized));
}

function findById(id) {
  return toUser(getDb().prepare('SELECT * FROM users WHERE id = ?').get(id));
}

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
  const { lastInsertRowid } = getDb()
    .prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
    .run(normalizedEmail, normalizedUsername, passwordHash);
  return findById(Number(lastInsertRowid));
}

// Test helper: empties the table (tasks cascade) and restarts ids at 1.
function reset() {
  const db = getDb();
  db.exec("DELETE FROM users; DELETE FROM sqlite_sequence WHERE name IN ('users', 'tasks');");
}

module.exports = {
  findByEmail,
  findById,
  register,
  reset,
  ValidationError,
  ConflictError,
};
