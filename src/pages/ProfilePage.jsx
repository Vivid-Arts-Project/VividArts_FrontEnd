import { useEffect, useState } from 'react';

function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile');
        }

        setUser(data);
        setUsername(data.username || '');
        setEmail(data.email || '');
      } catch (error) {
        localStorage.removeItem('token');
        setMessage(error.message || 'Please log in again.');
        onNavigate('login');
      }
    };

    fetchProfile();
  }, [onNavigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setMessage(data.message || 'Profile updated successfully');
    } catch (error) {
      setMessage(error.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onNavigate('login');
  };

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading your profile...</p>;
  }

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
      <h2>Welcome, {user.username || 'Customer'}!</h2>
      <p style={{ color: '#6b7280' }}>Role: <strong>{user.role || 'customer'}</strong></p>
      <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Username</label>
          <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
      </form>
      {message && <p style={{ marginTop: '12px', color: '#047857' }}>{message}</p>}
      <button onClick={handleLogout} style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
    </div>
  );
}

export default ProfilePage;
