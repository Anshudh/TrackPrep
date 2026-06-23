import { EventEmitter } from 'events';

class EventService extends EventEmitter {
  constructor() {
    super();
    this.io = null;
  }

  getActiveRooms() {
    if (!this.io) return [];
    const rooms = this.io.sockets.adapter.rooms;
    const sids = this.io.sockets.adapter.sids;
    const activeRooms = [];

    for (const [room, participants] of rooms.entries()) {
      // If the room name is in sids, it means it's a private individual socket room
      if (sids.has(room)) {
        continue;
      }
      activeRooms.push({
        name: room,
        count: participants.size
      });
    }
    return activeRooms;
  }

  initSocketIO(io) {
    this.io = io;
    console.log('Socket.io integrated with EventService.');

    this.io.on('connection', (socket) => {
      console.log(`Socket client connected: ${socket.id}`);

      // Send initial active rooms to client
      socket.emit('rooms_update', this.getActiveRooms());

      // Handle joining a study group room
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket client ${socket.id} joined room: ${room}`);
        
        // Notify other members in the study room
        socket.to(room).emit('user_joined', { socketId: socket.id });

        // Broadcast updated room list
        this.io.emit('rooms_update', this.getActiveRooms());
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

        // Broadcast updated room list
        this.io.emit('rooms_update', this.getActiveRooms());
      });

      socket.on('disconnect', () => {
        console.log(`Socket client disconnected: ${socket.id}`);
        // Broadcast updated room list
        this.io.emit('rooms_update', this.getActiveRooms());
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

