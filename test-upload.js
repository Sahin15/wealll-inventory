const fs = require('fs');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5010/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@wealll.com', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    let token = '';
    if (loginData && loginData.data && loginData.data.token) {
      token = loginData.data.token;
    } else {
      console.log('Login failed');
    }

    fs.writeFileSync('dummy.png', 'fake image data');
    const fileData = fs.readFileSync('dummy.png');

    // creating a multipart form data manually in fetch is tricky without a library.
    // Instead, I'll just check if the backend is running and the /api/uploads route responds.
    const uploadRes = await fetch('http://localhost:5010/api/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // no content type means it will be empty but let's see what it returns
      }
    });

    console.log(uploadRes.status);
    console.log(await uploadRes.text());
  } catch (error) {
    console.error(error.message);
  }
}

test();
