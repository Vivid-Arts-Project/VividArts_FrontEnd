import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { NotificationContainer } from './pages/NotificationContainer';

// Customer side — untouched, still owns its own internal page-switching
import CustomerApp from './CustomerApp';

// Admin side
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminApp from './pages/admin/AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin auth pages — public */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Admin dashboard — protected */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminApp />
              </PrivateRoute>
            }
          />

          {/* Everything else goes to the customer app, which handles
              its own internal navigation (landing, commission, login, etc.) */}
          <Route path="/*" element={<CustomerApp />} />
        </Routes>
      </AuthProvider>
      <NotificationContainer />
    </BrowserRouter>
  );
}
