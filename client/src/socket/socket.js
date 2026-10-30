import { io } from 'socket.io-client';

let socket = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    try {
      const parsed = new URL(import.meta.env.VITE_API_URL);
      return parsed.origin;
    } catch (e) {
      // fallback to raw or origin
    }
  }
  return import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
};

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    // console.log('🟢 Socket connected:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    // console.log('🔴 Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
