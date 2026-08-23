import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import { getCustomerToken } from '../authSession';
import { api } from '../api';
import { useLocation, useNavigate } from '../router';
import { startVisiblePolling } from '../utils/polling';

export const CUSTOMER_NOTIFICATIONS_EVENT = 'vividarts:customer-notifications';

const timeAgo = (value) => {
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 60_000) return 'Just now';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Date(value).toLocaleDateString('en-LK', { dateStyle: 'medium' });
};

const cleanTitle = (title) => String(title || '')
  .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, '')
  .replace(/\s+/g, ' ')
  .trim();

const iconForStatus = (status) => ({
  sketching: 'pencil',
  waiting_for_feedback: 'approval',
  finished: 'completed',
  framed: 'proofs',
  shipped: 'package',
  done: 'completed',
  cancelled: 'alert',
}[status] || 'info');

export default function NotificationBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toastNotification, setToastNotification] = useState(null);
  const initialLoadedRef = useRef(false);
  const knownIdsRef = useRef(new Set());
  const token = getCustomerToken();

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.getCustomerNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);

      if (!initialLoadedRef.current) {
        initialLoadedRef.current = true;
        knownIdsRef.current = new Set(list.map(n => n.id));
      } else {
        const unreadNew = list
          .filter(n => !n.isRead && !knownIdsRef.current.has(n.id))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        list.forEach(n => knownIdsRef.current.add(n.id));

        if (unreadNew.length > 0) {
          setToastNotification(unreadNew[0]);
        }
      }
    } catch { /* Authentication state is handled by CustomerApp. */ }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const stopPolling = startVisiblePolling(loadNotifications, 10_000);
    const handleEvent = (event) => {
      if (event?.detail) {
        setToastNotification(event.detail);
      }
      loadNotifications();
    };
    window.addEventListener(CUSTOMER_NOTIFICATIONS_EVENT, handleEvent);
    return () => {
      stopPolling();
      window.removeEventListener(CUSTOMER_NOTIFICATIONS_EVENT, handleEvent);
    };
  }, [loadNotifications, token]);

  useEffect(() => {
    if (!toastNotification) return undefined;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  if (!token) return null;

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const openHistory = async (notification) => {
    if (notification && !notification.isRead) {
      try {
        await api.markCustomerNotificationRead(notification.id);
        setNotifications(current => current.map(item => item.id === notification.id ? { ...item, isRead: true } : item));
      } catch { /* The history page can retry this update. */ }
    }
    setShowDropdown(false);
    setToastNotification(null);
    if (location.split(/[?#]/, 1)[0] === '/notifications') return;
    navigate('/notifications');
  };

  const markAllRead = async () => {
    try {
      await api.markAllCustomerNotificationsRead();
      setNotifications(current => current.map(notification => ({ ...notification, isRead: true })));
    } catch { /* Preserve visible unread state if the request fails. */ }
  };

  return (
    <div className="relative">
      <button type="button" aria-label="Notifications" aria-expanded={showDropdown} onClick={() => { setShowDropdown(value => !value); setToastNotification(null); }} className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-white transition ${showDropdown ? 'border-[#a78bfa] bg-[#312a65] shadow-[0_0_0_3px_rgba(167,139,250,.12)]' : 'border-white/15 bg-white/[.07] hover:border-[#a78bfa]/50 hover:bg-white/10'}`}>
        <Icon name="bell" size={20}/>
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#100d23] bg-red-500 px-0.5 text-[9px] font-extrabold leading-none text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {/* Popup banner when new notification arrives */}
      {toastNotification && !showDropdown && (
        <div
          role="status"
          aria-live="polite"
          className="notification-pop-toast fixed left-3 right-3 top-[76px] z-[320] flex items-start gap-3 rounded-2xl border border-[#e5e0f5] bg-white p-3.5 text-[#1e1b38] shadow-[0_20px_50px_rgba(20,15,50,0.22),0_0_20px_rgba(99,102,241,0.12)] transition-all sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[340px]"
        >
          <div className="absolute -top-1.5 right-4 hidden h-3 w-3 rotate-45 border-l border-t border-[#e5e0f5] bg-white sm:block"/>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#9258e8] text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
            <Icon name={iconForStatus(toastNotification.status)} size={20} />
          </div>
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openHistory(toastNotification)}>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              <strong className="block truncate text-xs font-bold text-[#1e1b38]">
                {cleanTitle(toastNotification.title) || 'New Notification'}
              </strong>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#5b5675]">
              {toastNotification.message}
            </p>
            <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-wider text-[#6366f1]">
              Just now · Click to view
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToastNotification(null);
            }}
            className="shrink-0 rounded-lg p-1 text-[#8c87a5] transition hover:bg-[#f3f0fc] hover:text-[#1e1b38]"
            aria-label="Dismiss notification"
          >
            <span className="text-base leading-none">×</span>
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="notification-pop fixed left-3 right-3 top-[76px] z-[300] overflow-hidden rounded-xl border border-va-border bg-white text-va-text shadow-[0_18px_50px_rgba(3,2,15,.45)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[350px]">
          <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-va-border bg-white"/>
          <div className="flex items-center justify-between border-b border-va-border bg-gradient-to-r from-[#f5f9ff] to-[#f6f1ff] px-4 py-3.5">
            <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-grad text-white shadow-sm"><Icon name="bell" size={17}/></div><div><div className="font-outfit text-sm font-bold">Notifications</div><div className="text-[10px] text-va-text3">Your latest portrait updates</div></div></div>
            <span className="rounded-full border border-va-border bg-white px-2 py-1 text-[10px] font-bold text-va-purple">{unreadCount} new</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? <div className="px-4 py-7 text-center text-xs text-va-text3">No notifications yet.</div> : notifications.slice(0, 4).map(notification => (
              <button key={notification.id} type="button" onClick={() => openHistory(notification)} className={`flex w-full items-start gap-3 border-b border-va-border px-4 py-3.5 text-left transition-colors hover:bg-blue-50 ${notification.isRead ? 'bg-white' : 'bg-blue-50/40'}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notification.isRead ? 'bg-va-bg text-va-text3' : 'bg-va-info-bg text-va-info'}`}><Icon name={iconForStatus(notification.status)} size={18}/></div>
                <div className="min-w-0 flex-1"><div className="text-xs leading-relaxed text-va-text2"><strong>{cleanTitle(notification.title)}</strong> — {notification.message}</div><div className="mt-1 text-[11px] text-va-text3">{timeAgo(notification.createdAt)}</div></div>
                {!notification.isRead && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-va-blue"/>}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-va-border bg-white px-4 py-2.5">
            <button type="button" disabled={!unreadCount} onClick={markAllRead} className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-va-purple hover:underline disabled:cursor-default disabled:text-va-text3 disabled:no-underline">Mark all as read</button>
            <button type="button" onClick={() => openHistory()} className="cursor-pointer border-none bg-transparent text-[11px] font-semibold text-va-purple hover:underline">View all</button>
          </div>
        </div>
      )}
    </div>
  );
}
