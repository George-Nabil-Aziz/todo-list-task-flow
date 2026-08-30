import { describe, expect, test, vi, beforeEach } from 'vitest';
import { register, login } from './authApi.js';

function mockFetchResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('authApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  test('register resolves with the parsed body on success', async () => {
    global.fetch.mockReturnValue(
      mockFetchResponse(201, { token: 'abc123', user: { id: 1, email: 'a@b.com', username: 'alice' } }),
    );

    const result = await register('a@b.com', 'secret1', 'alice');

    expect(result).toEqual({
      token: 'abc123',
      user: { id: 1, email: 'a@b.com', username: 'alice' },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  test('register sends the username in the request body', async () => {
    global.fetch.mockReturnValue(
      mockFetchResponse(201, { token: 'abc123', user: { id: 1, email: 'a@b.com', username: 'alice' } }),
    );

    await register('a@b.com', 'secret1', 'alice');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ body: JSON.stringify({ email: 'a@b.com', password: 'secret1', username: 'alice' }) }),
    );
  });

  test('register throws with the server error message on a non-2xx response', async () => {
    global.fetch.mockReturnValue(mockFetchResponse(409, { error: 'email already registered' }));

    await expect(register('a@b.com', 'secret1', 'alice')).rejects.toThrow(
      'email already registered',
    );
  });

  test('login resolves with the parsed body on success', async () => {
    global.fetch.mockReturnValue(
      mockFetchResponse(200, { token: 'abc123', user: { id: 1, email: 'a@b.com' } }),
    );

    const result = await login('a@b.com', 'secret1');

    expect(result).toEqual({ token: 'abc123', user: { id: 1, email: 'a@b.com' } });
  });

  test('login throws with the server error message on a non-2xx response', async () => {
    global.fetch.mockReturnValue(mockFetchResponse(401, { error: 'Invalid email or password' }));

    await expect(login('a@b.com', 'wrongpass')).rejects.toThrow('Invalid email or password');
  });
});
