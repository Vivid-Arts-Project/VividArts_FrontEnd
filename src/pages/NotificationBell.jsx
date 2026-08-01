import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);

      // මුලින්ම Notifications Fetch කිරීම
      fetchNotifications(token);

      // තත්පර 10කට සැරයක් Auto Check වෙනවා (Live Update එකට)
      const interval = setInterval(() => {
        fetchNotifications(token);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotifications = async (token) => {
    try {
      const res = await fetch('http://localhost:3001/api/orders/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data); // Database එකේ Save වෙලා තියෙන List එකම State එකට සෙට් වෙනවා
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 🔔 Bell Button (නොකියවපු Notifications තියෙනවනම් Badge එකක් එක්ක) */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
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
        🔔
        {notifications.length > 0 && (
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
            {notifications.length}
          </span>
        )}
      </button>

      {/* Store වුණු Notifications පිළිවෙළට පෙන්වන Dropdown Box එක */}
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
            Notifications History 📦
          </h4>

          {notifications.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#a9a6c4', margin: 0, textAlign: 'center' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
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