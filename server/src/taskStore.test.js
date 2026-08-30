const taskStore = require('./taskStore');

beforeEach(() => {
  taskStore.reset();
});

describe('taskStore', () => {
  test('create adds a task with pending status', () => {
    const task = taskStore.create('Buy milk', 1);
    expect(task).toMatchObject({ title: 'Buy milk', status: 'pending', userId: 1 });
    expect(taskStore.getAll(1)).toHaveLength(1);
  });

  test('create defaults priority to medium when omitted', () => {
    const task = taskStore.create('Buy milk', 1);
    expect(task.priority).toBe('medium');
  });

  test('create accepts an explicit valid priority', () => {
    expect(taskStore.create('Buy milk', 1, 'low').priority).toBe('low');
    expect(taskStore.create('Buy milk', 1, 'medium').priority).toBe('medium');
    expect(taskStore.create('Buy milk', 1, 'high').priority).toBe('high');
  });

  test('create rejects an invalid priority', () => {
    expect(() => taskStore.create('Buy milk', 1, 'urgent')).toThrow(taskStore.ValidationError);
  });

  test('create rejects empty or whitespace-only titles', () => {
    expect(() => taskStore.create('', 1)).toThrow(taskStore.ValidationError);
    expect(() => taskStore.create('   ', 1)).toThrow(taskStore.ValidationError);
  });

  test('update changes the title', () => {
    const task = taskStore.create('Buy milk', 1);
    const updated = taskStore.update(task.id, '  Buy oat milk  ', 1);
    expect(updated.title).toBe('Buy oat milk');
  });

  test('update rejects empty/whitespace titles and unknown id', () => {
    const task = taskStore.create('Buy milk', 1);
    expect(() => taskStore.update(task.id, '   ', 1)).toThrow(taskStore.ValidationError);
    expect(() => taskStore.update(9999, 'New title', 1)).toThrow(taskStore.NotFoundError);
  });

  test('remove deletes a task', () => {
    const task = taskStore.create('Buy milk', 1);
    taskStore.remove(task.id, 1);
    expect(taskStore.getAll(1)).toHaveLength(0);
  });

  test('remove rejects unknown id', () => {
    expect(() => taskStore.remove(9999, 1)).toThrow(taskStore.NotFoundError);
  });

  test('setStatus toggles status', () => {
    const task = taskStore.create('Buy milk', 1);
    const completed = taskStore.setStatus(task.id, 'completed', 1);
    expect(completed.status).toBe('completed');
    const pending = taskStore.setStatus(task.id, 'pending', 1);
    expect(pending.status).toBe('pending');
  });

  test('setStatus rejects invalid status values and unknown id', () => {
    const task = taskStore.create('Buy milk', 1);
    expect(() => taskStore.setStatus(task.id, 'archived', 1)).toThrow(taskStore.ValidationError);
    expect(() => taskStore.setStatus(9999, 'completed', 1)).toThrow(taskStore.NotFoundError);
  });

  test('setPriority changes the priority', () => {
    const task = taskStore.create('Buy milk', 1);
    const updated = taskStore.setPriority(task.id, 'high', 1);
    expect(updated.priority).toBe('high');
  });

  test('setPriority rejects invalid priority values and unknown id', () => {
    const task = taskStore.create('Buy milk', 1);
    expect(() => taskStore.setPriority(task.id, 'urgent', 1)).toThrow(taskStore.ValidationError);
    expect(() => taskStore.setPriority(9999, 'high', 1)).toThrow(taskStore.NotFoundError);
  });

  test('getAll only returns tasks belonging to the requesting user', () => {
    taskStore.create('User 1 task A', 1);
    taskStore.create('User 1 task B', 1);
    const user2Task = taskStore.create('User 2 task', 2);

    expect(taskStore.getAll(1)).toHaveLength(2);
    expect(taskStore.getAll(2)).toHaveLength(1);
    expect(taskStore.getAll(2)[0].id).toBe(user2Task.id);
  });

  test('update/remove/setStatus on another user\'s task id throw NotFoundError', () => {
    const task = taskStore.create('User 1 task', 1);

    expect(() => taskStore.update(task.id, 'New title', 2)).toThrow(taskStore.NotFoundError);
    expect(() => taskStore.setStatus(task.id, 'completed', 2)).toThrow(taskStore.NotFoundError);
    expect(() => taskStore.remove(task.id, 2)).toThrow(taskStore.NotFoundError);

    // task is untouched and still owned by user 1
    expect(taskStore.getAll(1)).toHaveLength(1);
  });

  test('setPriority on another user\'s task id throws NotFoundError', () => {
    const task = taskStore.create('User 1 task', 1);
    expect(() => taskStore.setPriority(task.id, 'high', 2)).toThrow(taskStore.NotFoundError);
  });
});
