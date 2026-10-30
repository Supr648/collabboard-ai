import { io } from 'socket.io-client';

async function testRealtimeSockets() {
  console.log('⚡ Starting Real-Time Socket.IO Multi-Client Collaboration Test...\n');

  const SOCKET_URL = 'http://localhost:5000';
  const ROOM_ID = 'test_collab_room_99';

  return new Promise((resolve, reject) => {
    // 1. Connect Client A
    const clientA = io(SOCKET_URL, { transports: ['websocket'] });
    let clientB = null;

    clientA.on('connect', () => {
      console.log('🟢 Client A connected:', clientA.id);

      clientA.emit('join-room', {
        roomId: ROOM_ID,
        user: { id: 'user_a', name: 'Alice (Host)', avatarColor: '#6366f1' },
      });
    });

    clientA.on('room-joined', (data) => {
      console.log('✅ Client A successfully joined room:', ROOM_ID, 'Participants:', data.count);

      // 2. Connect Client B
      clientB = io(SOCKET_URL, { transports: ['websocket'] });

      clientB.on('connect', () => {
        console.log('🟢 Client B connected:', clientB.id);

        clientB.emit('join-room', {
          roomId: ROOM_ID,
          user: { id: 'user_b', name: 'Bob (Collaborator)', avatarColor: '#ec4899' },
        });
      });

      // Verify Client B receives participant list
      clientB.on('room-participants', (data) => {
        if (data.count === 2) {
          console.log(`👥 Multi-User Presence Verified: ${data.count} active participants in room`);

          // 3. Test Live Cursor Broadcasting (Client A -> Client B)
          console.log('🖱️ Testing cursor movement broadcast...');
          clientA.emit('cursor-move', {
            roomId: ROOM_ID,
            x: 245.5,
            y: 380.2,
            activeTool: 'pen',
          });
        }
      });

      // Client B listens for cursor update from Client A
      clientB.on('cursor-update', (cursorData) => {
        console.log(`✅ Client B received Client A cursor: (${cursorData.x}, ${cursorData.y}) [Tool: ${cursorData.activeTool}] from ${cursorData.user.name}`);

        // 4. Test Live Drawing Broadcast (Client B -> Client A)
        console.log('🎨 Testing drawing element broadcast (Client B -> Client A)...');
        clientB.emit('element-add', {
          roomId: ROOM_ID,
          element: {
            id: 'stroke_test_101',
            type: 'rectangle',
            x1: 100,
            y1: 100,
            x2: 300,
            y2: 200,
            strokeColor: '#10b981',
          },
        });
      });
    });

    // Client A listens for remote element added by Client B
    clientA.on('remote-element-add', (element) => {
      console.log('✅ Client A received real-time element from Client B:', element.type, element.id);

      // 5. Test Disconnect Handling
      console.log('🔌 Testing Client B disconnect and participant update...');
      clientB.disconnect();
    });

    // Client A receives notification that Client B left
    clientA.on('user-left', ({ user, count }) => {
      console.log(`👋 User left notification received: ${user.name}. Remaining in room: ${count}`);
      console.log('\n🎉 SOCKET.IO MULTI-USER REAL-TIME COLLABORATION FULLY VERIFIED!\n');

      clientA.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      if (clientA) clientA.disconnect();
      if (clientB) clientB.disconnect();
      reject(new Error('Socket test timed out'));
    }, 8000);
  });
}

testRealtimeSockets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Socket test error:', err);
    process.exit(1);
  });
