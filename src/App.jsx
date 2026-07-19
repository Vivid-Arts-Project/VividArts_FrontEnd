import { useState } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [page, setPage] = useState(() =>
    new URLSearchParams(window.location.search).has('payment') ? 'commission' : 'landing'
  );

  const navigateTo = (target = 'landing') => setPage(target);

  return (
    <div>
      {page === 'landing' && <LandingPage onNavigate={navigateTo} />}
      {page === 'commission' && <CommissionFlow onBack={() => setPage('landing')} />}
      {page === 'login' && <LoginPage onNavigate={navigateTo} />}
      {page === 'register' && <RegisterPage onNavigate={navigateTo} />}
      {page === 'profile' && <ProfilePage onNavigate={navigateTo} />}
    </div>
  );
}

export default App;
