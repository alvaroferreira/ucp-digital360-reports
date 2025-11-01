// Simple test to trigger auth flow
const baseUrl = 'http://localhost:6699';

async function testAuth() {
  console.log('Testing credentials login...\n');

  // First, get the CSRF token
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  console.log('CSRF Token:', csrfData.csrfToken);

  // Now attempt to sign in
  const formData = new URLSearchParams();
  formData.append('email', 'admin@ucp.pt');
  formData.append('password', 'Admin2024!');
  formData.append('csrfToken', csrfData.csrfToken);
  formData.append('callbackUrl', '/dashboard');
  formData.append('json', 'true');

  const signInRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    redirect: 'manual'
  });

  console.log('\nResponse status:', signInRes.status);
  console.log('Response headers:', Object.fromEntries(signInRes.headers.entries()));

  const text = await signInRes.text();
  console.log('\nResponse body:', text);

  try {
    const json = JSON.parse(text);
    console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('\nNot JSON response');
  }
}

testAuth().catch(console.error);
