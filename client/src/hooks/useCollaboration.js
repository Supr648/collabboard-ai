import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../socket/socket';

export const useCollaboration = ({ roomId, user, onRemoteSync, onRemoteAdd, onRemoteDelete, onRemoteClear }) => {
  const [participants, setParticipants] = useState([]);
  const [cursors, setCursors] = useState({});
  const [remoteLiveStroke, setRemoteLiveStroke] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const lastCursorEmitRef = useRef(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Room join payload
    const currentUser = user || {
      id: `guest_${Math.random().toString(36).substr(2, 6)}`,
      name: `Guest ${Math.floor(Math.random() * 900 + 100)}`,
      avatarColor: '#8b5cf6',
    };

    if (socket.connected) {
      socket.emit('join-room', { roomId, user: currentUser });
      setConnectionStatus('connected');
    } else {
      socket.connect();
    }

    const onConnect = () => {
      setConnectionStatus('connected');
      socket.emit('join-room', { roomId, user: currentUser });
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const onRoomParticipants = ({ participants }) => {
      setParticipants(participants || []);
    };

    const onCursorUpdate = ({ socketId, user: cursorUser, x, y, activeTool }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: { user: cursorUser, x, y, activeTool, updatedAt: Date.now() },
      }));
    };

    const onCursorRemove = ({ socketId }) => {
      setCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const onRemoteElementAdd = (element) => {
      setRemoteLiveStroke(null);
      if (onRemoteAdd) onRemoteAdd(element);
    };

    const onRemoteElementDelete = ({ elementId }) => {
      if (onRemoteDelete) onRemoteDelete(elementId);
    };

    const onRemoteCanvasClear = () => {
      if (onRemoteClear) onRemoteClear();
    };

    const onRemoteCanvasSync = ({ elements }) => {
      if (onRemoteSync && Array.isArray(elements)) {
        onRemoteSync(elements);
      }
    };

    const onRemoteDrawLive = (stroke) => {
      setRemoteLiveStroke(stroke);
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-participants', onRoomParticipants);
    socket.on('cursor-update', onCursorUpdate);
    socket.on('cursor-remove', onCursorRemove);
    socket.on('remote-element-add', onRemoteElementAdd);
    socket.on('remote-element-delete', onRemoteElementDelete);
    socket.on('remote-canvas-clear', onRemoteCanvasClear);
    socket.on('remote-canvas-sync', onRemoteCanvasSync);
    socket.on('remote-draw-live', onRemoteDrawLive);

    // Prune stale cursors every 8 seconds
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        let changed = false;
        const next = {};
        for (const [id, c] of Object.entries(prev)) {
          if (now - (c.updatedAt || 0) < 10000) {
            next[id] = c;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 5000);

    return () => {
      clearInterval(pruneInterval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-participants', onRoomParticipants);
      socket.off('cursor-update', onCursorUpdate);
      socket.off('cursor-remove', onCursorRemove);
      socket.off('remote-element-add', onRemoteElementAdd);
      socket.off('remote-element-delete', onRemoteElementDelete);
      socket.off('remote-canvas-clear', onRemoteCanvasClear);
      socket.off('remote-canvas-sync', onRemoteCanvasSync);
      socket.off('remote-draw-live', onRemoteDrawLive);

      socket.emit('leave-room');
    };
  }, [roomId, user]);

  // Throttled cursor emission (max once every 30ms for 30fps smooth live tracking)
  const emitCursorMove = useCallback(
    (x, y, activeTool) => {
      const now = Date.now();
      if (now - lastCursorEmitRef.current > 30) {
        lastCursorEmitRef.current = now;
        const socket = socketRef.current || getSocket();
        if (socket && socket.connected) {
          socket.emit('cursor-move', { roomId, x, y, activeTool });
        }
      }
    },
    [roomId]
  );

  const emitElementAdd = useCallback(
    (element) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('element-add', { roomId, element });
      }
    },
    [roomId]
  );

  const emitElementDelete = useCallback(
    (elementId) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('element-delete', { roomId, elementId });
      }
    },
    [roomId]
  );

  const emitCanvasClear = useCallback(() => {
    const socket = socketRef.current || getSocket();
    if (socket && socket.connected) {
      socket.emit('canvas-clear', { roomId });
    }
  }, [roomId]);

  const emitCanvasSync = useCallback(
    (elements, action = 'sync') => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('canvas-sync', { roomId, elements, action });
      }
    },
    [roomId]
  );

  return {
    participants,
    cursors,
    remoteLiveStroke,
    connectionStatus,
    emitCursorMove,
    emitElementAdd,
    emitElementDelete,
    emitCanvasClear,
    emitCanvasSync,
  };
};
