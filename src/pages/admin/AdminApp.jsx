import { useState, useCallback, useEffect } from 'react';
import Sidebar  from '../../components/Sidebar';
import Topbar   from '../../components/Topbar';
import Toast    from '../../components/Toast';
//import { useAuth } from '../../context/AuthContext';

import OrdersPage    from '../OrdersPage';
import OrderManagePage from '../OrderManagePage';
import { useLocation, useNavigate } from '../../router';
import {
  DashboardPage, ProofsPage, RevisionsPage,
  ClientsPage, PaymentsPage, InvoicesPage,
} from '../OtherPages';
import SettingsPage from '../SettingsPage';
import GalleryManager from '../GalleryManager';
import AdminNotificationsPage from '../AdminNotificationsPage';
import { getOrders } from '../../api/adminApi';

const ADMIN_PAGES = new Set(['dashboard', 'orders', 'proofs', 'revisions', 'clients', 'payments', 'invoices', 'settings', 'gallery']);

const pageFromPath = (path) => {
  const orderDetail = path.match(/^\/admin\/orders\/[^/]+$/);
  if (orderDetail) return 'orders';
  const section = path.match(/^\/admin\/([^/]+)$/)?.[1];
  return ADMIN_PAGES.has(section) ? section : 'dashboard';
};

export default function AdminApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.split(/[?#]/, 1)[0];
  const orderMatch = path.match(/^\/admin\/orders\/([^/]+)$/);
  const notificationHistory = path === '/admin/notifications';
  const page = pageFromPath(path);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [stats, setStats]         = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showToast = useCallback((msg) => setToast(msg), []);
  const handlePageNavigation = useCallback((nextPage) => {
    // Search is page-specific. Keeping a previous page's query makes the order
    // table look incomplete until a full refresh resets this in-memory state.
    setSearch('');
    navigate(`/admin/${ADMIN_PAGES.has(nextPage) ? nextPage : 'dashboard'}`);
  }, [navigate]);

  useEffect(() => {
    if (/^\/admin\/orders\/[^/]+$/.test(path) || path === '/admin/notifications') return;
    const nextPage = pageFromPath(path);
    if (path !== `/admin/${nextPage}`) navigate(`/admin/${nextPage}`, { replace: true });
  }, [navigate, path]);

  useEffect(() => {
    let active = true;
    const loadStats = () => getOrders()
      .then(response => { if (active) setStats(response.data.stats); })
      .catch(() => {});
    loadStats();
    const interval = window.setInterval(loadStats, 5_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const renderPage = () => {
    const props = { search, onToast: showToast, onNav: handlePageNavigation, onStatsLoaded: setStats };
    if (orderMatch) return <OrderManagePage {...props} orderId={decodeURIComponent(orderMatch[1])}/>;
    if (notificationHistory) return <AdminNotificationsPage {...props}/>;
    switch (page) {
      case 'orders':    return <OrdersPage    {...props}/>;
      case 'dashboard': return <DashboardPage {...props}/>;
      case 'proofs':    return <ProofsPage    {...props}/>;
      case 'revisions': return <RevisionsPage {...props}/>;
      case 'clients':   return <ClientsPage   {...props}/>;
      case 'payments':  return <PaymentsPage  {...props}/>;
      case 'invoices':  return <InvoicesPage  {...props}/>;
      case 'settings':  return <SettingsPage  {...props}/>;
      case 'gallery':   return <GalleryManager {...props}/>;
      default:          return <OrdersPage    {...props}/>;
    }
  };

  return (
    <div className="va-admin flex min-h-screen overflow-x-hidden">
      <Sidebar
        page={page}
        onNav={handlePageNavigation}
        stats={stats}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      {mobileNavOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-[190] bg-[#0c0a20]/55 backdrop-blur-[2px] md:hidden" onClick={() => setMobileNavOpen(false)}/>}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden md:ml-[230px]">
        <Topbar
          page={orderMatch ? 'order' : notificationHistory ? 'notifications' : page}
          search={search}
          onSearch={setSearch}
          onMenu={() => setMobileNavOpen(true)}
        />
        <div className="flex min-w-0 flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>

      {toast      && <Toast message={toast} onDone={() => setToast(null)}/>}
    </div>
  );
}
