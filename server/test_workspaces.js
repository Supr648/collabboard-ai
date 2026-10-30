import http from 'http';

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const run = async () => {
  console.log('🧪 Testing Multi-Purpose Workspaces Architecture...');
  const testId = Date.now();

  // 1. Register student user
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Emma Student',
    email: `emma_${testId}@study.edu`,
    password: 'password123',
    primaryWorkspaceType: 'student',
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Failed registration:', regRes);
    process.exit(1);
  }
  const token = regRes.data.token;
  console.log('✅ Student registered with primaryWorkspaceType:', regRes.data.user.primaryWorkspaceType);

  // 2. Fetch workspaces
  const wsListRes = await request('/api/workspaces', 'GET', null, token);
  if (wsListRes.status !== 200 || !wsListRes.data.workspaces || wsListRes.data.workspaces.length === 0) {
    console.error('❌ Failed to fetch auto-provisioned workspace:', wsListRes);
    process.exit(1);
  }
  const defaultWs = wsListRes.data.workspaces[0];
  console.log(`✅ Auto-provisioned workspace: '${defaultWs.name}' (type: ${defaultWs.type})`);

  // 3. Create a secondary workspace (e.g. personal)
  const createWsRes = await request('/api/workspaces', 'POST', {
    name: 'Emma Personal Goals',
    type: 'personal',
    description: 'Personal productivity, daily planning, and habits',
  }, token);

  if (createWsRes.status !== 201) {
    console.error('❌ Failed to create second workspace:', createWsRes);
    process.exit(1);
  }
  const personalWs = createWsRes.data.workspace;
  console.log(`✅ Secondary workspace created: '${personalWs.name}' (type: ${personalWs.type})`);

  // 4. Verify user has both workspaces
  const updatedList = await request('/api/workspaces', 'GET', null, token);
  if (updatedList.data.count < 2) {
    console.error('❌ User should have at least 2 workspaces:', updatedList);
    process.exit(1);
  }
  console.log(`✅ User now has ${updatedList.data.count} workspaces:`, updatedList.data.workspaces.map(w => `${w.name} (${w.type})`));

  // 5. Update workspace settings
  const updateRes = await request(`/api/workspaces/${personalWs._id || personalWs.id}`, 'PUT', {
    name: 'Emma Life & Productivity',
    settings: { colorTheme: '#ec4899', allowPublicSharing: false },
  }, token);

  if (updateRes.status !== 200) {
    console.error('❌ Failed to update workspace:', updateRes);
    process.exit(1);
  }
  console.log('✅ Workspace updated successfully with custom theme:', updateRes.data.workspace.settings.colorTheme);

  // 6. Test authorization isolation: Register second user Bob
  const bobRes = await request('/api/auth/register', 'POST', {
    name: 'Bob Teacher',
    email: `bob_${testId}@school.org`,
    password: 'password123',
    primaryWorkspaceType: 'teacher',
  });
  const bobToken = bobRes.data.token;

  // Bob attempts to view Emma's private workspace
  const forbiddenRes = await request(`/api/workspaces/${personalWs._id || personalWs.id}`, 'GET', null, bobToken);
  if (forbiddenRes.status !== 403) {
    console.error('❌ Security vulnerability! Unauthorized user was not denied (status:', forbiddenRes.status, ')');
    process.exit(1);
  }
  console.log('✅ Security Verified: Unauthorized user rejected with HTTP 403 Forbidden.');

  console.log('\n🎉 ALL WORKSPACE ARCHITECTURE TESTS PASSED CLEANLY (100%)!\n');
};

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
