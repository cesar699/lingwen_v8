const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/lingwen.db');
db.serialize(() => {
db.run(`CREATE TABLE IF NOT EXISTS api_providers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  config TEXT,
  active INTEGER
)`);
  db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, type TEXT, data TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY, title TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS schedule (id INTEGER PRIMARY KEY, date TEXT, target INTEGER)`);
});
module.exports = db;
