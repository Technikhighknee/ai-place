import { v4 as uuidv4 } from 'uuid';

export default class ChatModule {
  constructor(db) {
    this.db = db;
    this.#initChatTable();
  }

  #initChatTable() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )  
    `).run();
  }

  createChat(title = null) {
    const id = uuidv4();
    const table = this.#getTableName(id);

    this.db.prepare(`INSERT INTO chats (id, title) VALUES (?, ?)`).run(id, title);

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    return id;
  }

  saveMessage(chat_id, role, content) {
    const table = this.#getTableName(chat_id);
    this.db.prepare(`
      INSERT INTO ${table} (role, content) VALUES (?, ?)  
    `).run(role, content);
  }

  getMessages(chat_id) {
    const table = this.#getTableName(chat_id);
    return this.db.prepare(`
      SELECT role, content, timestamp FROM ${table} ORDER BY timestamp ASC
    `).all();
  }

  getChat(chat_id) {
    const chat = this.db.prepare(`SELECT * FROM chats WHERE id = ?`).get(chat_id);
    if (!chat) return null;
    const messages = this.getMessages(chat_id);
    return { ...chat, messages };
  }

  listChats() {
    return this.db.prepare(`
      SELECT * FROM chats ORDER BY created_at DESC
    `).all();
  }

  deleteChat(chat_id) {
    const table = this.#getTableName(chat_id);
    this.db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    this.db.prepare(`DELETE FROM chats WHERE id = ?`).run(chat_id);
  }

  exists(chat_id) {
    const row = this.db.prepare(`SELECT 1 FROM chats WHERE id = ?`).get(chat_id);
    return !!row;
  }

  #getTableName(chat_id) {
    if (!/^[a-zA-Z0-9_-]+$/.test(chat_id)) throw new Error('Invalid chat_id');
    return `messages_${chat_id.replace(/-/g, '_')}`;
  }
}
