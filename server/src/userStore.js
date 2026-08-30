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
