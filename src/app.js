import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import sessionMiddleware from './Session/sessionMiddleware.js';
import { isAuthenticated, isNotAuthenticated, handleLogin, handleLogout } from './controller/authController.js';
import { renderRoot, renderLogin, renderChat, renderSettings } from './controller/pageController.js';
import { handleChatMessage } from './controller/chatController.js';

const app = express();
app.set('view engine', 'pug');
app.set('views', `${import.meta.dirname}/views/`)

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/static/', express.static(`${import.meta.dirname}/public/`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware());

app.get('/', isAuthenticated, renderRoot);
app.get(['/chat', '/chat/:chat_id'], isAuthenticated, renderChat);
app.get('/auth/login', isNotAuthenticated, renderLogin);
app.get('/settings', isAuthenticated, renderSettings);

app.post(['/chat', '/chat/:chat_id'], isAuthenticated, handleChatMessage);
app.post('/auth/login', isNotAuthenticated, handleLogin);

app.all('/auth/logout', isAuthenticated, handleLogout);
export default app;
