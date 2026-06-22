import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Pluggable socket connection instance
let socket = null;

// Static connection helper
export const getSocket = async () => {
  if (socket) return socket;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  socket = io(backendUrl, {
    withCredentials: true,
    autoConnect: false,
  });
  
  console.log('Socket.io-client initialized successfully.');
  return socket;
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
