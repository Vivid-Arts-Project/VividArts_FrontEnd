import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icon';

const STATUS = {
  in_queue: ['Order received', 'Your order is in the artist’s queue.'],
  sketching: ['Sketching', 'The artist is working on your portrait.'],
  waiting_for_feedback: ['Proof ready', 'Your proof is ready for review.'],
  revision_requested: ['Revision requested', 'Your requested changes were sent to the artist.'],
  approved: ['Approved & finished', 'Your portrait is approved and finished. Please pay any remaining balance.'],
  finished: ['Approved & finished', 'Your portrait is approved and finished. Please pay any remaining balance.'],
  framed: ['Framed', 'Your portrait has been framed.'],
  shipped: ['Shipped / ready', 'Your order is on its way or ready for pickup.'],
  done: ['Completed', 'Your order has been completed.'],
};

const FRAME_LABELS = {
  without_frame: 'Without frame',
  plastic_frame: 'Classic frame',
  wooden_frame: 'Premium wooden frame',
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
    refresh();
    const interval = window.setInterval(refresh, 5_000);
    return () => { active = false; window.clearInterval(interval); };
    // `loading` is intentionally omitted so polling does not restart after the first response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviewProof = async (order, action) => {
    if (action === 'revision') {
      setRevisionOrderId(order.id);
      setNotice('');
      return;
    }
    setReviewing(order.id);
    setNotice('');
    try {
      const result = await api.reviewOrderProof(order.id, action);
      setNotice(result.message);
      await loadOrders();
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
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${providerOrderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
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

  return (
    <div className="min-h-screen bg-[#090816] font-sans text-white">
      <header className="border-b border-white/10 bg-[#0d0b1f]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
          <button type="button" onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white">
            <Icon name="arrowLeft" size={18}/> Home
          </button>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#a99bff]">Customer account</p>
            <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">My Orders</h1>
          </div>
        </div>
      </header>

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
            const [statusLabel, statusHelp] = STATUS[order.status] || [String(order.status || 'Unknown').replaceAll('_', ' '), 'The artist updated this order.'];
            const completedPayment = order.payments?.find(payment => payment.status === 'completed');
            return (
              <article key={order.id} className="overflow-hidden rounded-[26px] border border-white/[.1] bg-gradient-to-br from-[#151333] via-[#111025] to-[#102037] shadow-[0_22px_60px_rgba(0,0,0,.28)]">
                <div className="flex flex-col gap-4 border-b border-white/[.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.15em] text-white/40">Placed {formatDate(order.createdAt)}</p>
                    <h3 className="mt-1 break-all font-mono text-sm font-bold sm:text-lg">Order #{order.id}</h3>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-flex rounded-full border border-[#9b8df3]/25 bg-[#7868d8]/15 px-3 py-1.5 text-xs font-bold text-[#cec7ff]">{statusLabel}</span>
                    <p className="mt-1.5 text-xs text-white/45">{statusHelp}</p>
                  </div>
                </div>

                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="min-w-0">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Portrait & delivery</h4>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <Detail label="Paper size" value={order.paperSize}/>
                      <Detail label="Subjects" value={`${order.subjectCount || 0} ${order.subjectCount === 1 ? 'person' : 'people'}`}/>
                      <Detail label="Frame" value={FRAME_LABELS[order.frameType] || String(order.frameType || '').replaceAll('_', ' ')}/>
                      <Detail label="Delivery" value={order.pickupOption === 'courier' ? 'Courier delivery' : 'Customer pickup'}/>
                      <Detail label="Urgency" value={order.isUrgent ? 'Urgent order' : 'Standard order'}/>
                      <Detail label="Requested deadline" value={order.isUrgent ? formatDate(order.urgentDeadline) : 'Not applicable'}/>
                    </dl>
                    {order.deliveryAddress && <div className="mt-3"><Detail label="Delivery address" value={order.deliveryAddress}/></div>}
                    {order.artistLocation && <div className="mt-3"><Detail label="Pickup location" value={order.artistLocation}/></div>}
                    {order.customerNote && <div className="mt-3"><Detail label="Your instructions" value={order.customerNote}/></div>}

                    <h4 className="mb-3 mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Payment</h4>
                    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Detail label="Order total" value={formatMoney(order.totalPrice, order.currency)} accent/>
                      <Detail label="Amount paid" value={formatMoney(order.amountPaid, order.currency)}/>
                      <Detail label="Balance due" value={formatMoney(order.balanceDue, order.currency)}/>
                      <Detail label="Payment plan" value={order.paymentType === 'full' ? 'Paid in full' : 'Advance payment'}/>
                    </dl>
                    {(order.payments || []).map(payment => (
                      <div key={payment.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[.08] bg-[#0b0a1b]/60 px-4 py-3 text-xs text-white/60">
                        <span><strong className="text-white/85">{formatMoney(payment.amount, payment.currency)}</strong> · {payment.method || 'Payment'} · <span className="capitalize">{payment.status}</span></span>
                        <span>{formatDate(payment.createdAt, true)}{payment.transactionId ? ` · Ref ${payment.transactionId}` : ''}</span>
                      </div>
                    ))}
                    {completedPayment?.providerOrderId && <button type="button" onClick={() => downloadInvoice(completedPayment.providerOrderId)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[.11]"><Icon name="download" size={15}/> Download invoice</button>}
                    {['approved', 'finished'].includes(order.workflowStatus || order.status) && order.balanceDue > 0 && (
                      <button type="button" disabled={payingBalance === order.id} onClick={() => payBalance(order)} className="mt-3 ml-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-[#062b1b] transition hover:bg-emerald-400 disabled:opacity-50">
                        {payingBalance === order.id ? 'Opening payment…' : `Pay balance · ${formatMoney(order.balanceDue, order.currency)}`}
                      </button>
                    )}
                  </div>

                  <aside className="min-w-0 rounded-2xl border border-white/[.08] bg-[#0a0918]/55 p-4 sm:p-5">
                    <h4 className="text-xs font-bold uppercase tracking-[.16em] text-[#aaa0f4]">Proof & updates</h4>
                    {order.proof ? (
                      <div className="mt-3">
                        <a href={order.proof.url} target="_blank" rel="noreferrer"><img src={order.proof.url} alt={`Proof for order ${order.id}`} className="max-h-72 w-full rounded-xl border border-white/10 bg-black/20 object-contain"/></a>
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/50"><span>Proof v{order.proof.version}</span><span className="capitalize">{String(order.proof.reviewStatus).replaceAll('_', ' ')}</span></div>
                        <p className="mt-1 text-[11px] text-white/35">Uploaded {formatDate(order.proof.uploadedAt, true)}{order.proof.reviewedAt ? ` · Reviewed ${formatDate(order.proof.reviewedAt, true)}` : ''}</p>
                        {order.proof.artistNote && <p className="mt-3 rounded-xl bg-white/[.05] px-3 py-2.5 text-xs leading-5 text-white/65">Artist note: {order.proof.artistNote}</p>}
                        {order.proof.revisionNote && <p className="mt-3 rounded-xl bg-white/[.05] px-3 py-2.5 text-xs leading-5 text-white/65">Revision request: {order.proof.revisionNote}</p>}
                        {order.status === 'waiting_for_feedback' && <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={reviewing === order.id || sendingMessage === order.id} onClick={() => reviewProof(order, 'approve')} className="rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-extrabold text-[#062b1b] disabled:opacity-50">Approve</button><button type="button" disabled={reviewing === order.id || sendingMessage === order.id} onClick={() => reviewProof(order, 'revision')} className={`rounded-xl border px-3 py-2.5 text-xs font-bold disabled:opacity-50 ${revisionOrderId === order.id ? 'border-[#9b8df3]/60 bg-[#7868d8]/25 text-[#ddd8ff]' : 'border-white/15 bg-white/[.06]'}`}>Request changes</button></div>}
                      </div>
                    ) : <p className="mt-3 rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs leading-5 text-white/40">No proof has been uploaded yet.</p>}

                    {order.referencePhotos?.length > 0 && <><h5 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[.13em] text-white/45">Reference photos</h5><div className="grid grid-cols-3 gap-2">{order.referencePhotos.map((photo, index) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer"><img src={photo.url} alt={photo.fileName || `Reference ${index + 1}`} className="aspect-square w-full rounded-lg border border-white/10 object-cover"/></a>)}</div></>}

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
                    <div className="mt-3 border-t border-white/[.08] pt-3">
                      {revisionOrderId === order.id && (
                        <div className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-[#9b8df3]/25 bg-[#7868d8]/15 px-3 py-2 text-[11px] leading-4 text-[#d8d2ff]">
                          <span>Describe the proof changes you need. Submitting will notify the artist and mark the proof for revision.</span>
                          <button type="button" onClick={() => setRevisionOrderId('')} className="shrink-0 text-white/50 hover:text-white" aria-label="Cancel revision request">×</button>
                        </div>
                      )}
                      <textarea
                        rows={3}
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
                    </div>
                  </aside>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-white/[.07] px-5 py-3 text-[11px] text-white/35 sm:px-7"><span>Last updated {formatDate(order.updatedAt, true)}</span>{order.approvedAt && <span>Approved {formatDate(order.approvedAt, true)}</span>}{order.completedAt && <span>Completed {formatDate(order.completedAt, true)}</span>}</div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
