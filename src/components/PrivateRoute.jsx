import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Wrap any admin page with this component.
// If the user is not logged in they get redirected to /admin/login.
// If we're still checking the session (loading=true) we show nothing
// so the page doesn't flash before the redirect.

export default function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    // Still checking session — show a minimal spinner so the page
    // doesn't flicker between logged-in and logged-out states.
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F4F3FA',
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #DDD9F5',
          borderTopColor: '#5B3FA8', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → send to login page
  if (!admin) return <Navigate to="/admin/login" replace />;

  // Logged in → render the protected page
  return children;
}
