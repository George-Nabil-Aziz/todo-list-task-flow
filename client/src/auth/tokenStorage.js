const STORAGE_KEY = 'todo_auth_token';
const USERNAME_STORAGE_KEY = 'todo_auth_username';

export function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getUsername() {
  return localStorage.getItem(USERNAME_STORAGE_KEY);
}

export function setUsername(username) {
  localStorage.setItem(USERNAME_STORAGE_KEY, username);
}

export function clearUsername() {
  localStorage.removeItem(USERNAME_STORAGE_KEY);
}
