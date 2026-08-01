import { useEffect, useState } from 'react';
import OrderTracker from './OrderTracker';

function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile');
        }

        setUser(data);
        setUsername(data.username || '');
        setEmail(data.email || '');

        const ordersRes = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setMessage(error.message || 'Please log in again.');
        onNavigate('login');
      }
    };

    fetchProfileData();
  }, [onNavigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/customers/profile', {
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
      try { localStorage.setItem('username', username); } catch (_) {}
    } catch (error) {
      setMessage(error.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    onNavigate('login');
  };

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading your profile...</p>;
  }

  const initials = (user.username || 'U').slice(0, 1).toUpperCase();
  // refs for hidden file inputs
  let coverInputRef = null;
  let avatarInputRef = null;

  const uploadImage = async (file, type) => {
    const token = localStorage.getItem('token');
    if (!token) return setMessage('Not authenticated');

    const fd = new FormData();
    if (type === 'cover') fd.append('coverImage', file);
    else fd.append('profileImage', file);

    try {
      const res = await fetch(`/api/customers/profile/${type === 'cover' ? 'cover' : 'avatar'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      // refresh profile data in-place
      setUser(prev => ({ ...prev, profile_image_url: data.profile_image_url || prev.profile_image_url, cover_image_url: data.cover_image_url || prev.cover_image_url }));
      try { if (data.profile_image_url) localStorage.setItem('profile_image_url', data.profile_image_url); } catch (_) {}
      try { if (data.cover_image_url) localStorage.setItem('cover_image_url', data.cover_image_url); } catch (_) {}
      setMessage('Image updated');
      // update display name in localStorage if username changed elsewhere
    } catch (err) {
      setMessage(err.message || 'Upload failed');
    }
  };

  const onAvatarSelected = (ev) => { const f = ev.target.files?.[0]; if (f) uploadImage(f, 'avatar'); };
  const onCoverSelected = (ev) => { const f = ev.target.files?.[0]; if (f) uploadImage(f, 'cover'); };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 16px' }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', color: '#fff' }}>
        <div style={{ height: 200, background: user.cover_image_url ? `url(${user.cover_image_url}) center/cover no-repeat` : 'linear-gradient(90deg,#6d5bff,#2b8fe0)' }} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', padding: '0 20px', transform: 'translateY(-40px)' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', fontSize: 36, fontWeight: 700 }}>
            {user.profile_image_url ? <img src={user.profile_image_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>{user.username}</h1>
            <div style={{ marginTop: 6, color: '#c7c3e6' }}>{user.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={(el) => (coverInputRef = el)} type="file" accept="image/*" style={{ display: 'none' }} onChange={onCoverSelected} />
            <input ref={(el) => (avatarInputRef = el)} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAvatarSelected} />
            <button onClick={() => coverInputRef && coverInputRef.click()} style={{ padding: '10px 14px', background: '#2b8fe0', color: '#fff', borderRadius: 8, border: 'none' }}>Edit Cover Photo</button>
            <button onClick={() => avatarInputRef && avatarInputRef.click()} style={{ padding: '10px 14px', background: '#fff', color: '#111827', borderRadius: 8, border: 'none' }}>Edit Profile Picture</button>
            <button onClick={() => onNavigate('landing')} style={{ padding: '10px 14px', background: '#111827', color: '#fff', borderRadius: 8, border: 'none' }}>Back to Landing</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <div style={{ flex: 2 }}>
          <div style={{ borderRadius: 12, padding: 20, background: '#0a0916' }}>
            <h3 style={{ marginTop: 0 }}>Profile Details</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #27223f' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #27223f' }} />
              </div>
              <button type="submit" style={{ padding: '10px 14px', background: '#111827', color: '#fff', borderRadius: 8, border: 'none' }}>Save Changes</button>
              {message && <div style={{ marginTop: 12, color: '#47c07a' }}>{message}</div>}
            </form>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>My Orders</h3>
            {orders.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No active orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id || order.id} style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#0c0b16' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Order #{order._id?.slice(-6) || 'N/A'}</strong>
                    <span style={{ color: '#a78bfa' }}>{order.status}</span>
                  </div>
                  <OrderTracker currentStatus={order.status} />
                </div>
              ))
            )}
          </div>
        </div>
        <aside style={{ width: 300 }}>
          <div style={{ borderRadius: 12, padding: 16, background: '#0a0916' }}>
            <h4 style={{ marginTop: 0 }}>About</h4>
            <p style={{ color: '#a9a6c4' }}>{user.full_name || '—'}</p>
            <p style={{ color: '#a9a6c4' }}>Phone: {user.phone_number || '—'}</p>
            <p style={{ color: '#a9a6c4' }}>Address: {user.address || '—'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;