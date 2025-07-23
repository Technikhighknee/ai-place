import Database from 'better-sqlite3';
import ChatModule from './modules/ChatModule.js';
import SettingsModule from './modules/SettingsModule.js';

const DB_ROOT_DIR = './data/db'
const dbPaths = {
  sessions: `${DB_ROOT_DIR}/sessions.db`,
  settings: `${DB_ROOT_DIR}/settings.db`,
  chats: `${DB_ROOT_DIR}/chats.db`,
};

class DatabaseManager {
  constructor() {
    this.instances = new Map();

    for (const [key, path] of Object.entries(dbPaths)) {
      const db = new Database(path);
      this.instances.set(key, db);
    }
    this.chats = new ChatModule(this.instances.get('chats'));
    this.settings = new SettingsModule(this.instances.get('settings'));
  }

  getInstance(name) {
    return this.instances.get(name);
  }
}

export default new DatabaseManager();
