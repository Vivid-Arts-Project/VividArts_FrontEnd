import { useState, useCallback } from 'react';
import Sidebar  from '../../components/Sidebar';
import Topbar   from '../../components/Topbar';
import Toast    from '../../components/Toast';
import { NewOrderModal } from '../../components/Modals';
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

export default function AdminApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderMatch = location.split(/[?#]/, 1)[0].match(/^\/admin\/orders\/([^/]+)$/);
  const notificationHistory = location.split(/[?#]/, 1)[0] === '/admin/notifications';
  const [page, setPage]           = useState('orders');
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [showNewOrder, setShow]   = useState(false);
  const [stats, setStats]         = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showToast = useCallback((msg) => setToast(msg), []);

  const renderPage = () => {
    const props = { search, onToast: showToast, onNav: setPage, onStatsLoaded: setStats };
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
        onNav={(nextPage) => { setPage(nextPage); navigate('/admin'); }}
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
          onNewOrder={() => setShow(true)}
          onMenu={() => setMobileNavOpen(true)}
        />
        <div className="flex min-w-0 flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>

      {toast      && <Toast message={toast} onDone={() => setToast(null)}/>}
      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShow(false)}
          onSubmit={() => { setShow(false); showToast('✓ Order created'); }}
        />
      )}
    </div>
  );
}
