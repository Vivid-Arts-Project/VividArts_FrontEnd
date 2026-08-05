import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { isTrustedNavigation, useLocation, useNavigate } from './router';
import { Redirect } from './RouterComponents';
import { clearCustomerSession, CUSTOMER_AUTH_EVENT, hasCustomerSession, useIdleTimeout } from './authSession';
import { showNotification } from './pages/notifications';
import { useCallback, useEffect, useState } from 'react';

// Maps the page names used throughout the customer-side onNavigate() calls
// to real URLs, so the address bar and the browser back/forward buttons
// track the app's navigation instead of everything living at "/".
const PATHS = {
  landing: '/',
  commission: '/commission',
  login: '/login',
  register: '/register',
  profile: '/profile',
};

function CustomerApp() {
  const navigate = useNavigate();
  const path = useLocation().split(/[?#]/, 1)[0];
  const [isSignedIn, setIsSignedIn] = useState(hasCustomerSession);
  const navigateTo = (target = 'landing') => navigate(PATHS[target] ?? '/');
  const isPaymentReturn = path === '/commission/payment'
    && new URLSearchParams(window.location.search).has('payment')
    && new URLSearchParams(window.location.search).has('order_id');

  const handleIdleLogout = useCallback(() => {
    clearCustomerSession();
    setIsSignedIn(false);
    showNotification('warning', 'You were signed out after 30 minutes of inactivity.');
    navigate('/', { replace: true });
  }, [navigate]);

  useIdleTimeout(isSignedIn, handleIdleLogout);

  useEffect(() => {
    const syncAuthentication = () => setIsSignedIn(hasCustomerSession());
    window.addEventListener(CUSTOMER_AUTH_EVENT, syncAuthentication);
    window.addEventListener('storage', syncAuthentication);
    return () => {
      window.removeEventListener(CUSTOMER_AUTH_EVENT, syncAuthentication);
      window.removeEventListener('storage', syncAuthentication);
    };
  }, []);

  if (path.startsWith('/commission')) {
    if (!isSignedIn) return <Redirect to="/" replace />;
    if (!isTrustedNavigation() && !isPaymentReturn) return <Redirect to="/" replace />;
    return <CommissionFlow onBack={() => navigateTo('landing')} onNavigate={navigateTo} />;
  }
  if (path === '/login') return <LoginPage onNavigate={navigateTo} />;
  if (path === '/register') return isTrustedNavigation()
    ? <RegisterPage onNavigate={navigateTo} />
    : <Redirect to="/login" replace />;
  if (path === '/profile') {
    if (!isSignedIn || !isTrustedNavigation()) return <Redirect to="/" replace />;
    return <ProfilePage onNavigate={navigateTo} />;
  }
  if (path === '/') return <LandingPage onNavigate={navigateTo} />;
  return <Redirect to="/" replace />;
}

export default CustomerApp;
