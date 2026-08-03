import { useState, useCallback } from 'react';
import Sidebar  from '../../components/Sidebar';
import Topbar   from '../../components/Topbar';
import Toast    from '../../components/Toast';
import { NewOrderModal } from '../../components/Modals';
//import { useAuth } from '../../context/AuthContext';

import OrdersPage    from '../OrdersPage';
import {
  DashboardPage, ProofsPage, RevisionsPage,
  ClientsPage, PaymentsPage, InvoicesPage,
} from '../OtherPages';
import SettingsPage from '../SettingsPage';
import GalleryManager from '../GalleryManager';

export default function AdminApp() {
  const [page, setPage]           = useState('orders');
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [showNewOrder, setShow]   = useState(false);
  const [stats, setStats]         = useState(null);

  const showToast = useCallback((msg) => setToast(msg), []);

  const renderPage = () => {
    const props = { search, onToast: showToast, onNav: setPage, onStatsLoaded: setStats };
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
    <div className="va-admin flex min-h-screen overflow-hidden">
      <Sidebar page={page} onNav={setPage} stats={stats}/>
      <div className="ml-[230px] flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Topbar
          page={page}
          search={search}
          onSearch={setSearch}
          onNewOrder={() => setShow(true)}
        />
        <div className="flex flex-1 overflow-hidden">
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
