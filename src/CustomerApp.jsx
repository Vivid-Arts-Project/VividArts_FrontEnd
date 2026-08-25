import './App.css';
import LandingPage from './pages/LandingPage';
import GalleryPage from './pages/GalleryPage';
import CommissionFlow from './pages/CommissionFlow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import InvoicePage from './pages/InvoicePage';
import CustomerNotificationsPage from './pages/CustomerNotificationsPage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import { useLocation, useNavigate } from './router';
import { Redirect } from './RouterComponents';
import { clearCustomerSession, CUSTOMER_AUTH_EVENT, hasCustomerSession, useIdleTimeout } from './authSession';
import { showNotification } from './pages/notifications';
import { useCallback, useEffect, useState } from 'react';

// Maps the page names used throughout the customer-side onNavigate() calls
// to real URLs, so the address bar and the browser back/forward buttons
// track the app's navigation instead of everything living at "/".
const PATHS = {
  landing: '/',
  gallery: '/gallery',
  commission: '/commission',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  profile: '/profile',
  orders: '/my-orders',
  notifications: '/notifications',
  reviews: '/reviews',
};

function CustomerApp() {
  const navigate = useNavigate();
  const path = useLocation().split(/[?#]/, 1)[0];
  const [isSignedIn, setIsSignedIn] = useState(hasCustomerSession);
  const navigateTo = (target = 'landing') => navigate(PATHS[target] ?? '/');

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
    return <CommissionFlow onBack={() => navigateTo('landing')} onNavigate={navigateTo} />;
  }
  if (path === '/login') return <LoginPage onNavigate={navigateTo} />;
  if (path === '/forgot-password') return <ForgotPasswordPage onNavigate={navigateTo} />;
  if (path === '/register') return <RegisterPage onNavigate={navigateTo} />;
  if (path === '/profile') {
    if (!isSignedIn) return <Redirect to="/" replace />;
    return <ProfilePage onNavigate={navigateTo} />;
  }
  if (path === '/my-orders') {
    if (!isSignedIn) return <Redirect to="/" replace />;
    return <MyOrdersPage onNavigate={navigateTo} />;
  }
  if (path.startsWith('/invoice/')) {
    if (!isSignedIn) return <Redirect to="/" replace />;
    const orderId = decodeURIComponent(path.slice('/invoice/'.length));
    if (!orderId) return <Redirect to="/my-orders" replace />;
    return <InvoicePage orderId={orderId} onNavigate={navigateTo} />;
  }
  if (path === '/notifications') {
    if (!isSignedIn) return <Redirect to="/" replace />;
    return <CustomerNotificationsPage onNavigate={navigateTo} />;
  }
  if (path === '/') return <LandingPage onNavigate={navigateTo} />;
  if (path === '/gallery') return <GalleryPage onNavigate={navigateTo} />;
  if (path === '/reviews') return <CustomerReviewsPage onNavigate={navigateTo} />;
  return <Redirect to="/" replace />;
}

export default CustomerApp;
