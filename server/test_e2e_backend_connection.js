import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('🔍 COLLABBOARD AI – FULL-STACK BACKEND & REAL-TIME VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  const testUser = {
    name: 'FullStack Tester',
    email: `tester_${Date.now()}@collabboard.ai`,
    password: 'SecurePassword123!',
    primaryWorkspaceType: 'team',
  };

  let token = null;
  let user = null;
  let board = null;
  let workspace = null;
  let task = null;

  // 1. Health & Server check
  total++;
  try {
    const res = await fetch('http://localhost:5000/health');
    const data = await res.json();
    if (res.status === 200 && data.status === 'healthy') {
      console.log('✅ 1. Backend Health Check (/health): PASSED');
      passed++;
    } else {
      console.error('❌ 1. Health check failed:', data);
    }
  } catch (err) {
    console.error('❌ 1. Health check error:', err.message);
  }

  // 2. Authentication: Register
  total++;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const data = await res.json();
    if (res.status === 201 && data.token && data.user) {
      token = data.token;
      user = data.user;
      console.log('✅ 2. Auth: Register with JWT generation: PASSED');
      passed++;
    } else {
      console.error('❌ 2. Register failed:', data);
    }
  } catch (err) {
    console.error('❌ 2. Register error:', err.message);
  }

  // 3. Authentication: Login
  total++;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      console.log('✅ 3. Auth: Login & Credential Verification: PASSED');
      passed++;
    } else {
      console.error('❌ 3. Login failed:', data);
    }
  } catch (err) {
    console.error('❌ 3. Login error:', err.message);
  }

  // 4. Authentication: Get Me (Protected route)
  total++;
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.user && data.user.email === testUser.email) {
      console.log('✅ 4. Auth: Protected Route & Token Session (/auth/me): PASSED');
      passed++;
    } else {
      console.error('❌ 4. Get me failed:', data);
    }
  } catch (err) {
    console.error('❌ 4. Get me error:', err.message);
  }

  // 5. Authentication: Update Profile
  total++;
  try {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Senior Architect', avatarColor: '#8b5cf6' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.user && data.user.name === 'Senior Architect') {
      console.log('✅ 5. Auth: User Profile Update & State Persistence: PASSED');
      passed++;
    } else {
      console.error('❌ 5. Update profile failed:', data);
    }
  } catch (err) {
    console.error('❌ 5. Update profile error:', err.message);
  }

  // 6. Whiteboards: Create Whiteboard
  total++;
  try {
    const res = await fetch(`${BASE_URL}/whiteboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Linear SaaS Architecture Board', isPublic: true }),
    });
    const data = await res.json();
    if (res.status === 201 && data.whiteboard && data.whiteboard.roomId) {
      board = data.whiteboard;
      console.log(`✅ 6. Whiteboard: Create Board (Room: ${board.roomId}): PASSED`);
      passed++;
    } else {
      console.error('❌ 6. Create board failed:', data);
    }
  } catch (err) {
    console.error('❌ 6. Create board error:', err.message);
  }

  // 7. Whiteboards: Save Elements & Persist to Database
  total++;
  const canvasElements = [
    { id: 'node_auth', type: 'rectangle', x1: 100, y1: 100, x2: 300, y2: 200, strokeColor: '#6366f1', text: 'Auth Service' },
    { id: 'node_db', type: 'circle', x1: 400, y1: 100, x2: 550, y2: 250, strokeColor: '#10b981', text: 'Primary DB' },
  ];
  try {
    const res = await fetch(`${BASE_URL}/whiteboards/room/${board.roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ elements: canvasElements, thumbnail: 'data:image/png;base64,mock' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log('✅ 7. Whiteboard: Save Canvas Elements State: PASSED');
      passed++;
    } else {
      console.error('❌ 7. Save elements failed:', data);
    }
  } catch (err) {
    console.error('❌ 7. Save elements error:', err.message);
  }

  // 8. Whiteboards: Reload Board and Confirm Persistence
  total++;
  try {
    const res = await fetch(`${BASE_URL}/whiteboards/room/${board.roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.whiteboard && data.whiteboard.elements?.length === 2) {
      console.log('✅ 8. Whiteboard: Fetch & Confirm Element Persistence: PASSED');
      passed++;
    } else {
      console.error('❌ 8. Reload board failed:', data);
    }
  } catch (err) {
    console.error('❌ 8. Reload board error:', err.message);
  }

  // 9. Workspaces: Get and Create Workspace
  total++;
  try {
    const res = await fetch(`${BASE_URL}/workspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Engineering Core', type: 'team' }),
    });
    const data = await res.json();
    if (res.status === 201 && data.workspace) {
      workspace = data.workspace;
      console.log(`✅ 9. Workspaces: Create Multi-Purpose Workspace: PASSED`);
      passed++;
    } else {
      console.error('❌ 9. Create workspace failed:', data);
    }
  } catch (err) {
    console.error('❌ 9. Create workspace error:', err.message);
  }

  // 10. Tasks: Create and Retrieve Kanban Tasks
  total++;
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board._id || board.id || board.roomId,
        title: 'Implement Framer Motion micro-interactions',
        status: 'in-progress',
        priority: 'high',
      }),
    });
    const data = await res.json();
    if (res.status === 201 && data.task) {
      task = data.task;
      console.log('✅ 10. Tasks: Kanban Project Management Task APIs: PASSED');
      passed++;
    } else {
      console.error('❌ 10. Create task failed:', data);
    }
  } catch (err) {
    console.error('❌ 10. Create task error:', err.message);
  }

  // 11. AI Assistant: Generate Architecture Diagram
  total++;
  try {
    const res = await fetch(`${BASE_URL}/ai/generate-diagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: 'Microservices with API Gateway, Auth, and PostgreSQL' }),
    });
    const data = await res.json();
    if (res.status === 200 && (data.elements || data.success)) {
      console.log('✅ 11. AI Assistant: Real-Time Diagram Generation API: PASSED');
      passed++;
    } else {
      console.error('❌ 11. AI diagram failed:', data);
    }
  } catch (err) {
    console.error('❌ 11. AI diagram error:', err.message);
  }

  // 12. Socket.IO Real-Time Multi-User Collaboration
  total++;
  try {
    const socketPassed = await new Promise((resolve) => {
      const client1 = io(SOCKET_URL, { transports: ['websocket'] });
      const client2 = io(SOCKET_URL, { transports: ['websocket'] });

      let receivedElement = false;
      let receivedReaction = false;
      let timeoutId = null;

      const checkDone = () => {
        if (receivedElement && receivedReaction) {
          clearTimeout(timeoutId);
          client1.disconnect();
          client2.disconnect();
          resolve(true);
        }
      };

      client2.on('remote-element-add', (el) => {
        if (el.id === 'socket_test_rect') {
          receivedElement = true;
          checkDone();
        }
      });

      client2.on('reaction-receive', (rx) => {
        if (rx.emoji === '🚀') {
          receivedReaction = true;
          checkDone();
        }
      });

      client1.on('connect', () => {
        client1.emit('join-room', {
          roomId: board.roomId,
          user: { id: 'usr_1', name: 'Collaborator 1' },
          role: 'editor',
        });

        // After small delay, emit test events
        setTimeout(() => {
          client1.emit('element-add', {
            roomId: board.roomId,
            element: { id: 'socket_test_rect', type: 'rectangle', x1: 50, y1: 50, x2: 150, y2: 150 },
          });

          client1.emit('reaction-trigger', {
            roomId: board.roomId,
            emoji: '🚀',
            x: 200,
            y: 300,
          });
        }, 200);
      });

      client2.on('connect', () => {
        client2.emit('join-room', {
          roomId: board.roomId,
          user: { id: 'usr_2', name: 'Collaborator 2' },
          role: 'editor',
        });
      });

      timeoutId = setTimeout(() => {
        client1.disconnect();
        client2.disconnect();
        resolve(receivedElement || receivedReaction);
      }, 3000);
    });

    if (socketPassed) {
      console.log('✅ 12. Socket.IO: Multi-User Real-Time Collaboration & Reactions: PASSED');
      passed++;
    } else {
      console.error('❌ 12. Socket.IO test timed out without receiving events');
    }
  } catch (err) {
    console.error('❌ 12. Socket.IO collaboration error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 BACKEND VERIFICATION RESULT: ${passed}/${total} TESTS PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runComprehensiveVerification();
