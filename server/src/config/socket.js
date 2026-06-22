import eventService from '../services/eventService.js';
import { Server } from 'socket.io';

export function setupSocketIO(server) {
  try {
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
      }
    });

    eventService.initSocketIO(io);
    console.log('Socket.io configuration registered and initialized.');
    return io;
  } catch (error) {
    console.warn('Socket.io failed to initialize. Real-time connections are disabled.', error.message);
    return null;
  }
}
