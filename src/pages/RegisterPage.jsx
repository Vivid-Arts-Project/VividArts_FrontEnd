import { useState } from 'react';

function RegisterPage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setMessage(data.message || 'Registration successful.');
    } catch (error) {
      setMessage(error.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginBottom: '12px' }}>Create an Account</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>Register to start your VividArts journey.</p>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Username</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Register</button>
      </form>
      {message && <p style={{ marginTop: '12px', color: '#047857' }}>{message}</p>}
      <p style={{ marginTop: '16px' }}>
        Already have an account?{' '}
        <button type="button" onClick={() => onNavigate('login')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Login</button>
      </p>
    </div>
  );
}

export default RegisterPage;
