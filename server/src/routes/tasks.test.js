const request = require('supertest');
const app = require('../app');
const taskStore = require('../taskStore');
const userStore = require('../userStore');
const { signToken } = require('../authMiddleware');

let authHeader;
let otherAuthHeader;

beforeEach(() => {
  taskStore.reset();
  userStore.reset();

  const user = userStore.register('a@b.com', 'hashed-password', 'usera');
  authHeader = `Bearer ${signToken(user)}`;

  const otherUser = userStore.register('c@d.com', 'hashed-password', 'userc');
  otherAuthHeader = `Bearer ${signToken(otherUser)}`;
});

describe('tasks routes', () => {
  test('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', status: 'pending' });
  });

  test('POST /api/tasks with no priority defaults to medium', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('medium');
  });

  test('POST /api/tasks with an invalid priority returns 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk', priority: 'urgent' });
    expect(res.status).toBe(400);
  });

  test('POST /api/tasks rejects empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  test('GET /api/tasks returns created tasks', async () => {
    await request(app).post('/api/tasks').set('Authorization', authHeader).send({ title: 'Buy milk' });
    const res = await request(app).get('/api/tasks').set('Authorization', authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/tasks with no Authorization header returns 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  test('PUT /api/tasks/:id updates the title', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .set('Authorization', authHeader)
      .send({ title: 'Buy oat milk' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Buy oat milk');
  });

  test('PUT /api/tasks/:id rejects invalid title', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .set('Authorization', authHeader)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/tasks/:id returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/tasks/9999')
      .set('Authorization', authHeader)
      .send({ title: 'New title' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/tasks/:id removes an existing task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .delete(`/api/tasks/${created.body.id}`)
      .set('Authorization', authHeader);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/tasks').set('Authorization', authHeader);
    expect(list.body).toHaveLength(0);
  });

  test('DELETE /api/tasks/:id returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/tasks/9999').set('Authorization', authHeader);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/tasks/:id/status updates status', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  test('PATCH /api/tasks/:id/status rejects invalid status', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/status`)
      .set('Authorization', authHeader)
      .send({ status: 'archived' });
    expect(res.status).toBe(400);
  });

  test('PATCH /api/tasks/:id/status returns 404 for unknown id', async () => {
    const res = await request(app)
      .patch('/api/tasks/9999/status')
      .set('Authorization', authHeader)
      .send({ status: 'completed' });
    expect(res.status).toBe(404);
  });

  test('PATCH /api/tasks/:id/priority updates priority', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/priority`)
      .set('Authorization', authHeader)
      .send({ priority: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('high');
  });

  test('PATCH /api/tasks/:id/priority rejects invalid priority', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', authHeader)
      .send({ title: 'Buy milk' });
    const res = await request(app)
      .patch(`/api/tasks/${created.body.id}/priority`)
      .set('Authorization', authHeader)
      .send({ priority: 'urgent' });
    expect(res.status).toBe(400);
  });

  test('PATCH /api/tasks/:id/priority returns 404 for unknown id', async () => {
    const res = await request(app)
      .patch('/api/tasks/9999/priority')
      .set('Authorization', authHeader)
      .send({ priority: 'high' });
    expect(res.status).toBe(404);
  });

  describe('cross-user access', () => {
    test("a second user's token cannot see the first user's tasks via GET", async () => {
      await request(app).post('/api/tasks').set('Authorization', authHeader).send({ title: 'Buy milk' });
      const res = await request(app).get('/api/tasks').set('Authorization', otherAuthHeader);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    test("a second user's token cannot PUT the first user's task", async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', authHeader)
        .send({ title: 'Buy milk' });
      const res = await request(app)
        .put(`/api/tasks/${created.body.id}`)
        .set('Authorization', otherAuthHeader)
        .send({ title: 'Hijacked title' });
      expect(res.status).toBe(404);
    });

    test("a second user's token cannot DELETE the first user's task", async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', authHeader)
        .send({ title: 'Buy milk' });
      const res = await request(app)
        .delete(`/api/tasks/${created.body.id}`)
        .set('Authorization', otherAuthHeader);
      expect(res.status).toBe(404);
    });

    test("a second user's token cannot PATCH the first user's task status", async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', authHeader)
        .send({ title: 'Buy milk' });
      const res = await request(app)
        .patch(`/api/tasks/${created.body.id}/status`)
        .set('Authorization', otherAuthHeader)
        .send({ status: 'completed' });
      expect(res.status).toBe(404);
    });

    test("a second user's token cannot PATCH the first user's task priority", async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', authHeader)
        .send({ title: 'Buy milk' });
      const res = await request(app)
        .patch(`/api/tasks/${created.body.id}/priority`)
        .set('Authorization', otherAuthHeader)
        .send({ priority: 'high' });
      expect(res.status).toBe(404);
    });
  });
});
