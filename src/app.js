import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { isAuthenticated, isNotAuthenticated, handleLogin } from './controller/authController.js';
import { renderRoot, renderLogin, renderChat, renderSettings } from './controller/pageController.js';
import { handleChatMessage } from './controller/chatController.js';

const app = express();
app.set('view engine', 'pug');
app.set('views', 'src/views/')

app.use(helmet());
app.use('/static/', express.static('public/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'This Needs to change !!! Be 12 12 12; hi github', // TODO
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 1000,
  },
  resave: false,
  saveUninitialized: false,
}));

app.get('/', isAuthenticated, renderRoot);
app.get(['/chat', '/chat/:chat_id'], isAuthenticated, renderChat);
app.get('/auth/login', isNotAuthenticated, renderLogin);
// app.get('/settings', isAuthenticated, renderSettings);

app.post(['/chat', '/chat/:chat_id'], isAuthenticated, handleChatMessage);
// app.post('/auth/logout', isAuthenticated, handleLogout);
app.post('/auth/login', isNotAuthenticated, handleLogin);

export default app;
