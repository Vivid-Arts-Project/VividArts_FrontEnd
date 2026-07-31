import { useEffect, useState } from 'react';
import OrderTracker from './OrderTracker';

function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]); // Customer ගේ Orders තියාගන්න

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Profile Data Fetch කිරීම
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

        // Customer ගේ Orders Fetch කිරීම
        const ordersRes = await fetch('http://localhost:3001/api/orders/my-orders', {
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
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
      
      {/* 1. Customer Orders Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>My Orders Status</h3>
        
        {orders.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No active orders found.</p>
        ) : (
          orders.map((order) => (
            <div 
              key={order._id || order.id} 
              style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px',
                backgroundColor: '#0a0916'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Order #{order._id?.slice(-6) || 'N/A'}</span>
                <span style={{ fontSize: '14px', color: '#a78bfa' }}>{order.status}</span>
              </div>
              
              {/* මෙතනින් තමයි Order Progress Bar එක පෙනෙන්නේ */}
              <OrderTracker currentStatus={order.status} />
            </div>
          ))
        )}
      </div>

      {/* 2. Profile Details & Update Form */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <h2>Welcome, {user.username || 'Customer'}!</h2>
        <p style={{ color: '#6b7280' }}>Role: <strong>{user.role || 'customer'}</strong></p>
        
        <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(event) => setUsername(event.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} 
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} 
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Changes</button>
        </form>
        
        {message && <p style={{ marginTop: '12px', color: '#047857' }}>{message}</p>}
        <button onClick={handleLogout} style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>

    </div>
  );
}

export default ProfilePage;