import session from 'express-session';
import db from '../DB/index.js';
import SqliteSessionStore from './SqliteSessionStore.js';

export default function sessionMiddleware() {
  return session({
    store: new SqliteSessionStore(db.getInstance('sessions')),
    secret: db.settings.get('sessionSecret'),
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: db.settings.get('sessionMaxAge'),
    },
    resave: false,
    saveUninitialized: false,
  })
}
