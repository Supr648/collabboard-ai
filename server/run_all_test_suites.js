import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const suites = [
  { name: '1. Core QA Audit & Real-Time Sync (36 tests)', file: 'test_qa_audit.js' },
  { name: '2. Multi-Purpose Workspaces & Switching', file: 'test_workspaces.js' },
  { name: '3. Student Learning Workspace & AI Suite', file: 'test_student.js' },
  { name: '4. Team, Business & Live Decision Polls', file: 'test_team_projects.js' },
  { name: '5. Teacher Classroom & Personal Productivity', file: 'test_teacher_and_personal.js' },
  { name: '6. Community Library & AI Natural Language', file: 'test_community_and_notifications.js' },
  { name: '7. Full Integration E2E Test Suite (24 tests)', file: 'test_full_suite.js' },
  { name: '8. Authentication & Password Reset Flows (9 tests)', file: 'test_auth_flows.js' },
];

console.log('================================================================');
console.log('🚀 COLLABBOARD AI – MASTER AUTOMATED VERIFICATION SUITE');
console.log('================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of suites) {
  process.stdout.write(`⏳ Running [${suite.name}]... `);
  const startTime = Date.now();
  try {
    const output = execSync(`node "${path.join(__dirname, suite.file)}"`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ PASSED (${duration}s)`);
    totalPassed++;
    results.push({ name: suite.name, status: 'PASSED', duration: `${duration}s` });
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`❌ FAILED (${duration}s)`);
    console.error(err.stdout || err.stderr || err.message);
    totalFailed++;
    results.push({ name: suite.name, status: 'FAILED', duration: `${duration}s` });
  }
}

console.log('\n================================================================');
console.log('📊 CONSOLIDATED TEST EXECUTION MATRIX');
console.log('================================================================');
results.forEach((r, idx) => {
  const icon = r.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} [${r.status}] ${r.name.padEnd(52)} ${r.duration}`);
});
console.log('================================================================');
console.log(`TOTAL SUITES: ${suites.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
console.log(`SUCCESS RATE: ${((totalPassed / suites.length) * 100).toFixed(1)}%`);
console.log('================================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
