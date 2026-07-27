import { useState } from 'react';

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setMessage('Login successful.');
      onNavigate('profile');
    } catch (error) {
      setMessage(error.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginBottom: '12px' }}>Client Login</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Sign in to view your profile and manage your account.</p>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
      </form>
      {message && <p style={{ marginTop: '12px', color: '#b91c1c' }}>{message}</p>}
      <p style={{ marginTop: '16px' }}>
        New here?{' '}
        <button type="button" onClick={() => onNavigate('register')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Create an account</button>
      </p>
    </div>
  );
}

export default LoginPage;
