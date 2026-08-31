async function triggerForgotPassword() {
  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhaypratapdh1234@gmail.com' })
    });
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}
triggerForgotPassword();
