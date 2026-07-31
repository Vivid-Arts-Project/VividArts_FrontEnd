import { useState } from 'react';

function RegisterPage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

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
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', backgroundColor: '#C0C0C0' }}>
      <h2 style={{ marginBottom: '12px', color: '#000000' }}>Create an Account</h2>
      <p style={{ color: '#000000', marginBottom: '20px' }}>Register to start your VividArts journey.</p>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Username</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', padding: '10px 42px 10px 10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#000000' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required style={{ width: '100%', padding: '10px 42px 10px 10px', border: '1px solid #000000', borderRadius: '8px', backgroundColor: '#C0C0C0', color: '#000000' }} />
            <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px' }} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {confirmPassword && (
            <div style={{ marginTop: '6px', fontSize: '14px', color: password && confirmPassword && password === confirmPassword ? '#047857' : '#b91c1c' }}>
              {password && confirmPassword && password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
            </div>
          )}
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Register</button>
      </form>
      {message && <p style={{ marginTop: '12px', color: '#047857' }}>{message}</p>}
      <p style={{ marginTop: '16px', color: '#000000' }}>
        Already have an account?{' '}
        <button type="button" onClick={() => onNavigate('login')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Login</button>
      </p>
    </div>
  );
}

export default RegisterPage;
