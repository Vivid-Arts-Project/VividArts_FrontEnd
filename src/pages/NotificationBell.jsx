import { useState, useEffect } from 'react';
import Icon from '../components/Icon';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());

  const token = localStorage.getItem('token');
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/orders/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Notifications fetch error:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [token]);

  // Toggle dropdown and mark all current notifications as read locally
  const toggleDropdown = () => {
    if (!showDropdown) {
      const allIds = new Set(notifications.map((n) => n.id));
      setReadIds((prev) => new Set([...prev, ...allIds]));
    }
    setShowDropdown(!showDropdown);
  };

  if (!isLoggedIn) return null;

  // Calculate total number of unread notifications
  const unreadCount = notifications.filter(
    (n) => !n.isRead && !readIds.has(n.id)
  ).length;

  return (
    <div style={{ position: 'relative' }}>
      
      <button
        type="button"
        aria-label="Notifications"
        onClick={toggleDropdown}
        style={{
          backgroundColor: '#1f2937',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <Icon name="bell" size={19}/>
        {/* Red badge indicator for unread notifications */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Container */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          right: '0',
          marginTop: '12px',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#14122a',
          color: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          zIndex: 1000
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            Notifications History
          </h4>

          {notifications.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#a9a6c4', margin: 0, textAlign: 'center' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((notif, index) => (
              <div 
                key={notif.id || index} 
                style={{ 
                  marginBottom: '12px', 
                  paddingBottom: '10px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#a78bfa', marginBottom: '2px' }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                  {notif.message}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
