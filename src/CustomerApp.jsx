import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

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
  const navigateTo = (target = 'landing') => navigate(PATHS[target] ?? '/');

  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={navigateTo} />} />
        <Route path="/commission/*" element={<CommissionFlow onBack={() => navigateTo('landing')} onNavigate={navigateTo} />} />
        <Route path="/login" element={<LoginPage onNavigate={navigateTo} />} />
        <Route path="/register" element={<RegisterPage onNavigate={navigateTo} />} />
        <Route path="/profile" element={<ProfilePage onNavigate={navigateTo} />} />
      </Routes>
    </div>
  );
}

export default CustomerApp;
