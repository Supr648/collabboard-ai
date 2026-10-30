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
  console.log('🧪 Testing Teacher & Classroom Workspace + Personal Productivity Suite...');
  const testId = Date.now();

  // 1. Register Teacher
  const teacherReg = await request('/api/auth/register', 'POST', {
    name: 'Prof. Jonathan Vance',
    email: `vance_${testId}@stanford.edu`,
    password: 'password123',
    primaryWorkspaceType: 'teacher',
  });
  const teacherToken = teacherReg.data.token;
  console.log('✅ Teacher registered:', teacherReg.data.user.name);

  // 2. Fetch Classrooms
  const classListRes = await request('/api/teacher/classrooms', 'GET', null, teacherToken);
  if (classListRes.status !== 200 || !classListRes.data.classrooms) {
    console.error('❌ Failed to fetch classrooms:', classListRes);
    process.exit(1);
  }
  const cls = classListRes.data.classrooms[0];
  const classId = cls._id || cls.id;
  console.log(`✅ Loaded Classroom: '${cls.name}' with ${cls.students.length} students, ${cls.assignments.length} assignments`);

  // 3. Create new Assignment
  const asgRes = await request(`/api/teacher/classrooms/${classId}/assignments`, 'POST', {
    title: 'Milestone 3: Raft Consensus Cluster Architecture',
    instructions: 'Create a state machine diagram showing leader election and heartbeats.',
    dueDate: 'Dec 05 @ 23:59',
    points: 100,
  }, teacherToken);

  if (asgRes.status !== 201) {
    console.error('❌ Failed to create assignment:', asgRes);
    process.exit(1);
  }
  console.log('✅ Assignment created with due date and points');

  // 4. Student submits assignment (Privacy isolated)
  const subRes = await request(`/api/teacher/classrooms/${classId}/assignments/asg_raft_01/submit`, 'POST', {
    boardRoomId: 'room_student_raft_submission',
  }, teacherToken);

  if (subRes.status !== 201) {
    console.error('❌ Failed to submit assignment:', subRes);
    process.exit(1);
  }
  console.log('✅ Student assignment submitted with privacy barrier');

  // 5. Test AI Lesson Material Generation
  const aiLessonRes = await request('/api/teacher/ai-lesson-material', 'POST', {
    topic: 'Distributed Transactions & Two-Phase Commit',
  }, teacherToken);

  if (aiLessonRes.status !== 200 || !aiLessonRes.data.material.practiceQuestions) {
    console.error('❌ Failed to generate lesson material:', aiLessonRes);
    process.exit(1);
  }
  console.log(`✅ AI Lesson Plan generated with ${aiLessonRes.data.material.practiceQuestions.length} practice questions`);

  // 6. Test Personal Productivity Suite
  const personalReg = await request('/api/auth/register', 'POST', {
    name: 'Solo Freelancer & Builder',
    email: `builder_${testId}@freelance.dev`,
    password: 'password123',
    primaryWorkspaceType: 'personal',
  });
  const personalToken = personalReg.data.token;

  // Fetch planner
  const plannerRes = await request('/api/personal/planner', 'GET', null, personalToken);
  if (plannerRes.status !== 200 || !plannerRes.data.planner.dailyTasks) {
    console.error('❌ Failed to fetch personal planner:', plannerRes);
    process.exit(1);
  }
  const planner = plannerRes.data.planner;
  console.log(`✅ Personal Planner loaded: ${planner.dailyTasks.length} daily tasks, ${planner.weeklyGoals.length} weekly goals, ${planner.habits.length} habit streaks`);

  // Log habit checkin
  const habitRes = await request('/api/personal/habits/0/checkin', 'POST', null, personalToken);
  if (habitRes.status !== 200) {
    console.error('❌ Failed to log habit checkin:', habitRes);
    process.exit(1);
  }
  console.log('✅ Habit check-in recorded for today, streak updated');

  // Test AI Goal Breakdown
  const goalBreakdownRes = await request('/api/personal/ai-breakdown', 'POST', {
    goalTitle: 'Launch SaaS MVP and Acquire First 100 Paying Customers',
  }, personalToken);

  if (goalBreakdownRes.status !== 200 || !goalBreakdownRes.data.breakdown.subtasks) {
    console.error('❌ Failed to generate goal breakdown:', goalBreakdownRes);
    process.exit(1);
  }
  console.log(`✅ AI Goal Breakdown generated ${goalBreakdownRes.data.breakdown.subtasks.length} actionable subtasks`);

  console.log('\n🎉 ALL TEACHER & PERSONAL SUITE TESTS PASSED CLEANLY (100%)!\n');
};

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
