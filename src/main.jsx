import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasCustomerSession, resetCustomerSessionOnBoot } from './authSession.js'

resetCustomerSessionOnBoot()

if (
  !window.location.pathname.startsWith('/admin')
  && !hasCustomerSession()
  && window.location.pathname !== '/'
  && window.location.pathname !== '/login'
) {
  window.history.replaceState({}, '', '/')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
