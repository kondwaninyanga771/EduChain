async function run() {
  try {
    console.log('1. Fetching CSRF Token...');
    const res1 = await fetch('http://localhost:5000/api/csrf-token');
    const data1 = await res1.json();
    const csrfToken = data1.csrfToken;
    const cookies = res1.headers.get('set-cookie');
    console.log('Token:', csrfToken);
    console.log('Cookies:', cookies);

    console.log('\n2. Registering with token...');
    const res2 = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies || ''
      },
      body: JSON.stringify({
        fullName: 'Demo Node',
        email: `demo_node_${Date.now()}@test.com`,
        password: 'SecureP@ssw0rd2026!',
        role: 'STUDENT'
      })
    });
    
    const text2 = await res2.text();
    console.log('Status:', res2.status);
    console.log('Body:', text2);
    
  } catch(e) {
    console.error('Test error:', e);
  }
}

run();
