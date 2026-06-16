import { EventEmitter } from 'events';

class EventService extends EventEmitter {
  constructor() {
    super();
    this.io = null;
  }

  initSocketIO(io) {
    this.io = io;
    console.log('Socket.io integrated with EventService.');

    this.io.on('connection', (socket) => {
      console.log(`Socket client connected: ${socket.id}`);

      // Handle joining a study group room
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket client ${socket.id} joined room: ${room}`);
        
        // Notify other members in the study room
        socket.to(room).emit('user_joined', { socketId: socket.id });
      });

      // Handle sharing message or updates in study group room
      socket.on('send_room_message', (data) => {
        const { room, text, sender } = data;
        if (room && text) {
          console.log(`Message in room ${room} from ${sender || 'Unknown'}: ${text}`);
          // Broadcast to everyone in the room (including sender)
          this.io.to(room).emit('room_message', {
            sender: sender || 'Peer',
            text,
            timestamp: new Date().toISOString()
          });
        }
      });

      socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`Socket client ${socket.id} left room: ${room}`);
        
        socket.to(room).emit('user_left', { socketId: socket.id });
      });

      socket.on('disconnect', () => {
        console.log(`Socket client disconnected: ${socket.id}`);
      });
    });

    // Listen to local activity events and broadcast them to all Socket.io clients
    this.on('activity', (data) => {
      if (this.io) {
        this.io.emit('live_activity', data);
      }
    });
  }

  emitActivity(userId, actionText, entityTitle, userName = 'Someone') {
    const payload = {
      userId,
      userName,
      actionText,     // e.g. "solved a problem", "added an application", "completed a task"
      entityTitle,    // e.g. "Two Sum (LeetCode)", "Google - Software Engineer", "Review React context"
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };
    
    // Emit locally within Node.js process
    this.emit('activity', payload);
  }
}

export default new EventService();
