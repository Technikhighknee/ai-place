import session from 'express-session';
import db from '../DB/index.js';
import SqliteSessionStore from './SqliteSessionStore.js';

export default function sessionMiddleware() {
  return session({
    store: new SqliteSessionStore(db.getInstance('sessions')),
    secret: 'This Needs to change !!! Be 12 12 12; hi github', // TODO
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
  })
}
