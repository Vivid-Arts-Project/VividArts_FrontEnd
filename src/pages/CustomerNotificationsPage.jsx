import { useCallback, useEffect, useState } from 'react';
import Icon from '../components/Icon';
import CustomerHeader from '../components/CustomerHeader';
import { api } from '../api';

const EVENT_NAME = 'vividarts:customer-notifications';

const formatTime = (value) => value
  ? new Date(value).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })
  : '';

const cleanTitle = (title) => String(title || '')
  .replace(/\p{Extended_Pictographic}/gu, '')
  .replaceAll('\uFE0F', '')
  .replaceAll('\u200D', '')
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
}[status] || 'bell');

export default function CustomerNotificationsPage({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setNotifications(await api.getCustomerNotifications());
    } catch (error) {
      setNotice(error.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch persisted customer notifications on route entry
    load();
  }, [load]);

  const markRead = async (notification) => {
    if (notification.isRead) return;
    try {
      await api.markCustomerNotificationRead(notification.id);
      setNotifications(current => current.map(item => item.id === notification.id ? { ...item, isRead: true } : item));
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (error) { setNotice(error.message || 'Unable to mark notification as read.'); }
  };

  const markAllRead = async () => {
    try {
      await api.markAllCustomerNotificationsRead();
      setNotifications(current => current.map(item => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event(EVENT_NAME));
      setNotice('All notifications marked as read.');
    } catch (error) { setNotice(error.message || 'Unable to update notifications.'); }
  };

  const remove = async (notification) => {
    if (!window.confirm(`Delete “${notification.title}” from notification history?`)) return;
    try {
      await api.deleteCustomerNotification(notification.id);
      setNotifications(current => current.filter(item => item.id !== notification.id));
      window.dispatchEvent(new Event(EVENT_NAME));
      setNotice('Notification deleted.');
    } catch (error) { setNotice(error.message || 'Unable to delete notification.'); }
  };

  const unread = notifications.filter(item => !item.isRead).length;
  const visible = filter === 'unread' ? notifications.filter(item => !item.isRead) : notifications;

  return (
    <div className="min-h-screen bg-[#090816] font-sans text-white">
      <CustomerHeader onNavigate={onNavigate} active="notifications"/>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a99bff]">Activity centre</p><h2 className="mt-1 text-3xl font-bold">Notification history</h2><p className="mt-2 text-sm text-white/50">Review every update about your portraits, proofs, delivery, and account.</p></div>
          <button type="button" disabled={!unread} onClick={markAllRead} className="rounded-xl border border-white/15 bg-white/[.07] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[.12] disabled:cursor-not-allowed disabled:opacity-40">Mark all as read</button>
        </div>

        {notice && <div className="mb-4 rounded-xl border border-[#8c7cf0]/30 bg-[#7666d8]/15 px-4 py-3 text-sm text-[#d8d2ff]">{notice}</div>}

        <section className="overflow-hidden rounded-[24px] border border-white/[.1] bg-white shadow-[0_22px_60px_rgba(0,0,0,.28)] text-va-text">
          <div className="flex items-center justify-between gap-3 border-b border-va-border px-4 py-3">
            <div className="flex gap-2">{['all', 'unread'].map(value => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${filter === value ? 'bg-grad text-white' : 'border border-va-border bg-white text-va-text3'}`}>{value}</button>)}</div>
            <span className="text-xs font-semibold text-va-text3">{unread} unread · {notifications.length} total</span>
          </div>

          {loading ? <div className="px-5 py-14 text-center text-sm text-va-text3">Loading notifications…</div> : visible.length === 0 ? <div className="px-5 py-14 text-center"><Icon name="bell" size={28} className="mx-auto text-va-border2"/><p className="mt-3 text-sm font-semibold text-va-text3">{filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</p></div> : (
            <div className="divide-y divide-va-border">
              {visible.map(notification => (
                <article key={notification.id} className={`flex gap-3 px-4 py-4 transition-colors sm:px-5 ${notification.isRead ? 'bg-white' : 'bg-blue-50/50'}`}>
                  <button type="button" aria-label={`Mark ${notification.title} as read`} onClick={() => markRead(notification)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.isRead ? 'bg-va-bg text-va-text3' : 'bg-grad text-white shadow-sm'}`}><Icon name={iconForStatus(notification.status)} size={19}/></button>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => markRead(notification)}><span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{cleanTitle(notification.title)}</strong>{!notification.isRead && <span className="rounded-full bg-va-blue px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">New</span>}</span><span className="mt-1 block text-xs leading-5 text-va-text2">{notification.message}</span><span className="mt-1.5 block text-[11px] text-va-text3">{formatTime(notification.createdAt)}{notification.orderId ? ` · Order #${String(notification.orderId).slice(0, 8)}` : ''}</span></button>
                  <button type="button" aria-label={`Delete ${notification.title}`} title="Delete notification" onClick={() => remove(notification)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-va-danger transition hover:bg-va-danger-bg"><Icon name="trash" size={16}/></button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
