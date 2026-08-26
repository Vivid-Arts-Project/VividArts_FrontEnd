import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icon';
import CustomerHeader from '../components/CustomerHeader';
import OrderTracker from './OrderTracker';
import { startVisiblePolling } from '../utils/polling';
import { saveBlob } from '../utils/download';

const STATUS = {
  payment_pending: ['Payment incomplete', 'Complete the deposit payment to confirm this order.'],
  in_queue: ['Order received', 'Your order is in the artist’s queue.'],
  sketching: ['Sketching', 'The artist is working on your portrait.'],
  waiting_for_feedback: ['Proof ready', 'Your proof is ready for review.'],
  revision_requested: ['Revision requested', 'Your requested changes were sent to the artist.'],
  approved: ['Approved', 'You approved the proof. Please pay any remaining balance.'],
  finished: ['Approved', 'You approved the proof. Please pay any remaining balance.'],
  payment_finished: ['Payment finished', 'Your full payment has been received.'],
  framed: ['Framed', 'Your portrait has been framed.'],
  done: ['Completed', 'Your order has been completed.'],
  cancelled: ['Cancelled', 'This order was cancelled by the studio. Its payment and activity history remains available.'],
};

const FRAME_LABELS = {
  without_frame: 'Without frame',
  plastic_frame: 'Classic frame',
  wooden_frame: 'Premium frame',
};

const formatDate = (value, includeTime = false) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-LK', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' });
};

const formatMoney = (amount, currency = 'LKR') => new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: currency || 'LKR',
  maximumFractionDigits: 2,
}).format(Number(amount || 0));

function Detail({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-white/[.08] bg-white/[.035] px-4 py-3">
      <dt className="text-[11px] font-bold uppercase tracking-[.12em] text-white/40">{label}</dt>
      <dd className={`mt-1.5 break-words text-sm font-semibold ${accent ? 'text-[#bdb3ff]' : 'text-white/85'}`}>{value || '—'}</dd>
    </div>
  );
}

