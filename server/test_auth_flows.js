const BASE_URL = 'http://localhost:5000/api';

async function runAuthTests() {
  console.log('🚀 Starting Comprehensive Authentication Flow Tests...');
  let passed = 0;
  let total = 0;

  const testUser = {
    name: 'SaaS Reviewer',
    email: `reviewer_${Date.now()}@collabboard.ai`,
    password: 'Password123!',
    workspacePurpose: 'team'
  };

  // Test 1: Register User
  total++;
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    if (regRes.status === 201 && regData.token && regData.user.email === testUser.email) {
      console.log('✅ 1. Register with workspace purpose: PASSED');
      passed++;
    } else {
      console.error('❌ 1. Register failed unexpected response:', regData);
    }
  } catch (err) {
    console.error('❌ 1. Register failed:', err.message);
  }

  // Test 2: Reject Duplicate Email Registration
  total++;
  try {
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    if (dupRes.status === 409 || dupRes.status === 400) {
      console.log('✅ 2. Reject duplicate email registration: PASSED');
      passed++;
    } else {
      console.error('❌ 2. Duplicate registration unexpected status:', dupRes.status);
    }
  } catch (err) {
    console.error('❌ 2. Duplicate registration error:', err.message);
  }

  // Test 3: Login with Correct Credentials
  total++;
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token && loginData.user.id) {
      console.log('✅ 3. Login with valid credentials: PASSED');
      passed++;
    } else {
      console.error('❌ 3. Login failed:', loginData);
    }
  } catch (err) {
    console.error('❌ 3. Login error:', err.message);
  }

  // Test 4: Login with Incorrect Password
  total++;
  try {
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword999!'
      })
    });
    if (badLoginRes.status === 401) {
      console.log('✅ 4. Reject invalid password with 401: PASSED');
      passed++;
    } else {
      console.error('❌ 4. Invalid password unexpected status:', badLoginRes.status);
    }
  } catch (err) {
    console.error('❌ 4. Invalid password error:', err.message);
  }

  // Test 5: Forgot Password Endpoint
  total++;
  let resetToken = null;
  try {
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    const forgotData = await forgotRes.json();
    if (forgotRes.status === 200 && forgotData.success) {
      console.log('✅ 5. Forgot password request initiated: PASSED');
      resetToken = forgotData.resetToken;
      passed++;
    } else {
      console.error('❌ 5. Forgot password unexpected response:', forgotData);
    }
  } catch (err) {
    console.error('❌ 5. Forgot password error:', err.message);
  }

  // Test 6: Reset Password with Valid Token
  total++;
  const newPassword = 'NewSecurePassword2026!';
  try {
    if (!resetToken) throw new Error('No resetToken available from step 5');
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: newPassword
      })
    });
    const resetData = await resetRes.json();
    if (resetRes.status === 200 && resetData.success) {
      console.log('✅ 6. Reset password with valid token: PASSED');
      passed++;
    } else {
      console.error('❌ 6. Reset password unexpected response:', resetData);
    }
  } catch (err) {
    console.error('❌ 6. Reset password error:', err.message);
  }

  // Test 7: Verify Old Password No Longer Works
  total++;
  try {
    const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    if (oldLoginRes.status === 401) {
      console.log('✅ 7. Old password rejected after reset: PASSED');
      passed++;
    } else {
      console.error('❌ 7. Old password unexpected status:', oldLoginRes.status);
    }
  } catch (err) {
    console.error('❌ 7. Old password error:', err.message);
  }

  // Test 8: Verify New Password Works
  total++;
  try {
    const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: newPassword
      })
    });
    const newLoginData = await newLoginRes.json();
    if (newLoginRes.status === 200 && newLoginData.token) {
      console.log('✅ 8. Login with newly reset password: PASSED');
      passed++;
    } else {
      console.error('❌ 8. Login with new password failed:', newLoginData);
    }
  } catch (err) {
    console.error('❌ 8. Login with new password error:', err.message);
  }

  // Test 9: Reject Re-used / Invalid Reset Token
  total++;
  try {
    const reuseRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken || 'fake-invalid-token',
        newPassword: 'AnotherPassword123!'
      })
    });
    if (reuseRes.status === 400) {
      console.log('✅ 9. Reject expired or already used reset token: PASSED');
      passed++;
    } else {
      console.error('❌ 9. Invalid token unexpected status:', reuseRes.status);
    }
  } catch (err) {
    console.error('❌ 9. Invalid token error:', err.message);
  }

  console.log(`\n========================================`);
  console.log(`🎯 AUTHENTICATION SUITE: ${passed}/${total} TESTS PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuthTests();
