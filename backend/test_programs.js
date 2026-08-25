async function test() {
  try {
    // We can't easily login without knowing the password, but we know it's "admin123" for admin@educhain.edu based on earlier context.
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@educhain.edu', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed:', await loginRes.text());
      return;
    }
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Cookies:', cookies);
    
    // Get CSRF
    const csrfRes = await fetch('http://localhost:5000/api/csrf-token', {
      headers: { 'Cookie': cookies }
    });
    const csrfData = await csrfRes.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    const newCookies = csrfRes.headers.get('set-cookie') || cookies;
    // Merge cookies if needed
    
    // Create program
    const createRes = await fetch('http://localhost:5000/api/admin/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'X-CSRF-Token': csrfData.csrfToken
      },
      body: JSON.stringify({
        code: 'TEST202',
        name: 'Test Program 2',
        department: 'Testing'
      })
    });
    
    const responseText = await createRes.text();
    console.log('Create Program Response:', createRes.status, responseText);
    
  } catch (err) {
    console.error(err);
  }
}
test();
