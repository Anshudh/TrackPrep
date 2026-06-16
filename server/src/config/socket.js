import eventService from '../services/eventService.js';

export async function setupSocketIO(server) {
  try {
    const { Server } = await import('socket.io');
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
    console.warn('Socket.io module is not installed. Real-time Socket.io connections are disabled. Fallback to in-process event emittance.', error.message);
    return null;
  }
}
