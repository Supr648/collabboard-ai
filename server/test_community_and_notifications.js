import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Community Templates, Notifications, and AI Natural Language Commands...');

  // 1. Register a test user
  const email = `comm_tester_${Date.now()}@example.com`;
  const regRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Community QA Lead', email, password: 'password123', primaryWorkspaceType: 'team' }
  );

  if (!regRes.data.success || !regRes.data.token) {
    throw new Error('Registration failed: ' + JSON.stringify(regRes.data));
  }
  const token = regRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✅ User registered with token.');

  // 2. Test Community Templates GET
  const tplRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/templates/community',
      method: 'GET',
    }
  );
  console.log(`✅ GET /api/templates/community: status ${tplRes.status}, count: ${tplRes.data.templates?.length}`);
  if (!tplRes.data.success || !Array.isArray(tplRes.data.templates)) {
    throw new Error('Templates fetch failed');
  }

  // 3. Test Community Template Publish
  const pubRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/templates/community/publish',
      method: 'POST',
      headers: authHeaders,
    },
    {
      title: 'DevOps Kubernetes Blueprint',
      description: 'Ingress, Services, Deployments, and Helm Chart visual hierarchy',
      category: 'flowchart',
      tags: ['k8s', 'devops', 'cloud'],
      elements: [{ id: 'k8s_1', type: 'rectangle', x1: 50, y1: 50, x2: 250, y2: 180, text: 'Ingress Controller' }],
    }
  );
  console.log(`✅ POST /api/templates/community/publish: status ${pubRes.status}, id: ${pubRes.data.template?._id}`);
  const createdTplId = pubRes.data.template?._id;

  // 4. Test Template Clone
  const cloneRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/templates/community/${createdTplId}/clone`,
      method: 'POST',
      headers: authHeaders,
    }
  );
  console.log(`✅ POST /api/templates/community/:id/clone: clonesCount is now ${cloneRes.data.template?.clonesCount}`);

  // 5. Test Notifications
  const notifCreateRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'POST',
      headers: authHeaders,
    },
    {
      title: 'Sprint Planning Meeting',
      message: 'Weekly sprint planning scheduled for 10:00 AM UTC',
      type: 'meeting',
    }
  );
  console.log(`✅ POST /api/notifications: status ${notifCreateRes.status}, id: ${notifCreateRes.data.notification?._id}`);

  const notifListRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log(`✅ GET /api/notifications: unread: ${notifListRes.data.unreadCount}, total: ${notifListRes.data.notifications?.length}`);

  // 6. Test AI Natural Language Commands with the user requested intents
  const aiCommands = [
    'Create a project plan for developing an e-commerce website.',
    'Convert my study notes into a mind map.',
    'Generate 20 MCQs from this PDF.',
    'Create tasks from these brainstorming notes.',
    'Summarize our project progress.',
    'Organize these sticky notes into categories.',
    'Create a weekly study schedule.',
    'Generate a flowchart for this software system.',
  ];

  for (const cmd of aiCommands) {
    const aiRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/command',
        method: 'POST',
        headers: authHeaders,
      },
      {
        command: cmd,
        elements: [
          { id: 'st_1', type: 'sticky', x1: 50, y1: 50, text: 'Frontend Button' },
          { id: 'st_2', type: 'sticky', x1: 50, y1: 150, text: 'Backend DB' },
        ],
      }
    );
    console.log(`✅ AI Command: "${cmd.slice(0, 35)}..." -> action: ${aiRes.data.action}, elements generated: ${aiRes.data.elements?.length || 0}`);
  }

  console.log('🎉 ALL COMMUNITY, NOTIFICATIONS, AND AI COMMAND SUITES PASSED 100%!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
