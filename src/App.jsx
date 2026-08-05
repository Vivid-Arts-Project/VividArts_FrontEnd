import { NotificationContainer } from './pages/NotificationContainer';

// Customer side — untouched, still owns its own internal page-switching
import CustomerApp from './CustomerApp';

// Admin side
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminApp from './pages/admin/AdminApp';
import { isTrustedNavigation, useLocation } from './router';
import { Redirect } from './RouterComponents';

export default function App() {
  const path = useLocation().split(/[?#]/, 1)[0];

  let content;
  if (path === '/admin/login') content = <AdminLogin />;
  else if (path === '/admin/register') content = isTrustedNavigation()
    ? <AdminRegister />
    : <Redirect to="/admin/login" replace />;
  else if (path.startsWith('/admin')) content = <PrivateRoute><AdminApp /></PrivateRoute>;
  else content = <CustomerApp />;

  return (
    <>
      <AuthProvider>
        {content}
      </AuthProvider>
      <NotificationContainer />
    </>
  );
}
