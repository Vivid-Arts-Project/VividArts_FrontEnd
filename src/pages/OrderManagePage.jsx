import { useCallback, useEffect, useState } from 'react';
import { deleteOrder, getOrder } from '../api/adminApi';
import { useAuth } from '../context/useAuth';
import { useNavigate } from '../router';
import { DetailPanel } from './OrdersPage';
import { CancelModal } from '../components/Modals';
import { startVisiblePolling } from '../utils/polling';

export default function OrderManagePage({ orderId, onToast }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { admin } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const response = await getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      onToast(error.response?.status === 404 ? 'Order not found' : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId, onToast]);

  useEffect(() => {
    return startVisiblePolling(load, 5_000);
  }, [load]);

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-va-text3">Loading order…</div>;
  if (!order) return <div className="flex flex-1 flex-col items-center justify-center gap-3"><div className="text-sm text-va-text3">This order could not be loaded.</div><button className="btn btn-fill" onClick={() => navigate('/admin')}>Back to orders</button></div>;

  const confirmCancel = async (reason) => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await deleteOrder(order.id, reason);
      setShowCancel(false);
      onToast('Order cancelled. Its history was retained.');
      navigate('/admin');
    } catch (error) {
      onToast(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return <>
    <DetailPanel key={`${order.id}:${order.status}`} order={order} businessAddress={admin?.businessAddress || ''} onClose={() => navigate('/admin')} onStatusSaved={load} onToast={onToast} onCancel={order.status === 'cancelled' ? undefined : () => setShowCancel(true)}/>
    {showCancel && <CancelModal order={order} busy={cancelling} onClose={() => !cancelling && setShowCancel(false)} onConfirm={confirmCancel}/>}
  </>;
}
