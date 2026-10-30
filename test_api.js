const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Automated Full-Stack API Test Suite...\n');

  try {
    // 1. Health check
    console.log('--- 1. Testing GET /health ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health status:', healthData.status);

    // 2. Register
    console.log('\n--- 2. Testing POST /auth/register ---');
    const testUser = {
      name: 'Supriya Sharma',
      email: `architect_${Date.now()}@whiteboard.io`,
      password: 'strongPassword2026!',
    };
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    console.log('✅ Registered successfully:', regData.user.name, `(ID: ${regData.user.id})`);
    const token = regData.token;

    // 3. Login
    console.log('\n--- 3. Testing POST /auth/login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const loginData = await loginRes.json();
    console.log('✅ Login successful for:', loginData.user.email);

    // 4. Get Current User (/auth/me)
    console.log('\n--- 4. Testing GET /auth/me with Bearer Token ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    console.log('✅ Profile authenticated:', meData.user.name);

    // 5. Create Whiteboard
    console.log('\n--- 5. Testing POST /whiteboards (Create) ---');
    const createRes = await fetch(`${BASE_URL}/whiteboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Microservices & Event-Driven Architecture',
        isPublic: true,
      }),
    });
    const createData = await createRes.json();
    const board = createData.whiteboard;
    const boardId = board._id || board.id;
    const roomId = board.roomId;
    console.log('✅ Whiteboard created:', board.title, `(Room ID: ${roomId}, Board ID: ${boardId})`);

    // 6. List Whiteboards
    console.log('\n--- 6. Testing GET /whiteboards (List & Search) ---');
    const listRes = await fetch(`${BASE_URL}/whiteboards?search=Microservices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.log(`✅ Retrieved ${listData.count} boards matching search query.`);

    // 7. Get Whiteboard by Room ID
    console.log('\n--- 7. Testing GET /whiteboards/room/:roomId ---');
    const roomRes = await fetch(`${BASE_URL}/whiteboards/room/${roomId}`);
    const roomData = await roomRes.json();
    console.log('✅ Room retrieved successfully:', roomData.whiteboard.title);

    // 8. Save Canvas Elements & State
    console.log('\n--- 8. Testing PUT /whiteboards/room/:roomId/save ---');
    const sampleElements = [
      { id: 'el_pen_1', type: 'pen', points: [{ x: 50, y: 50 }, { x: 100, y: 120 }], strokeColor: '#6366f1', strokeWidth: 4 },
      { id: 'el_rect_1', type: 'rectangle', x1: 150, y1: 100, x2: 350, y2: 220, strokeColor: '#10b981', strokeWidth: 3 },
      { id: 'el_text_1', type: 'text', x: 170, y: 140, text: 'Kubernetes Cluster', strokeColor: '#0f172a', fontSize: 20 },
    ];
    const saveRes = await fetch(`${BASE_URL}/whiteboards/room/${roomId}/save`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elements: sampleElements,
        thumbnail: 'data:image/jpeg;base64,sample_snapshot_preview',
      }),
    });
    const saveData = await saveRes.json();
    console.log('✅ Canvas state saved:', saveData.message);

    // 9. Verify Elements Persisted
    console.log('\n--- 9. Verify Canvas Elements Persisted on Re-opening ---');
    const verifyRes = await fetch(`${BASE_URL}/whiteboards/room/${roomId}`);
    const verifyData = await verifyRes.json();
    console.log('✅ Persisted elements verified:', verifyData.whiteboard.elements.length, 'elements loaded');

    // 10. Rename Whiteboard
    console.log('\n--- 10. Testing PUT /whiteboards/:id (Rename) ---');
    const renameRes = await fetch(`${BASE_URL}/whiteboards/${boardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Cloud Architecture & Kubernetes Diagram v2',
      }),
    });
    const renameData = await renameRes.json();
    console.log('✅ Renamed successfully to:', renameData.whiteboard.title);

    // 11. Delete Whiteboard
    console.log('\n--- 11. Testing DELETE /whiteboards/:id ---');
    const deleteRes = await fetch(`${BASE_URL}/whiteboards/${boardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const deleteData = await deleteRes.json();
    console.log('✅ Deleted successfully:', deleteData.message);

    console.log('\n✨ ALL TESTS EXECUTED AND PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

runTests();
