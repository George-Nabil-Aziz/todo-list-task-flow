import { getToken } from '../auth/tokenStorage.js';

const BASE_URL = '/api/tasks';

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

export function fetchTasks() {
  return fetch(BASE_URL, { headers: authHeaders() }).then(handleResponse);
}

export function createTask(title, priority) {
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, priority }),
  }).then(handleResponse);
}

export function updateTask(id, title) {
  return fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title }),
  }).then(handleResponse);
}

export function deleteTask(id) {
  return fetch(`${BASE_URL}/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse);
}

export function setTaskStatus(id, status) {
  return fetch(`${BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  }).then(handleResponse);
}

export function setTaskPriority(id, priority) {
  return fetch(`${BASE_URL}/${id}/priority`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ priority }),
  }).then(handleResponse);
}
