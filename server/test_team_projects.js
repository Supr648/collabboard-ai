import http from 'http';

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method, headers },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
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
  console.log('🧪 Testing Team & Business Workspace, Decision Polls & Smart Meetings...');
  const testId = Date.now();

  // Register team lead
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'David Eng Lead',
    email: `david_${testId}@startup.io`,
    password: 'password123',
    primaryWorkspaceType: 'team',
  });

  const token = regRes.data.token;
  console.log('✅ Team Lead registered:', regRes.data.user.name);

  // 1. Fetch projects
  const projListRes = await request('/api/projects?workspaceId=ws_startup_core', 'GET', null, token);
  if (projListRes.status !== 200 || !projListRes.data.projects) {
    console.error('❌ Failed to fetch projects:', projListRes);
    process.exit(1);
  }
  const project = projListRes.data.projects[0];
  const projectId = project._id || project.id;
  console.log(`✅ Loaded project '${project.name}' with ${project.milestones.length} milestones and ${project.polls.length} polls`);

  // 2. Create a live decision poll
  const pollRes = await request(`/api/projects/${projectId}/polls`, 'POST', {
    question: 'Should we adopt WebAssembly (Wasm) for canvas rasterization?',
    options: ['Yes – Maximum 120 FPS performance', 'No – HTML5 Canvas 2D is currently sufficient', 'Investigate in Spike Sprint'],
    isAnonymous: false,
  }, token);

  if (pollRes.status !== 201 || !pollRes.data.poll) {
    console.error('❌ Failed to create poll:', pollRes);
    process.exit(1);
  }
  const pollId = pollRes.data.poll._id || pollRes.data.poll.id;
  console.log(`✅ Live decision poll created: '${pollRes.data.poll.question}'`);

  // 3. Cast a vote on option 0
  const voteRes = await request(`/api/projects/${projectId}/polls/${pollId}/vote`, 'POST', {
    optionIndex: 0,
  }, token);

  if (voteRes.status !== 200) {
    console.error('❌ Failed to cast vote:', voteRes);
    process.exit(1);
  }
  console.log('✅ Vote successfully recorded in real-time');

  // 4. Create a smart meeting
  const meetRes = await request(`/api/projects/${projectId}/meetings`, 'POST', {
    title: 'Sprint 12 Planning & Scope Review',
    scheduledAt: 'Tomorrow @ 14:00 UTC',
    agenda: ['Review customer feedback', 'Prioritize performance blockers'],
    decisions: ['Agreed to prioritize canvas rendering speed'],
    actionItems: [{ task: 'Benchmark 5,000 element stress test', assignedTo: 'David', completed: false }],
  }, token);

  if (meetRes.status !== 201) {
    console.error('❌ Failed to create meeting:', meetRes);
    process.exit(1);
  }
  console.log('✅ Smart meeting created with decisions and action items');

  // 5. Test AI Project Plan generation
  const aiPlanRes = await request('/api/projects/ai-plan', 'POST', {
    prompt: 'B2B Real-Time Document Collaboration Engine',
    workspaceId: 'ws_startup_core',
  }, token);

  if (aiPlanRes.status !== 201 || !aiPlanRes.data.project.milestones) {
    console.error('❌ Failed to generate AI Project Plan:', aiPlanRes);
    process.exit(1);
  }
  console.log(`✅ AI Project Plan synthesized: '${aiPlanRes.data.project.name}' with ${aiPlanRes.data.project.milestones.length} milestones`);

  // 6. Test AI Meeting Notes Extractor
  const aiSummaryRes = await request('/api/projects/ai-meeting-summary', 'POST', {
    title: 'Customer Advisory Board Review',
    notes: 'Customers loved the real-time cursors and requested faster PDF exports. Agreed to optimize jspdf bundle.',
  }, token);

  if (aiSummaryRes.status !== 200 || !aiSummaryRes.data.decisions) {
    console.error('❌ Failed to extract meeting decisions:', aiSummaryRes);
    process.exit(1);
  }
  console.log(`✅ AI Meeting Extractor extracted ${aiSummaryRes.data.decisions.length} decisions and ${aiSummaryRes.data.actionItems.length} action items`);

  console.log('\n🎉 ALL TEAM & BUSINESS WORKSPACE TESTS PASSED CLEANLY (100%)!\n');
};

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
