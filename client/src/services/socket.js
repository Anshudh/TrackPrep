import { useEffect, useState } from 'react';

// Pluggable socket connection instance
let socket = null;

// Dynamic import wrapper to support socket.io-client if installed later
export const getSocket = async () => {
  if (socket) return socket;

  try {
    const pkgName = 'socket.io-client';
    const { io } = await import(/* @vite-ignore */ pkgName);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    socket = io(backendUrl, {
      withCredentials: true,
      autoConnect: false,
    });
    
    console.log('Socket.io-client initialized successfully.');
    return socket;
  } catch (error) {
    console.warn('socket.io-client is not installed or failed to initialize. Socket features will run in mock/local fallback mode.', error.message);
    
    // Provide a mock socket client so the app runs smoothly
    socket = {
      connect: () => {
        console.log('[Mock Socket] Connected (Simulated)');
        // Trigger a simulated connection update event if needed
      },
      disconnect: () => {
        console.log('[Mock Socket] Disconnected (Simulated)');
      },
      on: (event, cb) => {
        console.log(`[Mock Socket] Registered listener for: ${event}`);
        if (!window._mockSocketCallbacks) window._mockSocketCallbacks = {};
        window._mockSocketCallbacks[event] = cb;
      },
      off: (event) => {
        console.log(`[Mock Socket] Unregistered listener for: ${event}`);
        if (window._mockSocketCallbacks) delete window._mockSocketCallbacks[event];
      },
      emit: (event, ...args) => {
        console.log(`[Mock Socket] Emitting event: ${event}`, args);
        
        // Simulating the room message return locally for study groups mock
        if (event === 'send_room_message') {
          const { room, text, sender } = args[0] || {};
          const triggerMsg = window._mockSocketCallbacks?.['room_message'];
          if (triggerMsg) {
            setTimeout(() => {
              triggerMsg({
                sender: sender || 'Me',
                text,
                timestamp: new Date().toISOString()
              });
            }, 300);

            // Simulate a peer response after 2 seconds
            setTimeout(() => {
              triggerMsg({
                sender: 'CodeBuddy',
                text: `Awesome progress! I just finished review on my side too. Keep it up in room ${room}!`,
                timestamp: new Date().toISOString()
              });
            }, 2000);
          }
        }
      },
    };
    return socket;
  }
};

// React hook to use socket easily in components
export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    let active = true;
    getSocket().then((s) => {
      if (active) {
        setSocketInstance(s);
        s.connect();
      }
    });

    return () => {
      active = false;
      if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect();
      }
    };
  }, []);

  return socketInstance;
};
