import { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Icon from '../components/Icon';
import { getOrders, getCustomers, getPayments, invoiceUrl, uploadProof } from '../api/adminApi';
import { useNavigate } from '../router';

const CARD       = 'bg-white border border-va-border rounded-va shadow-va overflow-hidden';
const CARD_HEAD  = 'px-5 py-4 border-b border-va-border flex items-center justify-between';
const CARD_TITLE = 'font-outfit text-sm font-bold text-va-text';
const CARD_BODY  = 'p-5';

const BTN_BASE   = 'rounded-md text-xs font-semibold cursor-pointer border font-sans transition-all px-3 py-1.5';
const BTN_FILL   = 'bg-grad text-white border-transparent hover:opacity-90';
const BTN_GHOST  = 'bg-transparent text-va-text3 border-va-border hover:border-va-text3 hover:text-va-text';
const BTN_SM     = 'px-2.5 py-[5px] text-[11px]';

const FIELD       = 'mb-4';
const FIELD_LABEL = 'text-xs font-semibold text-va-text block mb-1.5';
const FIELD_INPUT = 'w-full border border-va-border rounded-lg px-3 py-2.5 font-sans text-sm text-va-text bg-va-bg outline-none transition-colors focus:border-va-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(43,143,224,0.1)]';

const DP_ROW = 'flex justify-between items-start mb-2 text-xs';
const DP_KEY = 'text-va-text3';
const DP_VAL = 'font-semibold text-va-text text-right max-w-[60%]';

const ORDER_ID_MONO = 'font-mono text-xs font-medium';

// ── Revenue Chart ─────────────────────────────────────────────────────────────
function RevenueChart({ orders }) {
  const months = Array.from({ length: 12 }, (_, index) => new Date(2000, index, 1).toLocaleString(undefined, { month: 'short' }));
  const currentYear = new Date().getFullYear();
  const vals = months.map((_, month) => orders.filter(order => { const date = new Date(order.createdAt); return date.getFullYear() === currentYear && date.getMonth() === month; }).reduce((sum, order) => sum + Number(order.amountPaid || 0), 0));
  const max = Math.max(...vals, 1);
  return (
    <div className="flex items-end gap-1.5 h-[120px] px-1">
      {months.map((m, i) => (
        <div key={m} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t transition-all min-h-[4px] ${!vals[i] ? 'bg-va-bg2' : 'bg-grad'}`}
            style={{ height: vals[i] ? `${Math.max(8,(vals[i]/max)*100)}%` : '8%' }}
          />
          <div className="text-[10px] text-va-text3 font-medium">{m}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function DashboardPage({ onNav }) {
  const [orders, setOrders] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  useEffect(() => {
    getOrders().then(r => setOrders(r.data.orders)).catch(() => {});
    getCustomers().then(r => setClientCount((r.data.customers || []).length)).catch(() => {});
  }, []);

  const counts = {
    active:   orders.length,
    sketch:   orders.filter(o => o.status === 'sketching').length,
    proof:    orders.filter(o => o.status === 'waiting_for_feedback').length,
    shading:  orders.filter(o => o.status === 'shading').length,
    approved: orders.filter(o => o.status === 'finished').length,
  };

  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className="grid grid-cols-4 gap-3.5 mb-4">
        <div className="bg-grad border border-transparent rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white mb-3"><Icon name="orders"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-white">{counts.active}</div>
          <div className="text-xs text-white/60 mt-0.5">Active orders</div>
          <div className="text-xs font-semibold mt-2 text-white/70">This month</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-purple mb-3"><Icon name="user"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{clientCount}</div>
          <div className="text-xs text-va-text3 mt-0.5">Total clients</div>
          <div className="text-xs font-semibold mt-2 text-va-success">All time</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-success mb-3"><Icon name="completed"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{counts.approved}</div>
          <div className="text-xs text-va-text3 mt-0.5">Completed</div>
          <div className="text-xs font-semibold mt-2 text-va-success">All time</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-warn mb-3"><Icon name="rating"/></div>
          <div className="font-outfit text-[22px] font-extrabold text-va-text">LKR {orders.reduce((sum, order) => sum + Number(order.amountPaid || 0), 0).toLocaleString()}</div>
          <div className="text-xs text-va-text3 mt-0.5">Payments collected</div>
          <div className="text-xs font-semibold mt-2 text-va-success">Live total</div>
        </div>
      </div>

      <div className="flex gap-3.5 mb-4">
        <div className="flex-1 min-w-0">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <div className={CARD_TITLE}>Monthly Payments — {new Date().getFullYear()}</div>
              <span className="text-xs text-va-text3">LKR</span>
            </div>
            <div className={CARD_BODY}>
              <RevenueChart orders={orders}/>
              <div className="flex gap-3.5 mt-3 flex-wrap">
                <div className="text-xs text-va-text3">Collected YTD: <strong className="text-va-text">LKR {orders.filter(order => new Date(order.createdAt).getFullYear() === new Date().getFullYear()).reduce((sum, order) => sum + Number(order.amountPaid || 0), 0).toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-[280px]">
          <div className={CARD}>
            <div className={CARD_HEAD}><div className={CARD_TITLE}>Orders by Status</div></div>
            <div className={CARD_BODY}>
              <div className="text-center py-4">
                <div className="text-4xl font-extrabold font-outfit bg-grad bg-clip-text text-transparent">{counts.active}</div>
                <div className="text-xs text-va-text3 mt-0.5">active orders</div>
              </div>
              {[
                ['bg-va-blue',    'Sketching',    counts.sketch],
                ['bg-va-purple',  'Proof Sent',   counts.proof],
                ['bg-va-warn',    'Final Shading',counts.shading],
                ['bg-va-success', 'Approved',     counts.approved],
              ].map(([color, label, count]) => (
                <div key={label} className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-sm ${color}`}/>
                    {label}
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3.5">
        <div className="flex-1 min-w-0">
          <div className={CARD}>
            <div className={CARD_HEAD}><div className={CARD_TITLE}>Action Required</div></div>
            <div className="p-0">
              {orders.filter(o => ['waiting_for_feedback','revision'].includes(o.status)).slice(0,3).map(o => (
                <div key={o.id} className="px-4 py-3 border-b border-va-border flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold">#{o.id?.slice(0,8)} — {o.customer?.fullName}</div>
                    <div className="text-xs text-va-text3 mt-0.5">
                      <Badge status={o.status}/>
                    </div>
                  </div>
                  <button className={`${BTN_BASE} ${BTN_FILL} ${BTN_SM}`} onClick={() => onNav('orders')}>View</button>
                </div>
              ))}
              {orders.filter(o => ['waiting_for_feedback','revision'].includes(o.status)).length === 0 && (
                <div className="p-5 text-va-text3 text-[13px] flex items-center justify-center gap-2">
                  <Icon name="completed" size={18} className="text-va-success"/> No urgent actions needed.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-[300px]">
          <div className={CARD}>
            <div className={CARD_HEAD}><div className={CARD_TITLE}>Quick Stats</div></div>
            <div className={CARD_BODY}>
              {[
                ['Avg. order value', orders.length ? `LKR ${Math.round(orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0) / orders.length).toLocaleString()}` : '—'],
                ['Revision requests', orders.filter(order => order.status === 'revision_requested').length],
                ['Waiting approval', orders.filter(order => order.status === 'waiting_for_feedback').length],
                ['Framed orders', orders.filter(order => order.frameType && order.frameType !== 'without_frame').length],
                ['Courier orders', orders.filter(order => order.pickupOption === 'courier').length],
              ].map(([k,v]) => (
                <div key={k} className={DP_ROW}><span className={DP_KEY}>{k}</span><span className={DP_VAL}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROOFS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function ProofsPage({ onToast }) {
  const [orders, setOrders]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getOrders().then(r => {
      const pending = r.data.orders.filter(o => o.status === 'revision_requested' || (!o.proofImagePath && ['in_queue','sketching'].includes(o.status)));
      setOrders(pending);
    }).catch(() => {});
  }, []);

  const handleUpload = async (file) => {
    if (!file || !selected) return;
    setUploading(true);
    try {
      await uploadProof(selected.id, file);
      onToast(`✓ Proof sent to ${selected.customer?.fullName} — awaiting approval`);
      setSelected(prev => ({ ...prev, proofImagePath: 'uploaded' }));
      setOrders(prev => prev.filter(o => o.id !== selected.id));
    } catch { onToast('❌ Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-4 bg-va-info-bg border border-blue-300 text-va-info">
        <Icon name="orders" size={18} className="shrink-0"/> {orders.length} orders are waiting for a proof upload. Upload a watermarked image to send to the client for review.
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {/* Left: order list */}
        <div>
          {orders.length === 0 ? (
            <div className={CARD}><div className="py-8 text-va-text3 flex items-center justify-center gap-2"><Icon name="completed" size={20} className="text-va-success"/> All pending orders have proofs uploaded.</div></div>
          ) : orders.map(o => (
            <div
              key={o.id}
              className={`${CARD} mb-3 cursor-pointer ${selected?.id === o.id ? 'border-2 border-va-purple' : ''}`}
              onClick={() => setSelected(o)}
            >
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-semibold">{o.customer?.fullName}</div>
                  <Badge status={o.status}/>
                </div>
                <div className="text-xs text-va-text3">{o.paperSize} · {o.subjectCount?.replace(/_/g,' ')}</div>
                <div className="flex justify-between mt-2">
                  <span className={`${ORDER_ID_MONO} text-[11px]`}>#{o.id?.slice(0,8)}</span>
                  {o.isUrgent && <span className="text-[11px] text-va-danger font-semibold">🔥 Urgent</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: upload panel */}
        <div>
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <div className={CARD_TITLE}>
                {selected ? `Upload proof — #${selected.id?.slice(0,8)} · ${selected.customer?.fullName}` : 'Select an order to upload proof'}
              </div>
            </div>
            <div className={CARD_BODY}>
              {!selected ? (
                <div className="text-center py-8 text-va-text3">
                  <Icon name="pointer" size={34} className="mx-auto mb-2 text-va-purple"/>
                  <div className="text-[13px]">Select an order from the left to upload its proof image</div>
                </div>
              ) : (
                <>
                  <div className={`${DP_ROW} mb-3`}><span className={DP_KEY}>Order</span><span className={DP_VAL}>#{selected.id?.slice(0,8)}</span></div>
                  <div className={`${DP_ROW} mb-3`}><span className={DP_KEY}>Details</span><span className={DP_VAL}>{selected.paperSize} · {selected.subjectCount?.replace(/_/g,' ')}</span></div>
                  <div className={`${DP_ROW} mb-4`}><span className={DP_KEY}>Deadline</span><span className={`font-semibold text-right max-w-[60%] ${selected.isUrgent ? 'text-va-danger' : 'text-va-text'}`}>{selected.isUrgent ? '🔥 Urgent' : 'Standard'}</span></div>

                  <div className="text-xs font-bold text-va-text mb-2">Upload Watermarked Proof</div>
                  <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-3 bg-va-info-bg border border-blue-300 text-va-info">
                    <Icon name="info" size={18} className="shrink-0"/> Upload a low-resolution version with your watermark. The client will review this before the high-res is released.
                  </div>
                  <label className="block border-[1.5px] border-dashed border-va-border2 rounded-lg px-3.5 py-5 text-center cursor-pointer transition-all bg-va-bg hover:border-va-blue hover:bg-va-info-bg">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])}/>
                    <Icon name={uploading ? 'pending' : 'upload'} size={28} className="mx-auto mb-1.5 text-va-purple"/>
                    <div className="text-xs font-semibold text-va-text">{uploading ? 'Uploading to Cloudinary…' : 'Drag and drop or click to browse'}</div>
                    <div className="text-[11px] text-va-text3 mt-[3px]">JPG or PNG · Max 10 MB · Watermark applied</div>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REVISIONS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function RevisionsPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    const load = () => getOrders()
      .then(r => { if (active) setOrders(r.data.orders.filter(o => o.status === 'revision_requested')); })
      .catch(() => {});
    load();
    const interval = window.setInterval(load, 5_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-4 bg-va-warn-bg border border-orange-300 text-va-warn">
        <Icon name="alert" size={18} className="shrink-0"/> {orders.length} revision requests are waiting for your response. Upload updated proofs to continue.
      </div>
      <div className={CARD}>
        <div className={CARD_HEAD}><div className={CARD_TITLE}>Open Revision Requests</div></div>
        <div className="p-0">
          {orders.length === 0 && (
            <div className="py-10 text-va-text3 flex items-center justify-center gap-2"><Icon name="completed" size={20} className="text-va-success"/> No open revision requests.</div>
          )}
          {orders.map(o => (
            <div key={o.id} className="px-5 py-4 border-b border-va-border">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="text-[13px] font-bold mb-0.5">{o.customer?.fullName} · <span className={ORDER_ID_MONO}>#{o.id?.slice(0,8)}</span></div>
                  <div className="text-xs text-va-text3">{o.paperSize} · {o.subjectCount?.replace(/_/g,' ')}</div>
                </div>
                <Badge status={o.status}/>
              </div>
              <div className="mb-2.5 grid gap-2 rounded-lg border border-va-border bg-va-bg p-3 text-xs sm:grid-cols-2">
                <div><span className="text-va-text3">Frame:</span> <strong>{o.frameType?.replace(/_/g, ' ') || '—'}</strong></div>
                <div><span className="text-va-text3">Deadline:</span> <strong>{o.urgentDeadline ? new Date(o.urgentDeadline).toLocaleDateString() : 'Standard schedule'}</strong></div>
                <div><span className="text-va-text3">Delivery:</span> <strong>{o.pickupOption === 'courier' ? 'Courier' : 'Pickup'}</strong></div>
                <div><span className="text-va-text3">Order total:</span> <strong>{o.currency} {Number(o.totalPrice || 0).toLocaleString()}</strong></div>
              </div>
              {o.messages?.filter(m => m.senderType === 'system' && m.message.toLowerCase().includes('requested changes')).slice(-1).map(m => (
                <div key={m.message_id || m.createdAt} className="bg-va-danger-bg border border-red-300 rounded-lg px-3 py-2.5 mb-2.5">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-va-danger">Requested changes</div>
                  <div className="text-xs text-va-text2 leading-relaxed">{m.message.replace(/^Customer requested changes:\s*/i, '')}</div>
                  <div className="text-[11px] text-va-text3 mt-1">Received {new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
              <div className="flex gap-2 mt-2.5">
                <button className={`${BTN_BASE} ${BTN_FILL} flex-1 py-[9px]`} onClick={() => navigate(`/admin/orders/${o.id}`)}>Upload revised proof</button>
                <button className={`${BTN_BASE} ${BTN_GHOST} flex-1 py-[9px]`} onClick={() => navigate(`/admin/orders/${o.id}`)}>View order</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function ClientsPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    getCustomers().then(r => {
      const rows = Array.isArray(r.data) ? r.data : (r.data.customers || []);
      setCustomers(rows.map(customer => ({
        ...customer,
        id: customer.id ?? customer.customer_id,
        fullName: customer.fullName ?? customer.full_name ?? customer.username,
        phone: customer.phone ?? customer.phone_number,
        lastOrderAt: customer.lastOrderAt ?? null,
        orders: customer.orders || [],
      })));
      setLoadError('');
    }).catch(error => {
      setCustomers([]);
      setLoadError(error.response?.status === 401
        ? 'Your admin session has expired. Please sign in again.'
        : (error.response?.data?.error || 'Clients could not be loaded. Please retry.'));
    });
  }, []);

  const filtered = customers.filter(c =>
    [c.username, c.fullName, c.email, c.phone].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className={CARD}>
        <div className={CARD_HEAD}>
          <div className={CARD_TITLE}>All Clients</div>
          <div className="flex items-center gap-2 border border-va-border rounded-lg px-3 py-[7px] bg-va-bg text-xs text-va-text3 w-[220px] transition-colors focus-within:border-va-blue focus-within:bg-white">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="var(--va-text3)" strokeWidth="1.2"/><path d="M9.5 9.5L12 12" stroke="var(--va-text3)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} className="border-none bg-transparent outline-none text-xs font-sans text-va-text w-full"/>
          </div>
        </div>
        {loadError && <div className="mx-4 mt-4 rounded-lg border border-red-300 bg-va-danger-bg px-3.5 py-2.5 text-xs text-va-danger">{loadError}</div>}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Client</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Email</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Phone</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Orders</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Last Order</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer transition-colors [&>td]:px-3.5 [&>td]:py-3 [&>td]:border-b [&>td]:border-va-border [&>td]:text-[13px] [&>td]:align-middle hover:[&>td]:bg-va-bg">
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-grad flex items-center justify-center font-bold text-xs text-white shrink-0">{c.fullName?.slice(0,2).toUpperCase()}</div>
                    <div><div className="font-semibold">{c.username}</div><div className="text-[11px] text-va-text3">{c.fullName}</div></div>
                  </div>
                </td>
                <td className="text-va-text3">{c.email}</td>
                <td className="text-va-text3">{c.phone}</td>
                <td><strong>{c.orders?.length || 0}</strong></td>
                <td className="text-va-text3">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : '—'}</td>
                <td><button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`}>View details</button></td>
              </tr>
            ))}
            {!loadError && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-va-text3">No clients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className={`${CARD} mt-4`}>
          <div className={CARD_HEAD}><div className={CARD_TITLE}>Client details — {selected.username}</div><button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} onClick={() => setSelected(null)}>Close</button></div>
          <div className={`${CARD_BODY} grid grid-cols-2 gap-x-8`}>
            <div><div className={DP_ROW}><span className={DP_KEY}>Full name</span><span className={DP_VAL}>{selected.fullName}</span></div><div className={DP_ROW}><span className={DP_KEY}>Email</span><span className={DP_VAL}>{selected.email}</span></div><div className={DP_ROW}><span className={DP_KEY}>Phone</span><span className={DP_VAL}>{selected.phone || '—'}</span></div><div className={DP_ROW}><span className={DP_KEY}>Address</span><span className={DP_VAL}>{selected.address || '—'}</span></div></div>
            <div><div className="text-xs font-bold mb-2">Order history ({selected.orders?.length || 0})</div>{selected.orders?.map(order => <div key={order.id} className="flex justify-between items-center gap-2 text-xs py-2 border-b border-va-border"><span>#{order.id.slice(0,8)}</span><span>{order.currency} {Number(order.totalPrice).toLocaleString()}</span><Badge status={order.status}/></div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAYMENTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const load = () => getOrders().then(r => setOrders(r.data.orders)).catch(() => {});
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);
  const now = new Date();
  const collectedThisMonth = orders.filter(o => { const date = new Date(o.updatedAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }).reduce((sum, o) => sum + Number(o.amountPaid || 0), 0);
  const pendingBalance = orders.reduce((sum, o) => sum + Math.max(0, Number(o.totalPrice || 0) - Number(o.amountPaid || 0)), 0);

  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className="grid grid-cols-4 gap-3.5 mb-4">
        <div className="bg-grad border border-transparent rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white mb-3"><Icon name="payments"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-white">LKR {collectedThisMonth.toLocaleString()}</div>
          <div className="text-xs text-white/60 mt-0.5">Collected this month</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-warn mb-3"><Icon name="pending"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">LKR {pendingBalance.toLocaleString()}</div>
          <div className="text-xs text-va-text3 mt-0.5">Balance pending</div>
          <div className="text-xs font-semibold mt-2 text-va-warn">Half-paid orders</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-success mb-3"><Icon name="bank"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{orders.filter(o => Number(o.amountPaid) >= Number(o.totalPrice) && Number(o.totalPrice) > 0).length}</div>
          <div className="text-xs text-va-text3 mt-0.5">Fully paid orders</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-va-purple mb-3"><Icon name="advance"/></div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{orders.filter(o => Number(o.amountPaid) > 0 && Number(o.amountPaid) < Number(o.totalPrice)).length}</div>
          <div className="text-xs text-va-text3 mt-0.5">Advance paid orders</div>
        </div>
      </div>
      <div className={CARD}>
        <div className={CARD_HEAD}><div className={CARD_TITLE}>Payment Transactions</div></div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Order ID</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Client</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Total</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Paid</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Remaining</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Type</th>
              <th className="text-[11px] font-bold text-va-text3 uppercase tracking-wide px-3.5 py-2.5 text-left bg-va-bg border-b border-va-border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const total = parseFloat(o.totalPrice || 0);
              const paid  = parseFloat(o.amountPaid || 0);
              return (
                <tr key={o.id} className="cursor-pointer transition-colors [&>td]:px-3.5 [&>td]:py-3 [&>td]:border-b [&>td]:border-va-border [&>td]:text-[13px] [&>td]:align-middle hover:[&>td]:bg-va-bg">
                  <td><span className={ORDER_ID_MONO}>#{o.id?.slice(0,8)}</span></td>
                  <td>{o.customer?.fullName}</td>
                  <td><strong>{o.currency} {total.toLocaleString()}</strong></td>
                  <td>{o.currency} {paid.toLocaleString()}</td>
                  <td className={paid < total ? 'text-va-warn' : 'text-va-success'}>
                    {o.currency} {(total - paid).toLocaleString()}
                  </td>
                  <td><span className="text-xs bg-va-bg2 px-2 py-[3px] rounded font-semibold">Advance</span></td>
                  <td><Badge status={paid <= 0 ? 'pending' : paid >= total ? 'completed' : 'advance'}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INVOICES PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function InvoicesPage() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    const load = () => getPayments().then(r => setPayments((r.data.payments || []).filter(p => p.status === 'completed'))).catch(() => {});
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex-1 px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className={CARD}>
        <div className={CARD_HEAD}>
          <div className={CARD_TITLE}>Invoices</div>
          <span className="text-xs text-va-text3">Completed advance payments</span>
        </div>
        <div className={CARD_BODY}>
          {payments.map(payment => (
            <div key={payment.paymentId} className="flex items-center justify-between py-3 border-b border-va-border last:border-b-0">
              <div>
                <div className="text-[13px] font-semibold">{payment.payhereOrderId}</div>
                <div className="text-xs text-va-text3 mt-0.5">{payment.order?.customer?.fullName || 'Client'} · {new Date(payment.updatedAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold">{payment.currency} {Number(payment.amount || 0).toLocaleString()}</div>
                <a href={invoiceUrl(payment.payhereOrderId)} target="_blank" rel="noreferrer" className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM} mt-1 inline-block no-underline`}>View / Download PDF</a>
              </div>
            </div>
          ))}
          {payments.length === 0 && <div className="text-center text-va-text3 py-8">No completed-payment invoices yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function SettingsPage({ onToast }) {
  const [tab, setTab] = useState('profile');
  return (
    <div className="flex-1 max-w-[700px] px-3 py-4 sm:px-6 sm:py-[22px]">
      <div className="flex border-b border-va-border mb-6">
        {['profile','business','notifications','security'].map(t => (
          <button
            key={t}
            className={`px-4 py-2.5 text-[13px] font-semibold cursor-pointer border-0 border-b-2 -mb-px transition-all font-sans bg-transparent ${tab === t ? 'text-va-purple border-va-purple' : 'text-va-text3 border-transparent hover:text-va-text'}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className={CARD}>
          <div className={CARD_HEAD}><div className={CARD_TITLE}>Profile Information</div></div>
          <div className={CARD_BODY}>
            <div className="flex items-center gap-4 mb-[22px]">
              <div className="w-16 h-16 rounded-full bg-grad flex items-center justify-center font-extrabold text-2xl text-white font-outfit">A</div>
              <div>
                <div className="text-base font-bold font-outfit">Amal Perera</div>
                <div className="text-[13px] text-va-text3">Artist & Administrator</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className={FIELD}><label className={FIELD_LABEL}>First Name</label><input className={FIELD_INPUT} defaultValue="Amal"/></div>
              <div className={FIELD}><label className={FIELD_LABEL}>Last Name</label><input className={FIELD_INPUT} defaultValue="Perera"/></div>
            </div>
            <div className={FIELD}><label className={FIELD_LABEL}>Email Address</label><input className={FIELD_INPUT} defaultValue="amal@vividarts.lk"/></div>
            <div className={FIELD}><label className={FIELD_LABEL}>Phone</label><input className={FIELD_INPUT} defaultValue="+94 77 123 4567"/></div>
            <button className={`${BTN_BASE} ${BTN_FILL} px-5 py-[9px]`} onClick={() => onToast('✓ Profile saved')}>Save changes</button>
          </div>
        </div>
      )}

      {tab === 'business' && (
        <div className={CARD}>
          <div className={CARD_HEAD}><div className={CARD_TITLE}>Business Details</div></div>
          <div className={CARD_BODY}>
            <div className={FIELD}><label className={FIELD_LABEL}>Business Name</label><input className={FIELD_INPUT} defaultValue="Vivid Arts"/></div>
            <div className={FIELD}><label className={FIELD_LABEL}>Business Email</label><input className={FIELD_INPUT} defaultValue="hello@vividarts.lk"/></div>
            <div className={FIELD}><label className={FIELD_LABEL}>Address</label><textarea className={`${FIELD_INPUT} resize-y min-h-[60px]`} defaultValue="Matara, Sri Lanka"/></div>
            <button className={`${BTN_BASE} ${BTN_FILL} px-5 py-[9px]`} onClick={() => onToast('✓ Business settings saved')}>Save business settings</button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className={CARD}>
          <div className={CARD_HEAD}><div className={CARD_TITLE}>Email Notification Preferences</div></div>
          <div className={CARD_BODY}>
            {[
              ['New order placed',    'Email when a client submits and pays for a commission',        true],
              ['Revision requested',  'Email when a client requests changes to an uploaded proof',    true],
              ['Proof approved',      'Email when a client approves the watermarked proof',           true],
              ['Payment received',    'Email when PayHere or Stripe confirms a payment',              true],
              ['Deadline reminders',  'Email 2 days before any order\'s deadline',                   false],
            ].map(([label, sub, def]) => (
              <div key={label} className="flex items-center gap-2.5 justify-between py-2.5 border-b border-va-border last:border-b-0">
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-va-text">{label}</div>
                  <div className="text-xs text-va-text3 mt-0.5">{sub}</div>
                </div>
                <label className="relative w-10 h-[22px] shrink-0 inline-block">
                  <input type="checkbox" className="peer opacity-0 w-0 h-0" defaultChecked={def}/>
                  <span className="absolute inset-0 bg-va-border rounded-full cursor-pointer transition-colors duration-200 peer-checked:bg-va-purple"/>
                  <span className="absolute w-4 h-4 rounded-full bg-white top-[3px] left-[3px] transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.2)] peer-checked:translate-x-[18px]"/>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className={CARD}>
          <div className={CARD_HEAD}><div className={CARD_TITLE}>Change Password</div></div>
          <div className={CARD_BODY}>
            <div className={FIELD}><label className={FIELD_LABEL}>Current Password</label><input className={FIELD_INPUT} type="password" placeholder="Enter current password"/></div>
            <div className={FIELD}><label className={FIELD_LABEL}>New Password</label><input className={FIELD_INPUT} type="password" placeholder="Min 8 characters"/></div>
            <div className={FIELD}><label className={FIELD_LABEL}>Confirm New Password</label><input className={FIELD_INPUT} type="password" placeholder="Repeat new password"/></div>
            <button className={`${BTN_BASE} ${BTN_FILL} px-5 py-[9px]`} onClick={() => onToast('✓ Password updated')}>Update password</button>
          </div>
        </div>
      )}
    </div>
  );
}
