import { NotificationContainer } from './pages/NotificationContainer';
import { useEffect, useState } from 'react';
import BrandLogo from './components/BrandLogo';

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
  else content = <CustomerAvailability><CustomerApp /></CustomerAvailability>;

  return (
    <>
      <AuthProvider>
        {content}
      </AuthProvider>
      <NotificationContainer />
    </>
  );
}

function CustomerAvailability({ children }) {
  const [state, setState] = useState({ loading: true, developmentMode: false, maintenanceMessage: '' });
  useEffect(() => {
    fetch('/api/content/site-settings')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(settings => setState({ loading: false, ...settings }))
      .catch(() => setState(current => ({ ...current, loading: false })));
  }, []);
  if (state.loading) return <div className="min-h-screen bg-[#090816]"/>;
  if (!state.developmentMode) return children;
  return <main className="flex min-h-screen items-center justify-center bg-[#090816] px-6 font-sans text-white"><section className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#151326] p-10 text-center shadow-[0_30px_90px_rgba(0,0,0,.45)]"><div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#b9afff]/30 bg-white shadow-[0_10px_28px_rgba(93,78,210,.3)]"><BrandLogo size={68}/></div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a99bff]">Vivid Arts</p><h1 className="mt-3 font-outfit text-3xl font-bold">System under development</h1><p className="mt-4 leading-7 text-[#aaa7c4]">{state.maintenanceMessage}</p><a href="/admin/login" className="mt-7 inline-block text-xs font-semibold text-white/40 hover:text-white">Administrator sign in</a></section></main>;
}
