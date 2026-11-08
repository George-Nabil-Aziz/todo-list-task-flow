const request = require('supertest');
const app = require('../app');
const userStore = require('../userStore');

beforeEach(() => {
  userStore.reset();
});

describe('auth routes', () => {
  test('POST /api/auth/register succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.user.username).toBe('alice');
  });

  test('POST /api/auth/register rejects a duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: '123', username: 'alice' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register rejects a missing username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register allows two different users to share the same username', async () => {
    const first = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    const second = await request(app)
      .post('/api/auth/register')
      .send({ email: 'c@d.com', password: 'secret1', username: 'alice' });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'secret1' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alice');
  });

  test('POST /api/auth/login rejects a wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@b.com', password: 'secret1' });
    expect(res.status).toBe(401);
  });
});

describe('auth route validation', () => {
  test('register rejects a malformed email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'secret1', username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/);
  });

  test('register normalizes email case and whitespace', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: '  Alice@Example.COM ', password: 'secret1', username: 'alice' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
  });

  test('register rejects passwords longer than 72 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'x'.repeat(73), username: 'alice' });
    expect(res.status).toBe(400);
  });

  test('login with missing fields returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('password is required');
  });

  test('register never returns the password hash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret1', username: 'alice' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
