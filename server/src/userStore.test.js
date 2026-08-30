const userStore = require('./userStore');

beforeEach(() => {
  userStore.reset();
});

describe('userStore', () => {
  test('register creates a user', () => {
    const user = userStore.register('foo@example.com', 'hashed-password', 'foouser');
    expect(user).toMatchObject({
      email: 'foo@example.com',
      passwordHash: 'hashed-password',
      username: 'foouser',
    });
    expect(user.id).toBeDefined();
  });

  test('register rejects a duplicate email', () => {
    userStore.register('foo@example.com', 'hashed-password', 'foouser');
    expect(() => userStore.register('foo@example.com', 'other-hash', 'otheruser')).toThrow(
      userStore.ConflictError,
    );
  });

  test('register rejects an empty email', () => {
    expect(() => userStore.register('', 'hashed-password', 'foouser')).toThrow(
      userStore.ValidationError,
    );
    expect(() => userStore.register('   ', 'hashed-password', 'foouser')).toThrow(
      userStore.ValidationError,
    );
  });

  test('register rejects an empty or whitespace-only username', () => {
    expect(() => userStore.register('foo@example.com', 'hashed-password', '')).toThrow(
      userStore.ValidationError,
    );
    expect(() => userStore.register('foo@example.com', 'hashed-password', '   ')).toThrow(
      userStore.ValidationError,
    );
  });

  test('register allows two different users to share the same username', () => {
    const first = userStore.register('foo@example.com', 'hashed-password', 'sameuser');
    const second = userStore.register('bar@example.com', 'other-hash', 'sameuser');
    expect(first.username).toBe('sameuser');
    expect(second.username).toBe('sameuser');
    expect(first.id).not.toBe(second.id);
  });

  test('findByEmail finds a registered user case-insensitively', () => {
    userStore.register('Foo@Example.com', 'hashed-password', 'foouser');
    const found = userStore.findByEmail('foo@example.com');
    expect(found).toBeDefined();
    expect(found.email).toBe('foo@example.com');
  });
});
