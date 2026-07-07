import { useState } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CommissionFlow from './pages/CommissionFlow';

function App() {
  const [page, setPage] = useState('landing');

  return (
    <div>
      <div className="app-switcher">
        <button
          className={page === 'landing' ? 'active' : ''}
          onClick={() => setPage('landing')}
        >
          Landing
        </button>
        <button
          className={page === 'commission' ? 'active' : ''}
          onClick={() => setPage('commission')}
        >
          Commission Flow
        </button>
      </div>

      {page === 'landing' ? <LandingPage /> : <CommissionFlow />}
    </div>
  );
}

export default App;
