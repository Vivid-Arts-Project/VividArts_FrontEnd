import { useCallback, useEffect, useState } from 'react';
import Icon from '../components/Icon';
import {
  deleteAdminNotification,
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '../api/adminApi';

export const ADMIN_NOTIFICATIONS_EVENT = 'vividarts:admin-notifications';

const formatTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
};

const iconForType = (type) => ({
  order: 'orders',
  message: 'revisions',
  approval: 'completed',
  revision: 'refresh',
  system: 'info',
}[type] || 'bell');

export default function AdminNotificationsPage({ onToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const response = await getAdminNotifications();
      setNotifications(response.data.notifications);
    } catch {
      onToast('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch persisted notifications when this route opens
    load();
  }, [load]);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await markAdminNotificationRead(notification.id);
      setNotifications(current => current.map(item => item.id === notification.id ? { ...item, is_read: true } : item));
      window.dispatchEvent(new Event(ADMIN_NOTIFICATIONS_EVENT));
    } catch { onToast('Failed to mark notification as read'); }
  };

  const markAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      setNotifications(current => current.map(item => ({ ...item, is_read: true })));
      window.dispatchEvent(new Event(ADMIN_NOTIFICATIONS_EVENT));
      onToast('All notifications marked as read');
    } catch { onToast('Failed to mark notifications as read'); }
  };

  const remove = async (notification) => {
    if (!window.confirm(`Delete “${notification.title}” from notification history?`)) return;
    try {
      await deleteAdminNotification(notification.id);
      setNotifications(current => current.filter(item => item.id !== notification.id));
      window.dispatchEvent(new Event(ADMIN_NOTIFICATIONS_EVENT));
      onToast('Notification deleted');
    } catch { onToast('Failed to delete notification'); }
  };

  const visible = filter === 'unread' ? notifications.filter(item => !item.is_read) : notifications;
  const unread = notifications.filter(item => !item.is_read).length;

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-va-bg px-3 py-4 sm:px-6 sm:py-6">
      <section className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-va-purple">Activity centre</p>
            <h2 className="mt-1 font-outfit text-2xl font-bold text-va-text">Notification history</h2>
            <p className="mt-1 text-sm text-va-text3">Review account activity, customer responses, and order events.</p>
          </div>
          <button type="button" disabled={!unread} onClick={markAllRead} className="rounded-lg border border-va-border bg-white px-4 py-2 text-xs font-bold text-va-purple transition hover:border-va-purple disabled:cursor-not-allowed disabled:opacity-45">Mark all as read</button>
        </div>

        <div className="overflow-hidden rounded-va border border-va-border bg-white shadow-va">
          <div className="flex items-center justify-between gap-3 border-b border-va-border px-4 py-3">
            <div className="flex gap-2">
              {['all', 'unread'].map(value => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${filter === value ? 'bg-grad text-white' : 'border border-va-border bg-white text-va-text3'}`}>{value}</button>)}
            </div>
            <span className="text-xs font-semibold text-va-text3">{unread} unread · {notifications.length} total</span>
          </div>

          {loading ? <div className="px-5 py-14 text-center text-sm text-va-text3">Loading notifications…</div> : visible.length === 0 ? <div className="px-5 py-14 text-center"><Icon name="bell" size={28} className="mx-auto text-va-border2"/><p className="mt-3 text-sm font-semibold text-va-text3">{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p></div> : (
            <div className="divide-y divide-va-border">
              {visible.map(notification => (
                <article key={notification.id} className={`flex gap-3 px-4 py-4 transition-colors sm:px-5 ${notification.is_read ? 'bg-white' : 'bg-blue-50/50'}`}>
                  <button type="button" aria-label={`Mark ${notification.title} as read`} onClick={() => markRead(notification)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.is_read ? 'bg-va-bg text-va-text3' : 'bg-grad text-white shadow-sm'}`}>
                    <Icon name={iconForType(notification.type)} size={19}/>
                  </button>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => markRead(notification)}>
                    <span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-va-text">{notification.title}</strong>{!notification.is_read && <span className="rounded-full bg-va-blue px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">New</span>}</span>
                    <span className="mt-1 block text-xs leading-5 text-va-text2">{notification.message}</span>
                    <span className="mt-1.5 block text-[11px] text-va-text3">{formatTime(notification.createdAt)}{notification.order_id ? ` · Order #${notification.order_id.slice(0, 8)}` : ''}</span>
                  </button>
                  <button type="button" aria-label={`Delete ${notification.title}`} title="Delete notification" onClick={() => remove(notification)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-va-danger transition hover:bg-va-danger-bg"><Icon name="trash" size={16}/></button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
