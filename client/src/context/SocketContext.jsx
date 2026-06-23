import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setJoinedRoom(null);
      setRoomMessages([]);
      setActiveRooms([]);
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const s = io(backendUrl, {
      withCredentials: true,
      autoConnect: true,
    });

    setSocket(s);

    const handleActivity = (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 10));
    };

    const handleRoomMessage = (msg) => {
      setRoomMessages((prev) => [...prev, msg]);
    };

    const handleRoomsUpdate = (rooms) => {
      setActiveRooms(rooms || []);
    };

    s.on('live_activity', handleActivity);
    s.on('room_message', handleRoomMessage);
    s.on('rooms_update', handleRoomsUpdate);

    console.log('Global Socket.io connection established.');

    return () => {
      s.off('live_activity', handleActivity);
      s.off('room_message', handleRoomMessage);
      s.off('rooms_update', handleRoomsUpdate);
      s.disconnect();
    };
  }, [isAuthenticated]);

  const joinRoom = (roomName) => {
    if (!socket) return;
    if (joinedRoom && joinedRoom !== roomName) {
      socket.emit('leave_room', joinedRoom);
    }
    socket.emit('join_room', roomName);
    setJoinedRoom(roomName);
    setRoomMessages([]);
  };

  const leaveRoom = () => {
    if (!socket || !joinedRoom) return;
    socket.emit('leave_room', joinedRoom);
    setJoinedRoom(null);
    setRoomMessages([]);
  };

  const sendRoomMessage = (text) => {
    if (!socket || !joinedRoom) return;
    socket.emit('send_room_message', {
      room: joinedRoom,
      text,
      sender: user?.name || 'Me'
    });
  };

  return (
    <SocketContext.Provider value={{
      socket,
      activities,
      joinedRoom,
      roomMessages,
      activeRooms,
      joinRoom,
      leaveRoom,
      sendRoomMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
