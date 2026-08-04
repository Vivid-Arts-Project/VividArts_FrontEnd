import { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { STATUS_MAP } from '../components/statusConfig';
import { getOrders, updateStatus, sendMessage, setLocation } from '../api/adminApi';

const STAGE_ORDER = ['in_queue','sketching','waiting_for_feedback','finished','framed','shipped','done'];
const BASE_STAGES = [
  { key: 'in_queue',             label: 'Queued'          },
  { key: 'sketching',            label: 'Sketching'       },
  { key: 'waiting_for_feedback', label: 'Waiting for feedback or approval' },
  { key: 'finished',             label: 'Finished'        },
];

const BTN_FILL  = 'bg-grad text-white border-transparent hover:opacity-90';
const BTN_GHOST = 'bg-transparent text-va-text3 border-va-border hover:border-va-text3 hover:text-va-text';
const BTN_DANGER = 'bg-transparent text-va-danger border-red-300 hover:bg-va-danger-bg';
const BTN_BASE  = 'rounded-md text-xs font-semibold cursor-pointer border font-sans transition-all px-3 py-1.5';
const BTN_SM    = 'px-2.5 py-[5px] text-[11px]';
const FIELD_INPUT = 'w-full border border-va-border rounded-lg px-3 py-2.5 font-sans text-sm text-va-text bg-va-bg outline-none transition-colors focus:border-va-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(43,143,224,0.1)]';

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ order, onClose, onStatusSaved, onToast }) {
  const [status, setStatus]     = useState(order.status);
  const [saving, setSaving]     = useState(false);
  const [chatMsg, setChatMsg]   = useState('');
  const [location, setLoc]      = useState(order.artistLocation || '');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const curIdx = STAGE_ORDER.indexOf(order.status);
  const stages = [
    ...BASE_STAGES,
    ...(order.frameType && order.frameType !== 'without_frame' ? [{ key: 'framed', label: 'Framed' }] : []),
    ...(order.pickupOption === 'courier' ? [{ key: 'shipped', label: 'Shipped' }] : []),
    { key: 'done', label: 'Done' },
  ];

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      await updateStatus(order.id, status);
      onToast('Status updated — client notified');
      onStatusSaved();
    } catch { onToast('Failed to update status'); }
    finally { setSaving(false); }
  };

  const handleSendMessage = async () => {
    if (!chatMsg.trim()) return;
    try {
      await sendMessage(order.id, chatMsg.trim());
      setChatMsg('');
      onToast('Message sent');
      onStatusSaved();
    } catch { onToast('Failed to send message'); }
  };

  const handleSaveLocation = async () => {
    try {
      await setLocation(order.id, location);
      onToast('Location saved');
    } catch { onToast('Failed to save location'); }
  };

  const messages = order.messages || [];

  return (
    <div className="fixed inset-y-0 right-0 z-[180] flex h-[100dvh] w-full max-w-[360px] shrink-0 flex-col overflow-y-auto border-l border-va-border bg-white shadow-[-16px_0_40px_rgba(30,24,72,0.16)] sm:top-[60px] sm:h-[calc(100vh-60px)]">
      <div className="px-[18px] py-4 border-b border-va-border flex items-center justify-between sticky top-0 z-10 bg-white">
        <div>
          <div className="font-outfit text-[13px] font-bold">Order #{order.id?.slice(0,8)}</div>
          <div className="mt-1"><Badge status={order.status}/></div>
        </div>
        <button type="button" aria-label="Close order details" className="text-lg text-va-text3 cursor-pointer leading-none px-1.5 py-0.5 rounded border-none bg-transparent hover:bg-va-bg2 hover:text-va-text" onClick={onClose}>×</button>
      </div>

      <div className="px-[18px] py-4 flex-1">
        {/* Order Details */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Order Details</div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Client</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.customer?.fullName}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Paper</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.paperSize}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Subjects</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.subjectCount?.replace(/_/g,' ')}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Frame</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.frameType?.replace(/_/g,' ')}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs">
            <span className="text-va-text3">Total</span>
            <span className="font-semibold text-right max-w-[60%] text-va-purple">
              {order.currency} {parseFloat(order.totalPrice || 0).toLocaleString()}
            </span>
          </div>
          {order.isUrgent && (
            <div className="flex justify-between items-start mb-2 text-xs">
              <span className="text-va-text3">Deadline</span>
              <span className="inline-flex items-center justify-end gap-1 font-semibold text-right max-w-[60%] text-va-danger">
                <Icon name="alert" size={13}/>
                {order.urgentDeadline ? new Date(order.urgentDeadline).toLocaleDateString() : 'Urgent'}
              </span>
            </div>
          )}
          <div className="flex justify-between items-start mb-2 text-xs">
            <span className="text-va-text3">Payment</span>
            <span className="inline-flex items-center justify-end gap-1 font-semibold text-right max-w-[60%] text-va-success">
              <Icon name="completed" size={13}/>
              {order.paymentType === 'full' ? 'Fully paid' : 'Deposit paid'}
            </span>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Progress</div>
          <div className="flex flex-col">
            {stages.map((st, i) => {
              const stIdx = STAGE_ORDER.indexOf(st.key);
              const isDone   = stIdx < curIdx;
              const isActive = st.key === order.status || (order.status === 'revision' && st.key === 'waiting_for_feedback');
              const isLast = i === stages.length - 1;
              return (
                <div
                  key={st.key}
                  className={`flex gap-2.5 relative ${!isLast ? `after:content-[''] after:absolute after:left-[10px] after:top-6 after:w-[1.5px] after:h-[calc(100%-6px)] ${isDone ? 'after:bg-va-success' : 'after:bg-va-border'}` : ''}`}
                >
                  <div className={`w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-[11px] z-[1] ${isDone ? 'bg-va-success text-white' : isActive ? 'bg-grad text-white' : 'bg-va-bg2 border-[1.5px] border-va-border text-va-text3'}`}>
                    {isDone ? <Icon name="completed" size={13}/> : i + 1}
                  </div>
                  <div className="pt-0.5 pb-[18px]">
                    <div className={`text-xs font-semibold ${!isDone && !isActive ? 'text-va-text3 font-normal' : 'text-va-text'}`}>{st.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reference Photo */}
        {order.referencePhotos?.length > 0 && (
          <div className="mb-5 pb-5 border-b border-va-border">
            <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Reference Photos</div>
            <div className="flex gap-1.5 flex-wrap">
              {order.referencePhotos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="ref" className="w-[72px] h-[72px] object-cover rounded-md border border-va-border"/>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Proof Image */}
        <div className="mb-5 pb-5 border-b border-va-border">
          {order.proofImagePath ? (
            <>
              <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Uploaded Proof</div>
              <div className="rounded-lg overflow-hidden border border-va-border mb-2.5">
                <div className="w-full h-[130px] bg-gradient-to-br from-va-bg2 to-[#d0c8f0] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute font-outfit text-[22px] font-extrabold text-[rgba(91,63,168,0.12)] -rotate-[30deg] tracking-[3px] uppercase select-none">VIVID ARTS</div>
                  <img src={order.proofImagePath} alt="proof" className="w-full h-full object-cover absolute top-0 left-0 opacity-[0.85]"/>
                </div>
              </div>
              <div className="flex gap-1.5">
                <a href={order.proofImagePath} target="_blank" rel="noreferrer" className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM} flex-1 text-center no-underline`}>Download</a>
              </div>
            </>
          ) : <div className="text-xs text-va-text3">No proof yet. Upload it from the Proofs page.</div>}
        </div>

        {/* Customer note */}
        {order.customerNote && (
          <div className="mb-5 pb-5 border-b border-va-border">
            <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Customer Note</div>
            <div className="bg-va-danger-bg border border-red-300 rounded-lg px-3 py-2.5 mb-2">
              <div className="text-xs text-va-text2 leading-relaxed italic">"{order.customerNote}"</div>
            </div>
          </div>
        )}

        {/* Update Status */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Update Status</div>
          <div className="relative mb-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-va-border bg-va-bg px-3 py-2.5 text-left text-sm text-va-text transition-colors hover:border-va-border2"
              aria-expanded={statusMenuOpen}
              onClick={() => setStatusMenuOpen(open => !open)}
            >
              <span className="flex items-center gap-2 font-semibold">
                <Icon name={STATUS_MAP[status]?.icon || 'pending'} size={16}/>
                {STATUS_MAP[status]?.label || (status === 'revision_requested' ? 'Revision requested by client' : 'Proof approved by client')}
              </span>
              <span className={`text-va-text3 transition-transform ${statusMenuOpen ? 'rotate-90' : ''}`}>›</span>
            </button>
            {statusMenuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-lg border border-va-border bg-white p-1.5 shadow-[0_12px_30px_rgba(27,22,62,0.16)]">
                {[
                  ['in_queue', 'Queued'],
                  ['sketching', 'Sketching'],
                  ['waiting_for_feedback', 'Waiting for feedback or approval'],
                  ['finished', 'Finished'],
                  ...(order.frameType && order.frameType !== 'without_frame' ? [['framed', 'Framed']] : []),
                  ...(order.pickupOption === 'courier' ? [['shipped', 'Shipped']] : []),
                  ['done', 'Done'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${status === value ? 'bg-[#F0EBFA] font-bold text-va-purple' : 'text-va-text2 hover:bg-va-bg'}`}
                    onClick={() => { setStatus(value); setStatusMenuOpen(false); }}
                  >
                    <Icon name={STATUS_MAP[value]?.icon || 'pending'} size={15}/>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className={`${BTN_BASE} ${BTN_FILL} w-full py-[9px] text-[13px]`} onClick={handleStatusSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save status update'}
          </button>
        </div>

        {/* Pickup location */}
        {order.pickupOption === 'pickup' && (
          <div className="mb-5 pb-5 border-b border-va-border">
            <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Pickup Location</div>
            <textarea className={`${FIELD_INPUT} resize-y min-h-[80px]`} rows={2} value={location} onChange={e => setLoc(e.target.value)} placeholder="Enter pickup address or Google Maps link"/>
            <button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM} mt-1.5`} onClick={handleSaveLocation}>Save location</button>
          </div>
        )}

        {/* Chat */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Chat</div>
          <div className="max-h-[200px] overflow-y-auto bg-va-bg rounded-lg p-2.5 mb-2 flex flex-col gap-2">
            {messages.length === 0 && <div className="text-xs text-va-text3">No messages yet.</div>}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] ${m.senderType === 'admin' ? 'self-end' : 'self-start'}`}>
                <div className={`px-3 py-[7px] rounded-2xl text-xs leading-relaxed ${
                  m.senderType === 'admin'
                    ? 'bg-va-blue text-white'
                    : m.senderType === 'system'
                      ? 'bg-[#f3f4f6] text-va-text3 italic'
                      : 'bg-white text-va-text border border-va-border'
                }`}>
                  {m.message}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              className="flex-1 mb-0 px-2.5 py-2 text-xs border border-va-border rounded-lg font-sans text-va-text bg-va-bg outline-none transition-colors focus:border-va-blue focus:bg-white"
              placeholder="Message to customer…"
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button className={`${BTN_BASE} ${BTN_FILL} ${BTN_SM}`} onClick={handleSendMessage}>Send</button>
          </div>
        </div>

        {/* Cancel */}
        <div className="pb-0 border-b-0">
          <button className={`${BTN_BASE} ${BTN_DANGER} w-full py-[9px] text-[13px]`}>
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────
export default function OrdersPage({ search, onToast }) {
  const [orders, setOrders]       = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.orders);
      setStats(res.data.stats);
    } catch { onToast('Failed to load orders'); }
    finally { setLoading(false); }
  }, [onToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount; `load` is also reused by onStatusSaved below
    load();
  }, [load]);

  const filtered = orders.filter(o => {
    const matchSearch = !search || [o.id, o.customer?.fullName, o.customer?.email].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'sketch' ? o.status === 'sketching' :
      filter === 'proof'  ? o.status === 'waiting_for_feedback' :
      filter === 'revision' ? o.status === 'revision_requested' :
      filter === 'approved' ? o.status === 'finished' : true;
    return matchSearch && matchFilter;
  });

  const selectedOrder = orders.find(o => o.id === selectedId);

  return (
    <div className="flex min-w-0 flex-1">
      <div className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-[22px]">

        {/* Stats */}
        <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-grad border border-transparent rounded-va px-5 py-[18px] shadow-va relative overflow-hidden after:content-[''] after:absolute after:-top-5 after:-right-5 after:w-20 after:h-20 after:rounded-full after:bg-white/[0.04]">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white mb-3"><Icon name="orders"/></div>
            <div className="font-outfit text-[28px] font-extrabold text-white">{stats.total ?? '—'}</div>
            <div className="text-xs text-white/60 mt-0.5">Active Orders</div>
            <div className="text-xs font-semibold mt-2 text-white/70">
              {stats.urgentActive
                ? <span className="inline-flex items-center gap-1"><Icon name="alert" size={13}/>{stats.urgentActive} urgent</span>
                : 'This month'}
            </div>
          </div>
          <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-warn mb-3"><Icon name="approval"/></div>
            <div className="font-outfit text-[28px] font-extrabold text-va-text">{stats.waitingFeedback ?? '—'}</div>
            <div className="text-xs text-va-text3 mt-0.5">Awaiting Approval</div>
            <div className="text-xs font-semibold mt-2 text-va-warn">Proofs sent to clients</div>
          </div>
          <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-success mb-3"><Icon name="completed"/></div>
            <div className="font-outfit text-[28px] font-extrabold text-va-text">{orders.filter(o => o.status === 'done').length}</div>
            <div className="text-xs text-va-text3 mt-0.5">Completed</div>
            <div className="text-xs font-semibold mt-2 text-va-success">All time</div>
          </div>
          <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-success mb-3"><Icon name="revenue"/></div>
            <div className="font-outfit text-[22px] font-extrabold text-va-text">
              {`LKR ${Number(stats.totalValue || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-va-text3 mt-0.5">Order Value</div>
            <div className="text-xs font-semibold mt-2 text-va-success">Live total from orders</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-va-border rounded-va shadow-va overflow-hidden">
          <div className="px-5 py-4 border-b border-va-border flex items-center justify-between">
            <div className="font-outfit text-sm font-bold text-va-text">All Orders</div>
            <div className="flex gap-1.5 flex-wrap">
              {[['all','All'],['sketch','Sketching'],['proof','Proof Sent'],['revision','Revision'],['approved','Approved']].map(([f, l]) => (
                <div
                  key={f}
                  className={`text-xs font-semibold px-3 py-[5px] rounded-full border cursor-pointer transition-all ${filter === f ? 'border-va-blue bg-va-info-bg text-va-blue' : 'border-va-border bg-white text-va-text3 hover:border-va-border2 hover:text-va-text'}`}
                  onClick={() => setFilter(f)}
                >{l}</div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-va-text3">Loading orders…</div>
            ) : (
              <table className="min-w-[760px] w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Order ID</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Client</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Details</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Total</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Type</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Status</th>
                    <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-va-text3">No orders match this filter.</td></tr>
                  )}
                  {filtered.map(o => (
                    <tr
                      key={o.id}
                      className={`cursor-pointer transition-colors [&>td]:px-3.5 [&>td]:py-3 [&>td]:border-b [&>td]:border-va-border [&>td]:text-[13px] [&>td]:align-middle hover:[&>td]:bg-va-bg ${selectedId === o.id ? '[&>td]:bg-[#F0EBFA]' : ''}`}
                      onClick={() => setSelectedId(o.id)}
                    >
                      <td><span className="font-mono text-xs font-medium">#{o.id?.slice(0,8)}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-grad flex items-center justify-center font-bold text-[11px] text-white shrink-0">
                            {o.customer?.fullName ? o.customer.fullName.slice(0,2).toUpperCase() : <Icon name="user" size={14}/>}
                          </div>
                          <span className="font-medium">{o.customer?.fullName}</span>
                        </div>
                      </td>
                      <td className="text-va-text3">{o.paperSize} · {o.subjectCount?.replace(/_/g,' ')}</td>
                      <td><strong>{o.currency} {parseFloat(o.totalPrice || 0).toLocaleString()}</strong></td>
                      <td>{o.isUrgent
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap bg-va-danger-bg text-va-danger"><Icon name="alert" size={13}/>Urgent</span>
                        : <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap bg-[#F0F0F8] text-[#555]">Normal</span>}
                      </td>
                      <td><Badge status={o.status}/></td>
                      <td>
                        <div className="flex gap-[5px]">
                          <button className={`${BTN_BASE} ${BTN_FILL} ${BTN_SM}`} onClick={e => { e.stopPropagation(); setSelectedId(o.id); }}>Manage</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedOrder && (
        <>
          <button type="button" aria-label="Close order details" className="fixed inset-0 z-[170] bg-[#12102a]/35 sm:hidden" onClick={() => setSelectedId(null)}/>
          <DetailPanel order={selectedOrder} onClose={() => setSelectedId(null)} onStatusSaved={load} onToast={onToast}/>
        </>
      )}
    </div>
  );
}
