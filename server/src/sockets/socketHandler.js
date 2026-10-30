import { Whiteboard } from '../models/Whiteboard.js';
import { memoryStore } from '../config/memoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

// Active participants by room: roomId => Map(socketId => user)
const roomParticipants = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // console.log(`🔌 New client connected: ${socket.id}`);

    // Join room
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId) return;

      socket.join(roomId);

      const participant = {
        socketId: socket.id,
        id: user?.id || user?._id || `guest_${socket.id.substring(0, 6)}`,
        name: user?.name || `Guest ${socket.id.substring(0, 4)}`,
        avatarColor: user?.avatarColor || '#6366f1',
        joinedAt: new Date().toISOString(),
      };

      socket.data.roomId = roomId;
      socket.data.participant = participant;

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }

      const currentRoom = roomParticipants.get(roomId);
      currentRoom.set(socket.id, participant);

      const participantsList = Array.from(currentRoom.values());

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        user: participant,
        participants: participantsList,
        count: participantsList.length,
      });

      // Send to current user
      socket.emit('room-joined', {
        self: participant,
        participants: participantsList,
        count: participantsList.length,
      });

      // Broadcast updated participants list to everyone in room
      io.in(roomId).emit('room-participants', {
        participants: participantsList,
        count: participantsList.length,
      });
    });

    // Real-time cursor coordinates
    socket.on('cursor-move', ({ roomId, x, y, activeTool }) => {
      if (!roomId || !socket.data.participant) return;
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        user: socket.data.participant,
        x,
        y,
        activeTool,
      });
    });

    // Drawing in progress (intermediate live stroke)
    socket.on('draw-stroke-live', ({ roomId, stroke }) => {
      if (!roomId) return;
      socket.to(roomId).emit('remote-draw-live', stroke);
    });

    // Finalized element created
    socket.on('element-add', async ({ roomId, element }) => {
      if (!roomId || !element) return;
      socket.to(roomId).emit('remote-element-add', element);
    });

    // Element modified (moved, edited)
    socket.on('element-update', ({ roomId, element }) => {
      if (!roomId || !element) return;
      socket.to(roomId).emit('remote-element-update', element);
    });

    // Element deleted
    socket.on('element-delete', ({ roomId, elementId }) => {
      if (!roomId || !elementId) return;
      socket.to(roomId).emit('remote-element-delete', { elementId });
    });

    // Canvas clear
    socket.on('canvas-clear', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('remote-canvas-clear', {
        by: socket.data.participant?.name || 'Someone',
      });
    });

    // Undo / Redo / Full sync state
    socket.on('canvas-sync', ({ roomId, elements, action }) => {
      if (!roomId || !Array.isArray(elements)) return;
      socket.to(roomId).emit('remote-canvas-sync', {
        elements,
        action,
        by: socket.data.participant?.name,
      });
    });

    // Explicit leave room
    socket.on('leave-room', () => {
      handleDisconnectOrLeave(socket, io);
    });

    // Disconnection
    socket.on('disconnect', () => {
      handleDisconnectOrLeave(socket, io);
    });
  });
};

const handleDisconnectOrLeave = (socket, io) => {
  const roomId = socket.data?.roomId;
  const participant = socket.data?.participant;

  if (roomId && roomParticipants.has(roomId)) {
    const currentRoom = roomParticipants.get(roomId);
    currentRoom.delete(socket.id);

    // Remove cursor representation
    socket.to(roomId).emit('cursor-remove', { socketId: socket.id });

    const participantsList = Array.from(currentRoom.values());

    if (participant) {
      socket.to(roomId).emit('user-left', {
        user: participant,
        participants: participantsList,
        count: participantsList.length,
      });
    }

    io.in(roomId).emit('room-participants', {
      participants: participantsList,
      count: participantsList.length,
    });

    if (currentRoom.size === 0) {
      roomParticipants.delete(roomId);
    }
  }

  socket.leave(roomId);
};
