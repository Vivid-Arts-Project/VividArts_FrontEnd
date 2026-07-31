import { useState } from 'react';

// 💡 1. Notification function එක Import කරගන්න (path එක exact location එකට අනුව සකසන්න)
import { showNotification } from './NotificationContainer';

function LoginPage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setMessage('Login successful.');
      
      // 💡 2. Login එක Success වුණාම Toast එක පෙන්වීම
      showNotification('success', 'Login successful! Welcome back.');
      
      onNavigate('profile');
    } catch (error) {
      const errText = error.message || 'Login failed. Please check your credentials.';
      setMessage(errText);

      // 💡 3. Login එක Fail වුණාම Error Toast එක පෙන්වීම
      showNotification('error', errText);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', backgroundColor: '#C0C0C0' }}>
      <h2 style={{ marginBottom: '12px', color: '#000000' }}>Client Login</h2>
      <p style={{ color: '#000000', marginBottom: '20px' }}>Sign in to view your profile and manage your account.</p>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Username</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', padding: '10px 42px 10px 10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
      </form>
      {message && <p style={{ marginTop: '12px', color: message.includes('successful') ? '#059669' : '#b91c1c' }}>{message}</p>}
      <p style={{ marginTop: '16px' }}>
      {message && <p style={{ marginTop: '12px', color: '#b91c1c' }}>{message}</p>}
      <p style={{ marginTop: '16px', color: '#000000' }}>
        New here?{' '}
        <button type="button" onClick={() => onNavigate('register')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Create an account</button>
      </p>
    </div>
  );
}

export default LoginPage;