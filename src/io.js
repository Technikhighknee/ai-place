import { Server } from 'socket.io';
import sessionMiddleware from './Session/sessionMiddleware.js';

let io = null;
export default io;

const connectedSessions = new Map();

export function setupSocketIO(server, options) {
  io = new Server(server, options);

  io.use((socket, next) => {
    sessionMiddleware()(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    if (!(connectedSessions.get(socket.request.session.id) instanceof Set)) {
      connectedSessions.set(socket.request.session.id, new Set());
    }
    connectedSessions.get(socket.request.session.id).add(socket.id);    
    socket.on('disconnect', () => {
      connectedSessions.get(socket.request.session.id).delete(socket.id);
      if (connectedSessions.get(socket.request.session.id).size === 0) {
        connectedSessions.delete(socket.request.session.id);
      }
    });
  });
}

export function emit(sessionId, event, data) {
  if (connectedSessions.has(sessionId)) {
    const sockets = connectedSessions.get(sessionId);
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
}
