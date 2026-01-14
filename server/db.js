const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Remove any unique indexes on email so duplicate emails are allowed
  db.all(`PRAGMA index_list('users')`, (err, rows) => {
    if (err || !rows) return;
    rows.forEach(r => {
      if (r.unique) {
        const name = r.name;
        try { db.run(`DROP INDEX IF EXISTS ${name}`); } catch (e) { /* ignore */ }
      }
    });
  });
});

function createUser(email, passwordHash) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    stmt.run(email, passwordHash, function (err) {
      stmt.finalize();
      if (err) return reject(err);
      resolve({ id: this.lastID, email });
    });
  });
}

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

module.exports = { createUser, findUserByEmail, dbPath: DB_PATH };
