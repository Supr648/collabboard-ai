import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../socket/socket';

export const useCollaboration = ({
  roomId,
  user,
  role = 'editor',
  onRemoteSync,
  onRemoteAdd,
  onRemoteUpdate,
  onRemoteDelete,
  onRemoteClear,
}) => {
  const [participants, setParticipants] = useState([]);
  const [cursors, setCursors] = useState({});
  const [remoteLiveStroke, setRemoteLiveStroke] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [incomingReactions, setIncomingReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [remoteLaserTrail, setRemoteLaserTrail] = useState([]);
  const [remotePresentationSlide, setRemotePresentationSlide] = useState(null);

  const lastCursorEmitRef = useRef(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const currentUser = user || {
      id: `guest_${Math.random().toString(36).substr(2, 6)}`,
      name: `Guest ${Math.floor(Math.random() * 900 + 100)}`,
      avatarColor: '#8b5cf6',
    };

    if (socket.connected) {
      socket.emit('join-room', { roomId, user: currentUser, role });
      setConnectionStatus('connected');
    } else {
      socket.connect();
    }

    const onConnect = () => {
      setConnectionStatus('connected');
      socket.emit('join-room', { roomId, user: currentUser, role });
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

    const onRemoteElementUpdate = (element) => {
      if (onRemoteUpdate) onRemoteUpdate(element);
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

    // Reactions listener
    const onReactionReceive = (reaction) => {
      setIncomingReactions((prev) => [...prev.slice(-10), reaction]);
      setTimeout(() => {
        setIncomingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3000);
    };

    // Comments listener
    const onCommentSync = ({ comment }) => {
      setComments((prev) => {
        const idx = prev.findIndex((c) => c.id === comment.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = comment;
          return next;
        }
        return [...prev, comment];
      });
    };

    const onCommentResolved = ({ commentId }) => {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    };

    // Typing listener
    const onUserTyping = ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        if (!isTyping) {
          const next = { ...prev };
          delete next[user.id];
          return next;
        }
        return { ...prev, [user.id]: user.name };
      });
    };

    // Laser pointer listener
    const onRemoteLaser = (data) => {
      setRemoteLaserTrail((prev) => [...prev.slice(-30), data]);
      setTimeout(() => {
        setRemoteLaserTrail((prev) => prev.filter((p) => p.time !== data.time));
      }, 1200);
    };

    // Synchronized presentation slide listener
    const onRemoteSlide = (data) => {
      setRemotePresentationSlide(data);
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-participants', onRoomParticipants);
    socket.on('cursor-update', onCursorUpdate);
    socket.on('cursor-remove', onCursorRemove);
    socket.on('remote-element-add', onRemoteElementAdd);
    socket.on('remote-element-update', onRemoteElementUpdate);
    socket.on('remote-element-delete', onRemoteElementDelete);
    socket.on('remote-canvas-clear', onRemoteCanvasClear);
    socket.on('remote-canvas-sync', onRemoteCanvasSync);
    socket.on('remote-draw-live', onRemoteDrawLive);
    socket.on('reaction-receive', onReactionReceive);
    socket.on('comment-sync', onCommentSync);
    socket.on('comment-resolved', onCommentResolved);
    socket.on('user-typing', onUserTyping);
    socket.on('remote-laser-pointer', onRemoteLaser);
    socket.on('remote-presentation-slide', onRemoteSlide);

    // Prune stale cursors every 5s
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
      socket.off('remote-element-update', onRemoteElementUpdate);
      socket.off('remote-element-delete', onRemoteElementDelete);
      socket.off('remote-canvas-clear', onRemoteCanvasClear);
      socket.off('remote-canvas-sync', onRemoteCanvasSync);
      socket.off('remote-draw-live', onRemoteDrawLive);
      socket.off('reaction-receive', onReactionReceive);
      socket.off('comment-sync', onCommentSync);
      socket.off('comment-resolved', onCommentResolved);
      socket.off('user-typing', onUserTyping);

      socket.emit('leave-room');
    };
  }, [roomId, user, role]);

  // Throttled cursor broadcast
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

  const emitElementUpdate = useCallback(
    (element) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('element-update', { roomId, element });
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

  const emitReaction = useCallback(
    (emoji, x, y) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('reaction-trigger', { roomId, emoji, x, y });
      }
    },
    [roomId]
  );

  const emitCommentAdd = useCallback(
    (comment) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('comment-add', { roomId, comment });
      }
      setComments((prev) => {
        const idx = prev.findIndex((c) => c.id === comment.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = comment;
          return next;
        }
        return [...prev, comment];
      });
    },
    [roomId]
  );

  const emitCommentResolve = useCallback(
    (commentId) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('comment-resolve', { roomId, commentId });
      }
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    },
    [roomId]
  );

  const emitTyping = useCallback(
    (isTyping) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('typing-status', { roomId, isTyping });
      }
    },
    [roomId]
  );

  const emitLaserPointer = useCallback(
    (x, y) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('laser-pointer', { roomId, x, y });
      }
    },
    [roomId]
  );

  const emitPresentationSlide = useCallback(
    (frameIndex) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('presentation-slide', { roomId, frameIndex });
      }
    },
    [roomId]
  );

  const emitTaskCreate = useCallback(
    (task) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('task-create', { roomId, task });
      }
    },
    [roomId]
  );

  const emitTaskUpdate = useCallback(
    (task) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('task-update', { roomId, task });
      }
    },
    [roomId]
  );

  const emitTaskDelete = useCallback(
    (taskId) => {
      const socket = socketRef.current || getSocket();
      if (socket && socket.connected) {
        socket.emit('task-delete', { roomId, taskId });
      }
    },
    [roomId]
  );

  return {
    participants,
    cursors,
    remoteLiveStroke,
    remoteLaserTrail,
    remotePresentationSlide,
    connectionStatus,
    incomingReactions,
    comments,
    typingUsers,
    emitCursorMove,
    emitElementAdd,
    emitElementUpdate,
    emitElementDelete,
    emitCanvasClear,
    emitCanvasSync,
    emitReaction,
    emitCommentAdd,
    emitCommentResolve,
    emitTyping,
    emitLaserPointer,
    emitPresentationSlide,
    emitTaskCreate,
    emitTaskUpdate,
    emitTaskDelete,
  };
};
