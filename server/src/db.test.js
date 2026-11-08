const fs = require('fs');
const os = require('os');
const path = require('path');
const db = require('./db');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-db-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('db', () => {
  test('open applies every migration and records it', () => {
    const database = db.open(path.join(tmpDir, 'test.db'));
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .pluck()
      .all();
    expect(tables).toEqual(expect.arrayContaining(['users', 'tasks', 'schema_migrations']));
    expect(database.prepare('SELECT name FROM schema_migrations').pluck().all()).toContain(
      '001_init.sql',
    );
    database.close();
  });

  test('migrate is idempotent on an already-migrated database', () => {
    const database = db.open(path.join(tmpDir, 'test.db'));
    expect(db.migrate(database)).toEqual([]);
    database.close();
  });

  test('data persists across reopening the same file', () => {
    const file = path.join(tmpDir, 'test.db');
    const first = db.open(file);
    first
      .prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
      .run('a@b.com', 'a', 'hash');
    first.close();

    const second = db.open(file);
    expect(second.prepare('SELECT email FROM users').pluck().all()).toEqual(['a@b.com']);
    second.close();
  });

  test('deleting a user cascades to their tasks', () => {
    const database = db.open(path.join(tmpDir, 'test.db'));
    const { lastInsertRowid } = database
      .prepare('INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)')
      .run('a@b.com', 'a', 'hash');
    database.prepare('INSERT INTO tasks (user_id, title) VALUES (?, ?)').run(lastInsertRowid, 'x');
    database.prepare('DELETE FROM users WHERE id = ?').run(lastInsertRowid);
    expect(database.prepare('SELECT COUNT(*) FROM tasks').pluck().get()).toBe(0);
    database.close();
  });
});
