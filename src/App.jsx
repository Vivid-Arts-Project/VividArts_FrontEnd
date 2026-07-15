import { useState } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';

function App() {
  // PayHere redirects back with ?payment=success|cancelled after a full page
  // reload, which resets all React state. Jump straight into the commission
  // flow so Payment.jsx (the only place that reads that query param) mounts.
  const [page, setPage] = useState(() =>
    new URLSearchParams(window.location.search).has('payment') ? 'commission' : 'landing'
  );

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
