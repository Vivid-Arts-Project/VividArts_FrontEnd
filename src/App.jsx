import './App.css'
import { useState } from 'react'
import UploadCustomize from './pages/UploadCustomize'
import Landing from './pages/Landing'
import Payment from './pages/Payment'

function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.has('payment') || params.has('order_id') ? 'payment' : 'landing'
  })

  if (page === 'customize') {
    return <UploadCustomize onBack={() => setPage('landing')} onNext={() => setPage('payment')} />
  }

  if (page === 'payment') {
    return <Payment onBack={() => setPage('customize')} onComplete={() => setPage('landing')} />
  }

  return <Landing onNavigate={(p) => setPage(p)} />
}

export default App
