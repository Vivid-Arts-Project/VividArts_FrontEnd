import { useState } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';

function App() {
  const [page, setPage] = useState('landing');

  return (
    <div>
      {page === 'landing' ? (
        <LandingPage onNavigate={() => setPage('commission')} />
      ) : (
        <CommissionFlow onBack={() => setPage('landing')} />
      )}
    </div>
  );
}

export default App;
