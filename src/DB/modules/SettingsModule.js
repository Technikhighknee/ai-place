export default class {
  constructor(db) {
    this.db = db;
    this.#initialize();
  }

  #initialize() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    `).run();
  }

  get(...keys) {
    if (keys.length === 0) return {};

    const placeholders = keys.map(() => '?').join(', ');
    const statement = this.db.prepare(`
      SELECT key, value FROM settings
      WHERE key IN (${placeholders})  
    `);

    const rows = statement.all(...keys);
    if (rows.length === 1) {
      return JSON.parse(rows[0].value);
    }
    return Object.fromEntries(rows.map(({ key, value }) => [key, JSON.parse(value)]));
  }

  getAll() {
    const rows = this.db.prepare(`SELECT key, value FROM settings`).all();
    return Object.fromEntries(rows.map(({ key, value }) => [key, JSON.parse(value)]));
  }

  has(key) {
    const row = this.db.prepare(`SELECT 1 FROM settings WHERE key = ?`).get(key)
    return !!row;
  }

  set(key, value) {
    const statement = this.db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value  
    `);
    statement.run(key, JSON.stringify(value));
  }

  delete(...keys) {
    if (keys.length === 0) return {};

    const placeholders = keys.map(() => '?').join(', ');
    this.db.prepare(`
      DELETE FROM settings WHERE key IN (${placeholders})  
    `).run(...keys);
  }
}
