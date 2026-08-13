import { useCallback, useEffect, useState } from 'react';
import { getOrder } from '../api/adminApi';
import { useAuth } from '../context/useAuth';
import { useNavigate } from '../router';
import { DetailPanel } from './OrdersPage';

export default function OrderManagePage({ orderId, onToast }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load the route's order when the page opens
    load();
  }, [load]);

  if (loading) return <div className="flex flex-1 items-center justify-center text-sm text-va-text3">Loading order…</div>;
  if (!order) return <div className="flex flex-1 flex-col items-center justify-center gap-3"><div className="text-sm text-va-text3">This order could not be loaded.</div><button className="btn btn-fill" onClick={() => navigate('/admin')}>Back to orders</button></div>;

  return <DetailPanel order={order} businessAddress={admin?.businessAddress || ''} onClose={() => navigate('/admin')} onStatusSaved={load} onToast={onToast}/>;
}
