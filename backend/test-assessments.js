async function run() {
  try {
    console.log('1. Fetching CSRF Token...');
    const res1 = await fetch('http://localhost:5000/api/csrf-token');
    const data1 = await res1.json();
    const csrfToken = data1.csrfToken;
    let cookies = res1.headers.get('set-cookie') || '';

    console.log('2. Registering new test user...');
    const email = `student_${Date.now()}@test.com`;
    const resReg = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies
      },
      body: JSON.stringify({
        fullName: 'Test Student',
        email,
        password: 'Password123!',
        role: 'STUDENT'
      })
    });
    
    console.log('Registration Status:', resReg.status);
    
    console.log('3. Logging in...');
    const resLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies
      },
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    
    // Update cookies with JWT
    const loginCookies = resLogin.headers.get('set-cookie');
    if (loginCookies) {
      // Very naive cookie merge for testing
      cookies = loginCookies;
    }
    console.log('Login Status:', resLogin.status);

    console.log('4. Fetching Assessments...');
    const resAssessments = await fetch('http://localhost:5000/api/student/assessments', {
      headers: {
        'Cookie': cookies
      }
    });

    console.log('Assessments Status:', resAssessments.status);
    const assessments = await resAssessments.json();
    console.log('Assessments Data:', JSON.stringify(assessments, null, 2));

    console.log('5. Fetching Submissions...');
    const resSubmissions = await fetch('http://localhost:5000/api/student/submissions', {
      headers: {
        'Cookie': cookies
      }
    });

    console.log('Submissions Status:', resSubmissions.status);
    const submissions = await resSubmissions.json();
    console.log('Submissions Data:', JSON.stringify(submissions, null, 2));

    console.log('6. Fetching Results...');
    const resResults = await fetch('http://localhost:5000/api/student/results', {
      headers: {
        'Cookie': cookies
      }
    });

    console.log('Results Status:', resResults.status);
    const results = await resResults.json();
    console.log('Results Data:', JSON.stringify(results, null, 2));

    console.log('7. Fetching Profile...');
    const resProfile = await fetch('http://localhost:5000/api/student/profile', {
      headers: {
        'Cookie': cookies
      }
    });
    console.log('Profile Status:', resProfile.status);
    const profile = await resProfile.json();
    console.log('Profile Data:', JSON.stringify(profile, null, 2));

    console.log('8. Toggling 2FA...');
    const res2FA = await fetch('http://localhost:5000/api/student/profile/2fa', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies
      },
      body: JSON.stringify({ isTwoFactorEnabled: true })
    });
    console.log('Toggle 2FA Status:', res2FA.status);
    const data2FA = await res2FA.json();
    console.log('2FA Data:', JSON.stringify(data2FA, null, 2));

  } catch(e) {
    console.error('Test error:', e);
  }
}
run();