function DeleteOrderModal({ order, busy, onClose, onConfirm }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[1000] isolate flex items-center justify-center bg-[#05040d]/80 px-4 py-8 backdrop-blur-md" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-order-title" className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] border border-red-300/20 bg-gradient-to-br from-[#21152c] via-[#141126] to-[#101b2b] p-6 shadow-[0_35px_100px_rgba(0,0,0,.65)] sm:p-7">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/15 text-red-200">
          <Icon name="trash" size={24}/>
        </div>
        <h2 id="delete-order-title" className="mt-5 text-2xl font-extrabold">Delete incomplete order?</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Order <strong className="text-white/85">#{order.id.slice(0, 8)}</strong> has not been paid. Deleting it will permanently remove the saved order and its uploaded reference photos.
        </p>
        <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" disabled={busy} onClick={onClose} className="order-2 inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/15 bg-white/[.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[.11] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a99bff] disabled:cursor-not-allowed disabled:opacity-50 sm:order-1">Keep order</button>
          <button type="button" disabled={busy} onClick={onConfirm} className="order-1 inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-300/25 bg-red-500 px-4 py-3 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(239,68,68,.2)] transition hover:-translate-y-0.5 hover:bg-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-wait disabled:opacity-50 sm:order-2"><Icon name="trash" size={17}/>{busy ? 'Deleting…' : 'Delete order'}</button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ order, onClose, onSaved }) {
  const existing = order.review;
  const [rating, setRating] = useState(existing?.rating || 5);
  const [title, setTitle] = useState(existing?.title || '');
  const [comment, setComment] = useState(existing?.comment || '');
  const [allowPublicImage, setAllowPublicImage] = useState(Boolean(existing?.allowPublicImage));
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(existing?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const selectImage = event => {
    const selected = event.target.files?.[0] || null;
    setImage(selected);
    setImagePreview(selected ? URL.createObjectURL(selected) : existing?.imageUrl || '');
  };

  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const result = await api.saveOrderReview(order.id, { rating, title, comment, allowPublicImage }, image, Boolean(existing));
      onSaved(result.message);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your review.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing || saving || !window.confirm('Delete this review permanently?')) return;
    setSaving(true);
    setError('');
    try {
      const result = await api.deleteOrderReview(order.id);
      onSaved(result.message);
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete your review.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#05040d]/80 px-4 py-8 backdrop-blur-md" onMouseDown={event => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <form onSubmit={submit} className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/15 bg-gradient-to-br from-[#191638] via-[#111025] to-[#102038] p-5 shadow-[0_35px_100px_rgba(0,0,0,.65)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#a99bff]">Verified purchase</p><h2 className="mt-2 text-2xl font-extrabold">{existing ? 'Edit your review' : 'How was your portrait?'}</h2><p className="mt-1 text-xs text-white/45">Order #{order.id.slice(0, 8)} · {order.paperSize} portrait</p></div>
          <button type="button" disabled={saving} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.06] text-white/60 transition hover:bg-white/10 hover:text-white"><Icon name="close" size={19}/></button>
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.045] p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">Your rating</p>
          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" aria-label={`${star} stars`} onClick={() => setRating(star)} className={`transition duration-200 hover:-translate-y-1 hover:scale-110 ${star <= rating ? 'text-amber-300' : 'text-white/15'}`}><Icon name="rating" size={34}/></button>)}
          </div>
          <p className="mt-2 text-sm font-bold text-amber-100">{['', 'Needs improvement', 'Fair', 'Good', 'Great', 'Absolutely loved it'][rating]}</p>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold text-white/65">Review title<input required minLength={3} maxLength={120} value={title} onChange={event => setTitle(event.target.value)} placeholder="Absolutely beautiful work!" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#9b8df3]/60"/></label>
          <label className="text-xs font-bold text-white/65">Tell us about your experience<textarea required minLength={10} maxLength={2000} rows={5} value={comment} onChange={event => setComment(event.target.value)} placeholder="How did you feel about the artwork, communication and delivery?" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#9b8df3]/60"/></label>
          <label className="group cursor-pointer overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[.035] transition hover:border-[#9b8df3]/50 hover:bg-white/[.055]">
            {imagePreview && <span className="flex h-64 w-full items-center justify-center border-b border-white/10 bg-black/20 p-3"><img src={imagePreview} alt="Selected review preview" className="h-full w-full rounded-xl object-contain"/></span>}
            <span className="flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7868d8]/20 text-[#bdb3ff]"><Icon name="upload" size={20}/></span>
              <span className="min-w-0 flex-1"><strong className="block break-all text-sm">{image ? image.name : existing?.imageUrl ? 'Choose a different review photo' : 'Add a photo (optional)'}</strong><span className="mt-1 block text-[11px] text-white/35">JPG, PNG or WebP · Maximum 5 MB</span></span>
              <span className="rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-[10px] font-bold text-white/55">{imagePreview ? 'Change' : 'Choose'}</span>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={selectImage}/>
          </label>
          {(image || existing?.imageUrl) && <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs leading-5 text-white/55"><input type="checkbox" checked={allowPublicImage} onChange={event => setAllowPublicImage(event.target.checked)} className="mt-1 accent-[#8b5cf6]"/><span>I allow Vivid Arts to display this photo with my approved review on the public website.</span></label>}
        </div>

        {existing?.status === 'approved' && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-100">Editing an approved review will send it back to the administrator for approval.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {existing ? <button type="button" disabled={saving} onClick={remove} className="rounded-xl border border-red-400/25 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/10 disabled:opacity-50">Delete review</button> : <span/>}
          <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-6 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(99,102,241,.3)] transition hover:-translate-y-0.5 disabled:opacity-50">{saving ? 'Saving review…' : existing ? 'Save & resubmit' : 'Submit review'}</button>
        </div>
      </form>
    </div>
  );
}

