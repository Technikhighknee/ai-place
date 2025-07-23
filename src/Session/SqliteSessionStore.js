import { Store } from 'express-session';

export default class SqliteSessionStore extends Store {
  constructor(db) {
    super();
    this.db = db;

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        session TEXT NOT NULL,
        expire INTEGER NOT NULL
      )
    `).run();
  }

  get(sid, callback) {
    try {
      const row = this.db.prepare(`SELECT session FROM sessions WHERE sid = ? AND expire > ?`).get(sid, Date.now());
      if (!row) return callback(null, null);
      callback(null, JSON.parse(row.session));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, session, callback) {
    try {
      session = JSON.stringify(session);
      const expire = Date.now() + (session.cookie?.maxAge || 1 * 24 * 60 * 1000);
      this.db.prepare(`
        INSERT INTO sessions (sid, session, expire) VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET session = excluded.session, expire = excluded.expire  
      `).run(sid, session, expire);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback) {
    try {
      this.db.prepare(`DELETE FROM sessions WHERE sid = ?`).run(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  clear(callback) {
    try {
      this.db.prepare(`DELETE FROM sessions`).run();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  length(callback) {
    try {
      const { count } = this.db.prepare(`SELECT COUNT (*) as count FROM sessions`).get();
      callback(null, count);
    } catch (error) {
      callback(error);
    }
  }
}
