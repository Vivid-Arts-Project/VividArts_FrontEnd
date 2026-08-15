import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import Icon from './Icon';
import { getAdminNotifications, markAdminNotificationRead, markAllAdminNotificationsRead } from '../api/adminApi';
import { useLocation, useNavigate } from '../router';

const PAGE_META = {
  orders: { title: 'Order Management', bread: 'Orders' },
  order: { title: 'Manage Order', bread: 'Order details' },
  dashboard: { title: 'Dashboard', bread: 'Dashboard' },
  proofs: { title: 'Proof Upload', bread: 'Proofs' },
  revisions: { title: 'Revision Requests', bread: 'Revisions' },
  clients: { title: 'Clients', bread: 'Clients' },
  payments: { title: 'Payments', bread: 'Payments' },
  invoices: { title: 'Invoices', bread: 'Invoices' },
  settings: { title: 'Settings', bread: 'Settings' },
  notifications: { title: 'Notifications', bread: 'Activity history' },
};

const timeAgo = (value) => {
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 60_000) return 'Just now';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Date(value).toLocaleDateString('en-LK', { dateStyle: 'medium' });
};

export default function Topbar({ page, onNewOrder, search, onSearch, onMenu }) {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const meta = PAGE_META[page] || { title: page, bread: page };
  const unreadCount = notifications.filter(notification => !notification.is_read).length;
  const businessName = admin?.businessName || 'Vivid Arts';

  const loadNotifications = useCallback(async () => {
    try {
      const response = await getAdminNotifications();
      setNotifications(response.data.notifications);
    } catch { /* The admin session guard handles authentication failures. */ }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch persisted notifications when the admin shell mounts
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30_000);
    window.addEventListener('vividarts:admin-notifications', loadNotifications);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('vividarts:admin-notifications', loadNotifications);
    };
  }, [loadNotifications]);

  const openHistory = async (notification) => {
    if (notification && !notification.is_read) {
      try {
        await markAdminNotificationRead(notification.id);
        setNotifications(current => current.map(item => item.id === notification.id ? { ...item, is_read: true } : item));
      } catch { /* The history page can retry this update. */ }
    }
    setShowNotif(false);
    if (location.split(/[?#]/, 1)[0] === '/admin/notifications') return;
    navigate('/admin/notifications');
  };

  const markAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setNotifications(current => current.map(notification => ({ ...notification, is_read: true })));
    } catch { /* Leave the visible unread state unchanged if persistence fails. */ }
  };

  return (
    <>
      <header className="sticky top-0 z-[100] flex min-h-[60px] items-center justify-between gap-2 border-b border-va-border bg-white px-3 py-2 shadow-[0_1px_0_var(--va-border)] sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <button type="button" aria-label="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-va-border bg-va-bg text-va-purple md:hidden" onClick={onMenu}><Icon name="menu" size={20}/></button>
          <div className="min-w-0">
            <div className="truncate font-outfit text-[15px] font-bold text-va-text sm:text-[17px]">{meta.title}</div>
            <div className="truncate text-[10px] text-va-text3 sm:text-xs">{businessName} / <span className="font-semibold text-va-purple">{meta.bread}</span></div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-va-border bg-va-bg px-3 py-[7px] text-[13px] text-va-text3 transition-colors focus-within:border-va-blue focus-within:bg-white sm:flex sm:w-[180px] lg:w-[220px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="var(--va-text3)" strokeWidth="1.2"/><path d="M9.5 9.5L12 12" stroke="var(--va-text3)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input placeholder="Search orders, clients…" value={search} onChange={event => onSearch(event.target.value)} className="w-full border-none bg-transparent font-sans text-[13px] text-va-text outline-none"/>
          </div>
          <button type="button" aria-label="Notifications" aria-expanded={showNotif} className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-all ${showNotif ? 'border-va-purple bg-grad-soft text-va-purple shadow-[0_0_0_3px_rgba(91,63,168,0.08)]' : 'border-va-border bg-white text-va-text2 hover:border-va-border2 hover:bg-va-bg hover:text-va-purple'}`} onClick={() => setShowNotif(value => !value)}>
            <Icon name="bell" size={18}/>
            {unreadCount > 0 && <span className="absolute right-[3px] top-[2px] flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-va-danger px-0.5 text-[8px] font-extrabold leading-none text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <button type="button" aria-label="Create new order" className="flex h-9 items-center gap-1.5 rounded-lg border-none bg-grad px-3 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 hover:shadow-[0_4px_14px_rgba(91,63,168,0.3)] sm:h-auto sm:px-4 sm:py-2" onClick={onNewOrder}><span aria-hidden="true">+</span><span className="hidden sm:inline">New Order</span></button>
        </div>
      </header>

      {showNotif && (
        <div className="notification-pop fixed left-3 right-3 top-[68px] z-[300] overflow-hidden rounded-xl border border-va-border bg-white shadow-[0_18px_50px_rgba(30,24,72,0.18)] sm:left-auto sm:right-4 sm:w-[350px]">
          <div className="absolute -top-1.5 right-[77px] h-3 w-3 rotate-45 border-l border-t border-va-border bg-white"/>
          <div className="flex items-center justify-between border-b border-va-border bg-gradient-to-r from-[#f5f9ff] to-[#f6f1ff] px-4 py-3.5">
            <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad text-white shadow-sm"><Icon name="bell" size={17}/></div><div><div className="font-outfit text-sm font-bold text-va-text">Notifications</div><div className="text-[10px] text-va-text3">Your latest account activity</div></div></div>
            <span className="rounded-full border border-va-border bg-white px-2 py-1 text-[10px] font-bold text-va-purple">{unreadCount} new</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? <div className="px-4 py-7 text-center text-xs text-va-text3">No notifications yet.</div> : notifications.slice(0, 4).map(notification => (
              <button key={notification.id} type="button" className={`flex w-full items-start gap-3 border-b border-va-border px-4 py-3.5 text-left transition-colors hover:bg-blue-50 ${notification.is_read ? 'bg-white' : 'bg-blue-50/40'}`} onClick={() => openHistory(notification)}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.is_read ? 'bg-va-bg text-va-text3' : 'bg-va-info-bg text-va-info'}`}><Icon name={notification.type === 'order' ? 'orders' : notification.type === 'message' ? 'revisions' : 'info'} size={18}/></div>
                <div className="min-w-0 flex-1"><div className="text-xs leading-relaxed text-va-text2"><strong>{notification.title}</strong> — {notification.message}</div><div className="mt-1 text-[11px] text-va-text3">{timeAgo(notification.createdAt)}</div></div>
                {!notification.is_read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-va-blue"/>}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-va-border bg-white px-4 py-2.5">
            <button type="button" disabled={!unreadCount} onClick={markAllRead} className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-va-purple hover:underline disabled:cursor-default disabled:text-va-text3 disabled:no-underline">Mark all as read</button>
            <button type="button" onClick={() => openHistory()} className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-va-purple hover:underline">View all</button>
          </div>
        </div>
      )}
    </>
  );
}