export default function MyOrdersPage({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewing, setReviewing] = useState('');
  const [messageDrafts, setMessageDrafts] = useState({});
  const [sendingMessage, setSendingMessage] = useState('');
  const [revisionOrderId, setRevisionOrderId] = useState('');
  const [payingBalance, setPayingBalance] = useState('');
  const [resumingPayment, setResumingPayment] = useState('');
  const [reviewOrder, setReviewOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const loadOrders = useCallback(async () => {
    setError('');
    try {
      setOrders(await api.getMyOrders());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => api.getMyOrders()
      .then(data => { if (active) { setOrders(data); setError(''); } })
      .catch(loadError => { if (active && loading) setError(loadError.message || 'Unable to load your orders.'); })
      .finally(() => { if (active) setLoading(false); });
    const stopPolling = startVisiblePolling(refresh, 5_000);
    return () => { active = false; stopPolling(); };
    // `loading` is intentionally omitted so polling does not restart after the first response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviewProof = async (order, action) => {
    if (action === 'revision') {
      setRevisionOrderId(order.id);
      setNotice('');
      window.setTimeout(() => {
        const el = document.getElementById(`revision-box-${order.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const textarea = document.getElementById(`revision-input-${order.id}`);
        if (textarea) {
          textarea.focus();
        }
      }, 60);
      return;
    }
    setReviewing(order.id);
    setNotice('');
    try {
      const result = await api.reviewOrderProof(order.id, action);
      setNotice(`${result.message}. The full order price and remaining balance are shown below.`);
      await loadOrders();
      window.requestAnimationFrame(() => document.getElementById(`payment-${order.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    } catch (reviewError) {
      setNotice(reviewError.message || 'Unable to submit your review.');
    } finally {
      setReviewing('');
    }
  };

  const sendOrderMessage = async (order) => {
    const message = messageDrafts[order.id]?.trim();
    if (!message || sendingMessage) return;

    setSendingMessage(order.id);
    setNotice('');
    try {
      if (revisionOrderId === order.id) {
        const result = await api.reviewOrderProof(order.id, 'revision', message);
        setNotice(result.message);
        setRevisionOrderId('');
      } else {
        await api.sendOrderMessage(order.id, message);
        setNotice('Message sent to the artist.');
      }
      setMessageDrafts(drafts => ({ ...drafts, [order.id]: '' }));
      await loadOrders();
    } catch (messageError) {
      setNotice(messageError.message || 'Unable to send your message.');
    } finally {
      setSendingMessage('');
    }
  };

  const downloadInvoice = async (providerOrderId) => {
    setNotice('');
    try {
      const blob = await api.downloadInvoice(providerOrderId);
      saveBlob(blob, `invoice-${providerOrderId}.pdf`);
    } catch (downloadError) {
      setNotice(downloadError.message || 'Unable to download the invoice.');
    }
  };

  const payBalance = async (order) => {
    if (payingBalance) return;
    setPayingBalance(order.id);
    setNotice('');
    try {
      const checkout = await api.createBalanceCheckout(order.id);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkout.checkoutUrl;
      Object.entries(checkout.checkoutFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (paymentError) {
      setNotice(paymentError.message || 'Unable to start the balance payment.');
      setPayingBalance('');
    }
  };

  const resumePayment = async (order) => {
    if (resumingPayment) return;
    setResumingPayment(order.id);
    setNotice('');
    try {
      const checkout = await api.resumeOrderCheckout(order.id);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkout.checkoutUrl;
      Object.entries(checkout.checkoutFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (paymentError) {
      setNotice(paymentError.message || 'Unable to continue the payment.');
      setResumingPayment('');
    }
  };

  const removeIncompleteOrder = async () => {
    if (!deleteOrder || deletingOrder) return;
    setDeletingOrder(true);
    setNotice('');
    try {
      const result = await api.deleteIncompleteOrder(deleteOrder.id);
      setDeleteOrder(null);
      setNotice(result.message || 'Incomplete order deleted.');
      window.dispatchEvent(new CustomEvent('vividarts:pending-orders', { detail: { delta: -1 } }));
      await loadOrders();
    } catch (deleteError) {
      setNotice(deleteError.message || 'Unable to delete this order.');
    } finally {
      setDeletingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090816] font-sans text-white">
      <CustomerHeader onNavigate={onNavigate} active="orders"/>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a99bff]">Order history</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-.025em] sm:text-4xl">Every portrait, in one place</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">View your order status, portrait choices, payment details, proofs, reference photos, and updates from the artist.</p>
          </div>
          {!loading && <span className="shrink-0 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-sm font-bold text-white/60">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>}
        </div>

        {notice && <div className="mb-5 rounded-xl border border-[#8c7cf0]/30 bg-[#7666d8]/15 px-4 py-3 text-sm text-[#d8d2ff]">{notice}</div>}
        {loading && <div className="rounded-[24px] border border-white/10 bg-white/[.04] px-6 py-16 text-center text-white/60">Loading your orders…</div>}
        {!loading && error && <div className="rounded-[24px] border border-red-300/20 bg-red-400/10 px-6 py-10 text-center"><p className="text-sm text-red-100">{error}</p><button type="button" onClick={loadOrders} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#17142d]">Try again</button></div>}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[.03] px-6 py-16 text-center">
            <Icon name="orders" size={34} className="mx-auto text-[#a99bff]"/>
            <h3 className="mt-4 text-xl font-bold">No orders yet</h3>
            <p className="mt-2 text-sm text-white/50">Your commissioned portraits will appear here.</p>
            <button type="button" onClick={() => onNavigate('commission')} className="mt-5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-5 py-3 text-sm font-bold">Commission a portrait</button>
          </div>
        )}

        <div className="grid gap-6">
          {orders.map((order) => {
            const displayStatus = order.paymentStatus === 'payment_pending' ? 'payment_pending' : order.status;
            const [statusLabel, statusHelp] = STATUS[displayStatus] || [String(displayStatus || 'Unknown').replaceAll('_', ' '), 'The artist updated this order.'];
            const paymentPending = order.paymentStatus === 'payment_pending';
            return (
              <article key={order.id} className={`overflow-hidden rounded-[26px] bg-gradient-to-br from-[#151333] via-[#111025] to-[#102037] shadow-[0_22px_60px_rgba(0,0,0,.28)] ${paymentPending ? 'border border-red-400/55' : 'border border-white/[.1]'}`}>
                <div className="flex flex-col gap-4 border-b border-white/[.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.15em] text-white/40">Placed {formatDate(order.createdAt)}</p>
                    <h3 className="mt-1 break-all font-mono text-sm font-bold sm:text-lg">Order #{order.id}</h3>
                  </div>
                  <div className="sm:text-right">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${paymentPending ? 'border-red-400/40 bg-red-500/15 text-red-200' : 'border-[#9b8df3]/25 bg-[#7868d8]/15 text-[#cec7ff]'}`}>{paymentPending && <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.8)]"/>}{statusLabel}</span>
                    <p className="mt-1.5 text-xs text-white/45">{statusHelp}</p>
                  </div>
                </div>

                <div className="border-b border-white/[.07] px-5 py-4 sm:px-7 sm:py-5">
                  <OrderTracker
                    status={order.status}
                    workflowStatus={order.workflowStatus}
                    isPaymentPending={paymentPending}
                    frameType={order.frameType}
                  />
                </div>

                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="min-w-0">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Portrait & delivery</h4>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <Detail label="Paper size" value={order.paperSize}/>
                      <Detail label="Subjects" value={`${order.subjectCount || 0} ${order.subjectCount === 1 ? 'person' : 'people'}`}/>
                      <Detail label="Frame" value={FRAME_LABELS[order.frameType] || String(order.frameType || '').replaceAll('_', ' ')}/>
                      <Detail label="Delivery" value={order.pickupOption === 'courier' ? 'Courier delivery' : 'Customer pickup'}/>
                      <Detail label="Order type" value={order.isUrgent ? 'Urgent order' : order.isScheduled ? 'Scheduled order' : 'Standard order'}/>
                      <Detail label="Requested date" value={order.isUrgent ? formatDate(order.urgentDeadline) : order.isScheduled ? formatDate(order.scheduledDate) : 'Not applicable'}/>
                      <Detail label="Live queue position" value={order.queuePosition ? `#${order.queuePosition} · updates automatically` : order.workflowStatus === 'done' ? 'Completed' : order.workflowStatus === 'cancelled' ? 'Cancelled' : order.paymentStatus === 'payment_pending' ? 'Waiting for deposit' : 'Currently in production'} accent={Boolean(order.queuePosition)}/>
                      {order.estimatedCompletionAt && <Detail label="Estimated completion" value={formatDate(order.estimatedCompletionAt)} accent/>}
                    </dl>
                    {order.deliveryAddress && <div className="mt-3"><Detail label="Delivery address" value={order.deliveryAddress}/></div>}
                    {order.artistLocation && <div className="mt-3"><Detail label="Pickup location" value={order.artistLocation}/></div>}
                    {order.customerNote && <div className="mt-3"><Detail label="Your instructions" value={order.customerNote}/></div>}
                    {order.workflowStatus === 'cancelled' && <div className="mt-3"><Detail label="Cancellation reason" value={order.cancellationReason || 'Contact the studio for details.'}/></div>}

                    <h4 id={`payment-${order.id}`} className="mb-3 mt-6 scroll-mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Payment</h4>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Detail label="Full order price" value={formatMoney(order.totalPrice, order.currency)} accent/>
                      <Detail label="Amount paid" value={formatMoney(order.amountPaid, order.currency)}/>
                      <Detail label="Balance due" value={formatMoney(order.balanceDue, order.currency)}/>
                      <Detail label="Payment plan" value={order.paymentType === 'full' ? 'Paid in full' : 'Advance payment'}/>
                    </dl>
                    {(order.payments || []).map((payment, index) => {
                      const isDeposit = index === 0 && (order.payments.length > 1 || payment.paymentType === 'advance' || order.paymentType === 'advance');
                      const paymentLabel = isDeposit ? 'Advance' : 'Total';
                      const hasMultiplePayments = (order.payments || []).length > 1;
                      return (
                        <div key={payment.id} className="mt-3">
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[.08] bg-[#0b0a1b]/60 px-4 py-3 text-xs text-white/60">
                            <span><strong className="text-white/85">{formatMoney(payment.amount, payment.currency)}</strong> · <span className="font-semibold text-white/75">{paymentLabel}</span> · <span className="capitalize">{payment.status}</span></span>
                            <span>{formatDate(payment.createdAt, true)}{payment.transactionId ? ` · Ref ${payment.transactionId}` : ''}</span>
                          </div>
                          {payment.status === 'completed' && payment.providerOrderId && (
                            <div className="mt-2 flex">
                              <button
                                type="button"
                                onClick={() => downloadInvoice(payment.providerOrderId)}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[.11]"
                              >
                                <Icon name="download" size={15}/> {hasMultiplePayments ? (isDeposit ? 'Download deposit invoice' : 'Download final invoice') : 'Download invoice'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="mt-3 flex flex-wrap items-center gap-2.5">
                      {paymentPending && order.workflowStatus !== 'cancelled' && (
                        <button type="button" disabled={resumingPayment === order.id} onClick={() => resumePayment(order)} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(239,68,68,.25)] transition hover:bg-red-400 disabled:opacity-50">
                          <Icon name="payments" size={16}/>{resumingPayment === order.id ? 'Opening payment…' : `Complete payment · ${formatMoney(order.payments?.[0]?.amount, order.currency)}`}
                        </button>
                      )}
                      {['approved', 'finished'].includes(order.workflowStatus || order.status) && order.balanceDue > 0 && (
                        <button
                          type="button"
                          disabled={payingBalance === order.id}
                          onClick={() => payBalance(order)}
                          className="pay-balance-pulse inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-5 py-2.5 text-xs font-extrabold text-[#042416] transition hover:brightness-110 disabled:opacity-50 disabled:animate-none"
                        >
                          <Icon name="payments" size={16}/>
                          {payingBalance === order.id ? 'Opening payment…' : `Pay balance · ${formatMoney(order.balanceDue, order.currency)}`}
                        </button>
                      )}
                    </div>

                    {(order.workflowStatus || order.status) === 'done' && (
                      <section className="mt-6 rounded-2xl border border-[#8f80e8]/20 bg-gradient-to-br from-[#7666d8]/12 to-[#2b8fe0]/8 p-4 sm:p-5">
                        {order.review ? <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><div className="flex gap-0.5 text-amber-300">{[1,2,3,4,5].map(star => <Icon key={star} name="rating" size={15} className={star <= order.review.rating ? '' : 'text-white/15'}/>)}</div><span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${order.review.status === 'approved' ? 'bg-emerald-400/15 text-emerald-200' : order.review.status === 'rejected' ? 'bg-red-400/15 text-red-200' : 'bg-amber-300/15 text-amber-100'}`}>{order.review.status}</span><span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[9px] font-bold text-white/50">Verified purchase</span></div><h5 className="mt-3 text-base font-bold">{order.review.title}</h5><p className="mt-1 text-xs leading-5 text-white/55">{order.review.comment}</p>{order.review.adminReply && <p className="mt-3 rounded-xl bg-white/[.05] px-3 py-2.5 text-xs leading-5 text-white/60"><strong className="text-[#bdb3ff]">Vivid Arts:</strong> {order.review.adminReply}</p>}</div>
                          <button type="button" onClick={() => setReviewOrder(order)} className="shrink-0 rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-xs font-bold transition hover:bg-white/[.1]">Edit review</button>
                        </div> : <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-amber-300"><Icon name="rating" size={20}/><strong className="text-sm text-white">Enjoying your portrait?</strong></div><p className="mt-1 text-xs leading-5 text-white/45">Share your verified experience and help future customers.</p></div><button type="button" onClick={() => setReviewOrder(order)} className="shrink-0 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-5 py-3 text-xs font-extrabold text-white shadow-[0_10px_25px_rgba(99,102,241,.25)] transition hover:-translate-y-0.5">Leave a review</button></div>}
                      </section>
                    )}
                  </div>

                  <aside className="min-w-0 rounded-2xl border border-white/[.08] bg-[#0a0918]/55 p-4 sm:p-5">
                    <h4 className="text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Proof & updates</h4>
                    {paymentPending ? (
                      <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-center">
                        <Icon name="payments" size={24} className="mx-auto text-red-300"/>
                        <p className="mt-3 text-sm font-bold text-red-100">Waiting for payment</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">Proof updates and artist chat will become available after the deposit is confirmed.</p>
                      </div>
                    ) : <>{order.proof ? (
                      <div className="mt-3">
                        <a href={order.proof.url} target="_blank" rel="noreferrer" className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2"><img src={order.proof.url} alt={`Proof for order ${order.id}`} className="h-full w-full object-contain"/></a>
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/50"><span>Proof v{order.proof.version}</span><span className="capitalize">{String(order.proof.reviewStatus).replaceAll('_', ' ')}</span></div>
                        <p className="mt-1 text-[11px] text-white/35">Uploaded {formatDate(order.proof.uploadedAt, true)}{order.proof.reviewedAt ? ` · Reviewed ${formatDate(order.proof.reviewedAt, true)}` : ''}</p>
                        {order.proof.artistNote && <p className="mt-3 rounded-xl bg-white/[.05] px-3 py-2.5 text-xs leading-5 text-white/65">Artist note: {order.proof.artistNote}</p>}
                        {order.proof.revisionNote && <p className="mt-3 rounded-xl bg-white/[.05] px-3 py-2.5 text-xs leading-5 text-white/65">Revision request: {order.proof.revisionNote}</p>}
                        {order.status === 'waiting_for_feedback' && <><div className={`mt-3 grid gap-2 ${order.proof.revisionRequestsRemaining > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}><button type="button" disabled={reviewing === order.id || sendingMessage === order.id} onClick={() => reviewProof(order, 'approve')} className="rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-extrabold text-[#062b1b] disabled:opacity-50">Approve</button>{order.proof.revisionRequestsRemaining > 0 && <button type="button" disabled={reviewing === order.id || sendingMessage === order.id} onClick={() => reviewProof(order, 'revision')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold disabled:opacity-50 ${revisionOrderId === order.id ? 'border-[#9b8df3]/60 bg-[#7868d8]/25 text-[#ddd8ff]' : 'border-white/15 bg-white/[.06]'}`}>Request changes</button>}</div><p className="mt-2 text-[10px] leading-4 text-white/35">{order.proof.revisionRequestsRemaining > 0 ? `${order.proof.revisionRequestsRemaining} of 2 included revision requests remaining` : 'Both included revision requests have been used. Contact the studio if more changes are needed.'}</p></>}
                      </div>
                    ) : <p className="mt-3 rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs leading-5 text-white/40">No proof has been uploaded yet.</p>}

                    {order.referencePhotos?.length > 0 && <><h5 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[.13em] text-white/45">Reference photos</h5><div className="grid grid-cols-3 gap-2">{order.referencePhotos.map((photo, index) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-1"><img src={photo.url} alt={photo.fileName || `Reference ${index + 1}`} className="h-full w-full object-contain"/></a>)}</div></>}

                    <h5 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[.13em] text-white/45">Chat</h5>
                    <div className="flex max-h-80 min-h-48 flex-col gap-2 overflow-y-auto rounded-xl bg-black/15 p-2.5">
                      {order.messages?.length ? order.messages.map(message => {
                        const isCustomer = message.senderType === 'customer';
                        const isRevision = message.senderType === 'system' && message.message.toLowerCase().includes('requested changes');
                        const isSystem = message.senderType === 'system' && !isRevision;
                        return (
                          <div key={message.id} className={`max-w-[85%] ${isCustomer ? 'self-end' : isSystem || isRevision ? 'self-center' : 'self-start'}`}>
                            <div className={`rounded-2xl px-3 py-2.5 text-xs leading-5 ${isCustomer ? 'rounded-br-md bg-[#6657c7] text-white' : isRevision ? 'border border-amber-300/25 bg-amber-400/15 text-amber-100' : isSystem ? 'border border-white/10 bg-white/[.06] text-white/55' : 'rounded-bl-md bg-[#173452] text-[#dcecff]'}`}>{message.message}</div>
                            <div className={`mt-1 text-[9px] uppercase tracking-wide text-white/30 ${isCustomer ? 'text-right' : isSystem || isRevision ? 'text-center' : ''}`}>{isCustomer ? 'You' : isRevision ? 'Revision request' : isSystem ? 'Order update' : 'Artist'} · {formatDate(message.createdAt, true)}</div>
                          </div>
                        );
                      }) : <p className="m-auto text-xs text-white/35">No messages for this order yet.</p>}
                    </div>
                    {order.workflowStatus !== 'cancelled' && <div id={`revision-box-${order.id}`} className="mt-3 border-t border-white/[.08] pt-3 scroll-mt-6">
                      {revisionOrderId === order.id && (
                        <div className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-[#9b8df3]/25 bg-[#7868d8]/15 px-3 py-2 text-[11px] leading-4 text-[#d8d2ff]">
                          <span>Describe the proof changes you need. Submitting will notify the artist and mark the proof for revision.</span>
                          <button type="button" onClick={() => setRevisionOrderId('')} className="shrink-0 text-white/50 hover:text-white" aria-label="Cancel revision request">×</button>
                        </div>
                      )}
                      <textarea
                        id={`revision-input-${order.id}`}
                        rows={3}
                        maxLength={revisionOrderId === order.id ? 1000 : 2000}
                        value={messageDrafts[order.id] || ''}
                        onChange={event => setMessageDrafts(drafts => ({ ...drafts, [order.id]: event.target.value }))}
                        onKeyDown={event => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            sendOrderMessage(order);
                          }
                        }}
                        placeholder={revisionOrderId === order.id ? 'Describe the changes you need…' : 'Message the artist about this order…'}
                        className="w-full resize-y rounded-xl border border-white/10 bg-white/[.045] px-3 py-2.5 text-xs leading-5 text-white outline-none placeholder:text-white/30 focus:border-[#9b8df3]/60"
                      />
                      <button
                        type="button"
                        disabled={!messageDrafts[order.id]?.trim() || sendingMessage === order.id}
                        onClick={() => sendOrderMessage(order)}
                        className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-3 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {sendingMessage === order.id ? 'Sending…' : revisionOrderId === order.id ? 'Submit change request' : 'Send message'}
                      </button>
                    </div>}
                    </>}
                  </aside>
                </div>
                <div className="flex flex-col gap-3 border-t border-white/[.07] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-white/35"><span>Last updated {formatDate(order.updatedAt, true)}</span>{order.approvedAt && <span>Approved {formatDate(order.approvedAt, true)}</span>}{order.completedAt && <span>Completed {formatDate(order.completedAt, true)}</span>}</div>
                  {paymentPending && order.workflowStatus !== 'cancelled' && <button type="button" onClick={() => setDeleteOrder(order)} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-200 transition hover:border-red-300/45 hover:bg-red-500/20 sm:self-auto"><Icon name="trash" size={14}/> Delete incomplete order</button>}
                </div>
              </article>
            );
          })}
        </div>
      </main>
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSaved={async message => {
            setReviewOrder(null);
            setNotice(message);
            await loadOrders();
          }}
        />
      )}
      <DeleteOrderModal order={deleteOrder} busy={deletingOrder} onClose={() => { if (!deletingOrder) setDeleteOrder(null); }} onConfirm={removeIncompleteOrder}/>
    </div>
  );
}
