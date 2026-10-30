import http from 'http';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000';

function post(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function put(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function del(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 COLLABBOARD AI COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Health & Server Info
  try {
    const health = await get('/');
    assert(health.status === 200 && health.body?.success, 'Backend Health Check');
  } catch (err) {
    assert(false, `Backend Health Check failed: ${err.message}`);
  }

  // 2. Auth Flow
  const testEmail = `tester_${Date.now()}@example.com`;
  let token = null;

  try {
    const regRes = await post('/api/auth/register', {
      name: 'Senior Architect',
      email: testEmail,
      password: 'Password123!'
    });
    assert(regRes.status === 201 && regRes.body?.token, 'Auth: User Registration');
    token = regRes.body?.token;
  } catch (err) {
    assert(false, `Auth Registration failed: ${err.message}`);
  }

  try {
    const loginRes = await post('/api/auth/login', {
      email: testEmail,
      password: 'Password123!'
    });
    assert(loginRes.status === 200 && loginRes.body?.token, 'Auth: User Login');
    if (!token) token = loginRes.body?.token;
  } catch (err) {
    assert(false, `Auth Login failed: ${err.message}`);
  }

  // 3. Board CRUD Flow
  let boardId = null;
  let roomId = null;
  try {
    const createBoardRes = await post('/api/whiteboards', {
      title: 'Cloud Architecture AI Board',
      elements: [
        { id: 'el-1', type: 'rectangle', x: 100, y: 100, width: 140, height: 70, strokeColor: '#3b82f6' }
      ]
    }, token);
    const board = createBoardRes.body?.whiteboard || createBoardRes.body?.data;
    boardId = board?._id;
    roomId = board?.roomId;
    assert(createBoardRes.status === 201 && boardId && roomId, 'Board: Create New Board');
  } catch (err) {
    assert(false, `Board Creation failed: ${err.message}`);
  }

  try {
    const getBoardRes = await get(`/api/whiteboards/${boardId}`, token);
    const fetched = getBoardRes.body?.whiteboard || getBoardRes.body?.data;
    assert(getBoardRes.status === 200 && fetched?.title === 'Cloud Architecture AI Board', 'Board: Fetch Board By ID');
  } catch (err) {
    assert(false, `Board Retrieval failed: ${err.message}`);
  }

  try {
    const dupRes = await post(`/api/whiteboards/${boardId}/duplicate`, {}, token);
    const dup = dupRes.body?.whiteboard || dupRes.body?.data;
    assert(dupRes.status === 201 && dup?.title?.includes('Copy'), 'Board: Duplicate Board');
  } catch (err) {
    assert(false, `Board Duplication failed: ${err.message}`);
  }

  // 4. AI Endpoints Flow
  try {
    const diagramRes = await post('/api/ai/diagram', {
      prompt: 'Microservices Kubernetes Architecture',
      boardId: boardId
    }, token);
    const elements = diagramRes.body?.elements || diagramRes.body?.data?.elements;
    assert(diagramRes.status === 200 && Array.isArray(elements) && elements.length > 0, 'AI: Diagram Generator (/api/ai/diagram)');
  } catch (err) {
    assert(false, `AI Diagram failed: ${err.message}`);
  }

  try {
    const flowchartRes = await post('/api/ai/flowchart', {
      prompt: 'User Registration and Email Verification Flow',
      boardId: boardId
    }, token);
    const elements = flowchartRes.body?.elements || flowchartRes.body?.data?.elements;
    assert(flowchartRes.status === 200 && Array.isArray(elements) && elements.length > 0, 'AI: Flowchart Generator (/api/ai/flowchart)');
  } catch (err) {
    assert(false, `AI Flowchart failed: ${err.message}`);
  }

  try {
    const brainstormRes = await post('/api/ai/brainstorm', {
      topic: 'Next-Gen Collaborative Canvas Features',
      boardId: boardId
    }, token);
    const elements = brainstormRes.body?.elements || brainstormRes.body?.data?.elements;
    assert(brainstormRes.status === 200 && Array.isArray(elements) && elements.length > 0, 'AI: Brainstorm Assistant (/api/ai/brainstorm)');
  } catch (err) {
    assert(false, `AI Brainstorm failed: ${err.message}`);
  }

  try {
    const summarizeRes = await post('/api/ai/summarize', {
      elements: [
        { type: 'sticky', text: 'Implement WebRTC audio rooms' },
        { type: 'sticky', text: 'Add AI diagram autolayout' },
        { type: 'text', text: 'Release v2.0 by Q4' }
      ]
    }, token);
    const summary = summarizeRes.body?.summary || summarizeRes.body?.data?.summary;
    assert(summarizeRes.status === 200 && summary, 'AI: Board Summarizer (/api/ai/summarize)');
  } catch (err) {
    assert(false, `AI Summarize failed: ${err.message}`);
  }

  try {
    const explainRes = await post('/api/ai/explain', {
      elements: [
        { type: 'rectangle', text: 'API Gateway' },
        { type: 'arrow', text: 'routes to' },
        { type: 'circle', text: 'Auth Service' }
      ]
    }, token);
    const explanation = explainRes.body?.explanation || explainRes.body?.data?.explanation;
    assert(explainRes.status === 200 && explanation, 'AI: Diagram Explainer (/api/ai/explain)');
  } catch (err) {
    assert(false, `AI Explain failed: ${err.message}`);
  }

  // 5. Extended AI Copilot Endpoints
  try {
    const mindmapRes = await post('/api/ai/mindmap', { topic: 'Microservices Architecture' }, token);
    const elements = mindmapRes.body?.elements || mindmapRes.body?.data?.elements;
    assert(mindmapRes.status === 200 && Array.isArray(elements) && elements.length > 0, 'AI Copilot: Radial Mind Map Generator (/api/ai/mindmap)');
  } catch (err) {
    assert(false, `AI Mindmap failed: ${err.message}`);
  }

  try {
    const cmdRes = await post('/api/ai/command', {
      command: 'make all sticky notes emerald green and align them',
      elements: [
        { id: 's1', type: 'sticky', text: 'Step 1' },
        { id: 's2', type: 'sticky', text: 'Step 2' }
      ]
    }, token);
    assert(cmdRes.status === 200 && (cmdRes.body?.elements || cmdRes.body?.data?.elements), 'AI Copilot: Natural Language Canvas Command (/api/ai/command)');
  } catch (err) {
    assert(false, `AI Command failed: ${err.message}`);
  }

  try {
    const docRes = await post('/api/ai/document-intelligence', {
      content: 'Antigravity IDE v2.0 was announced with high performance collaborative coding, integrated real-time whiteboards, automated AI debugging, and enterprise compliance.',
      title: 'Release Notes'
    }, token);
    const intelligence = docRes.body?.intelligence || docRes.body?.data?.intelligence;
    assert(docRes.status === 200 && intelligence?.summary && Array.isArray(intelligence?.keyPoints), 'AI Document Intelligence: Extraction & Synthesis (/api/ai/document-intelligence)');
  } catch (err) {
    assert(false, `AI Document Intelligence failed: ${err.message}`);
  }

  try {
    const critiqueRes = await post('/api/ai/critique', {
      elements: [
        { id: 'c1', type: 'rectangle', text: 'Frontend Client' },
        { id: 'c2', type: 'rectangle', text: 'Backend API' }
      ]
    }, token);
    const critique = critiqueRes.body?.critique || critiqueRes.body?.data?.critique;
    assert(critiqueRes.status === 200 && critique && Array.isArray(critique.suggestions), 'AI Layout Doctor: Board Critique & Optimization (/api/ai/critique)');
  } catch (err) {
    assert(false, `AI Critique failed: ${err.message}`);
  }

  // 6. Project Management: Kanban Tasks Endpoints
  let testTaskId = null;
  try {
    const createTaskRes = await post('/api/tasks', {
      boardId: boardId || roomId,
      title: 'Architect CRDT synchronization',
      description: 'Implement vector clock conflict resolution for canvas objects',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
    }, token);
    const createdTask = createTaskRes.body?.task || createTaskRes.body?.data?.task;
    testTaskId = createdTask?._id || createdTask?.id;
    assert(createTaskRes.status === 201 && testTaskId, 'Tasks: Create Kanban Task (POST /api/tasks)');
  } catch (err) {
    assert(false, `Tasks Create failed: ${err.message}`);
  }

  try {
    const getTasksRes = await get(`/api/tasks?boardId=${boardId || roomId}`, token);
    const tasks = getTasksRes.body?.tasks || getTasksRes.body?.data?.tasks;
    assert(getTasksRes.status === 200 && Array.isArray(tasks) && tasks.some(t => (t._id || t.id) === testTaskId), 'Tasks: List Board Tasks (GET /api/tasks)');
  } catch (err) {
    assert(false, `Tasks List failed: ${err.message}`);
  }

  try {
    const updateTaskRes = await put(`/api/tasks/${testTaskId}`, {
      status: 'done',
      priority: 'high'
    }, token);
    const updated = updateTaskRes.body?.task || updateTaskRes.body?.data?.task;
    assert(updateTaskRes.status === 200 && updated?.status === 'done', 'Tasks: Update Task Status (PUT /api/tasks/:id)');
  } catch (err) {
    assert(false, `Tasks Update failed: ${err.message}`);
  }

  try {
    const deleteTaskRes = await del(`/api/tasks/${testTaskId}`, token);
    assert(deleteTaskRes.status === 200 && deleteTaskRes.body?.success, 'Tasks: Delete Task (DELETE /api/tasks/:id)');
  } catch (err) {
    assert(false, `Tasks Delete failed: ${err.message}`);
  }

  // 7. Socket.IO Real-time Collaboration Flow
  try {
    await new Promise((resolve) => {
      const targetRoom = roomId || boardId;
      const client1 = io(BASE_URL, { transports: ['websocket'] });
      const client2 = io(BASE_URL, { transports: ['websocket'] });

      let client2ReceivedReaction = false;
      let client2ReceivedDraw = false;
      let client2ReceivedComment = false;
      let client2ReceivedLaser = false;
      let client2ReceivedSlide = false;

      client1.on('connect', () => {
        client1.emit('join-room', {
          roomId: targetRoom,
          user: { id: 'user-1', name: 'Alice', avatarColor: '#ec4899' },
          role: 'editor'
        });
      });

      client2.on('connect', () => {
        client2.emit('join-room', {
          roomId: targetRoom,
          user: { id: 'user-2', name: 'Bob', avatarColor: '#10b981' },
          role: 'editor'
        });
      });

      client2.on('reaction-receive', (data) => {
        if (data.emoji === '🚀') client2ReceivedReaction = true;
        checkDone();
      });

      client2.on('remote-element-add', (element) => {
        if (element?.id === 'socket-test-rect') client2ReceivedDraw = true;
        checkDone();
      });

      client2.on('comment-sync', (data) => {
        if (data.comment?.text === 'Nice architecture diagram!') client2ReceivedComment = true;
        checkDone();
      });

      client2.on('remote-laser-pointer', (data) => {
        if (data.x === 250 && data.y === 300) client2ReceivedLaser = true;
        checkDone();
      });

      client2.on('remote-presentation-slide', (data) => {
        if (data.frameIndex === 2) client2ReceivedSlide = true;
        checkDone();
      });

      // Wait a moment for joins, then emit from client1
      setTimeout(() => {
        client1.emit('reaction-trigger', {
          roomId: targetRoom,
          emoji: '🚀',
          x: 200,
          y: 200
        });

        client1.emit('element-add', {
          roomId: targetRoom,
          element: { id: 'socket-test-rect', type: 'rectangle', x1: 50, y1: 50, x2: 150, y2: 110 }
        });

        client1.emit('comment-add', {
          roomId: targetRoom,
          comment: { id: 'c-1', text: 'Nice architecture diagram!', x: 120, y: 150, userName: 'Alice' }
        });

        client1.emit('laser-pointer', {
          roomId: targetRoom,
          x: 250,
          y: 300
        });

        client1.emit('presentation-slide', {
          roomId: targetRoom,
          frameIndex: 2
        });
      }, 500);

      let timer = setTimeout(() => {
        client1.disconnect();
        client2.disconnect();
        assert(client2ReceivedReaction, 'Socket.IO: Live Reaction Broadcasting');
        assert(client2ReceivedDraw, 'Socket.IO: Live Drawing Synchronization');
        assert(client2ReceivedComment, 'Socket.IO: Live Comments Synchronization');
        assert(client2ReceivedLaser, 'Socket.IO: Live Laser Pointer Broadcast');
        assert(client2ReceivedSlide, 'Socket.IO: Synchronized Presentation Slide Control');
        resolve();
      }, 2000);

      function checkDone() {
        if (
          client2ReceivedReaction &&
          client2ReceivedDraw &&
          client2ReceivedComment &&
          client2ReceivedLaser &&
          client2ReceivedSlide
        ) {
          clearTimeout(timer);
          client1.disconnect();
          client2.disconnect();
          assert(true, 'Socket.IO: Live Reaction Broadcasting');
          assert(true, 'Socket.IO: Live Drawing Synchronization');
          assert(true, 'Socket.IO: Live Comments Synchronization');
          assert(true, 'Socket.IO: Live Laser Pointer Broadcast');
          assert(true, 'Socket.IO: Synchronized Presentation Slide Control');
          resolve();
        }
      }
    });
  } catch (err) {
    assert(false, `Socket.IO tests failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    console.log('🎉 ALL SYSTEM TESTS PASSED CLEANLY! CollabBoard AI is production-ready.');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Please inspect logs above.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
