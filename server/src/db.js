const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const DEFAULT_DATABASE_PATH = path.join(__dirname, '..', 'data', 'taskflow.db');

let db = null;

// Tests always get a fresh in-memory database per Jest worker, so suites never share state on disk.
function resolveDatabasePath() {
  if (process.env.NODE_ENV === 'test') {
    return ':memory:';
  }
  return process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH;
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  const applied = new Set(database.prepare('SELECT name FROM schema_migrations').pluck().all());
  const pending = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !applied.has(file))
    .sort();

  const record = database.prepare('INSERT INTO schema_migrations (name) VALUES (?)');
  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    database.transaction(() => {
      database.exec(sql);
      record.run(file);
    })();
  }
  return pending;
}

function open(databasePath = resolveDatabasePath()) {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }
  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  migrate(database);
  return database;
}

function getDb() {
  if (!db) {
    db = open();
  }
  return db;
}

function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, open, close, migrate };
