import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import { getOrders, getCustomers, uploadProof } from '../api/adminApi';

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
function RevenueChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  const vals   = [18000,24000,38000,54000,0,0,0,0];
  const max    = Math.max(...vals);
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
export function DashboardPage({ onToast, onNav }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    getOrders().then(r => setOrders(r.data.orders)).catch(() => {});
  }, []);

  const counts = {
    active:   orders.length,
    sketch:   orders.filter(o => o.status === 'sketching').length,
    proof:    orders.filter(o => o.status === 'waiting_for_feedback').length,
    shading:  orders.filter(o => o.status === 'shading').length,
    approved: orders.filter(o => o.status === 'finished').length,
  };

  return (
    <div className="py-[22px] px-6 flex-1">
      <div className="grid grid-cols-4 gap-3.5 mb-4">
        <div className="bg-grad border border-transparent rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg mb-3">📋</div>
          <div className="font-outfit text-[28px] font-extrabold text-white">{counts.active}</div>
          <div className="text-xs text-white/60 mt-0.5">Active orders</div>
          <div className="text-xs font-semibold mt-2 text-white/70">This month</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">👤</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">—</div>
          <div className="text-xs text-va-text3 mt-0.5">Total clients</div>
          <div className="text-xs font-semibold mt-2 text-va-success">All time</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">✅</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{counts.approved}</div>
          <div className="text-xs text-va-text3 mt-0.5">Completed</div>
          <div className="text-xs font-semibold mt-2 text-va-success">All time</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">⭐</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">4.9</div>
          <div className="text-xs text-va-text3 mt-0.5">Avg client rating</div>
          <div className="text-xs font-semibold mt-2 text-va-success">↑ +0.1 this month</div>
        </div>
      </div>

      <div className="flex gap-3.5 mb-4">
        <div className="flex-1 min-w-0">
          <div className={CARD}>
            <div className={CARD_HEAD}>
              <div className={CARD_TITLE}>Monthly Revenue — 2025</div>
              <span className="text-xs text-va-text3">LKR</span>
            </div>
            <div className={CARD_BODY}>
              <RevenueChart/>
              <div className="flex gap-3.5 mt-3 flex-wrap">
                <div className="text-xs text-va-text3">Total YTD: <strong className="text-va-text">LKR 2,14,000</strong></div>
                <div className="text-xs text-va-text3">Best month: <strong className="text-va-purple">April — LKR 54,000</strong></div>
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
                <div className="p-5 text-va-text3 text-[13px] text-center">✅ No urgent actions needed.</div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-[300px]">
          <div className={CARD}>
            <div className={CARD_HEAD}><div className={CARD_TITLE}>Quick Stats</div></div>
            <div className={CARD_BODY}>
              {[
                ['Avg. completion time', '8.2 days'],
                ['Avg. order value',     'LKR 5,400'],
                ['Revision rate',        '28%'],
                ['Most popular size',    'A3 (64%)'],
                ['Most popular frame',   'Classic (52%)'],
                ['Repeat clients',       '41%'],
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
      const pending = r.data.orders.filter(o => !o.proofImagePath && ['in_queue','sketching','shading'].includes(o.status));
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
    <div className="py-[22px] px-6 flex-1">
      <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-4 bg-va-info-bg border border-blue-300 text-va-info">
        📋 {orders.length} orders are waiting for a proof upload. Upload a watermarked image to send to the client for review.
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {/* Left: order list */}
        <div>
          {orders.length === 0 ? (
            <div className={CARD}><div className="text-center py-8 text-va-text3">✅ All pending orders have proofs uploaded.</div></div>
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
                  <div className="text-4xl mb-2">👈</div>
                  <div className="text-[13px]">Select an order from the left to upload its proof image</div>
                </div>
              ) : (
                <>
                  <div className={`${DP_ROW} mb-3`}><span className={DP_KEY}>Order</span><span className={DP_VAL}>#{selected.id?.slice(0,8)}</span></div>
                  <div className={`${DP_ROW} mb-3`}><span className={DP_KEY}>Details</span><span className={DP_VAL}>{selected.paperSize} · {selected.subjectCount?.replace(/_/g,' ')}</span></div>
                  <div className={`${DP_ROW} mb-4`}><span className={DP_KEY}>Deadline</span><span className={`font-semibold text-right max-w-[60%] ${selected.isUrgent ? 'text-va-danger' : 'text-va-text'}`}>{selected.isUrgent ? '🔥 Urgent' : 'Standard'}</span></div>

                  <div className="text-xs font-bold text-va-text mb-2">Upload Watermarked Proof</div>
                  <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-3 bg-va-info-bg border border-blue-300 text-va-info">
                    💡 Upload a low-resolution version with your watermark. The client will review this before the high-res is released.
                  </div>
                  <label className="block border-[1.5px] border-dashed border-va-border2 rounded-lg px-3.5 py-5 text-center cursor-pointer transition-all bg-va-bg hover:border-va-blue hover:bg-va-info-bg">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files[0])}/>
                    <div className="text-[28px] mb-1.5">{uploading ? '⏳' : '📸'}</div>
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
export function RevisionsPage({ onToast, onNav }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    getOrders().then(r => setOrders(r.data.orders.filter(o => o.status === 'waiting_for_feedback' || o.status === 'revision'))).catch(() => {});
  }, []);

  return (
    <div className="py-[22px] px-6 flex-1">
      <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-4 bg-va-warn-bg border border-orange-300 text-va-warn">
        ⚠️ {orders.length} revision requests are waiting for your response. Upload updated proofs to continue.
      </div>
      <div className={CARD}>
        <div className={CARD_HEAD}><div className={CARD_TITLE}>Open Revision Requests</div></div>
        <div className="p-0">
          {orders.length === 0 && (
            <div className="text-center py-10 text-va-text3">✅ No open revision requests.</div>
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
              {o.messages?.filter(m => m.senderType === 'customer').slice(-1).map((m, i) => (
                <div key={i} className="bg-va-danger-bg border border-red-300 rounded-lg px-3 py-2.5 mb-2.5">
                  <div className="text-xs text-va-text2 leading-relaxed italic">"{m.message}"</div>
                  <div className="text-[11px] text-va-text3 mt-1">Received {new Date(m.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              <div className="flex gap-2 mt-2.5">
                <button className={`${BTN_BASE} ${BTN_FILL} flex-1 py-[9px]`} onClick={() => onNav('proofs')}>Upload revised proof</button>
                <button className={`${BTN_BASE} ${BTN_GHOST} flex-1 py-[9px]`} onClick={() => onNav('orders')}>View order</button>
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
  useEffect(() => {
    getCustomers().then(r => setCustomers(r.data)).catch(() => {});
  }, []);

  const filtered = customers.filter(c =>
    [c.fullName, c.email, c.phone].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-[22px] px-6 flex-1">
      <div className={CARD}>
        <div className={CARD_HEAD}>
          <div className={CARD_TITLE}>All Clients</div>
          <div className="flex items-center gap-2 border border-va-border rounded-lg px-3 py-[7px] bg-va-bg text-xs text-va-text3 w-[220px] transition-colors focus-within:border-va-blue focus-within:bg-white">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="var(--va-text3)" strokeWidth="1.2"/><path d="M9.5 9.5L12 12" stroke="var(--va-text3)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} className="border-none bg-transparent outline-none text-xs font-sans text-va-text w-full"/>
          </div>
        </div>
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
              <tr key={c.id} className="cursor-pointer transition-colors [&>td]:px-3.5 [&>td]:py-3 [&>td]:border-b [&>td]:border-va-border [&>td]:text-[13px] [&>td]:align-middle hover:[&>td]:bg-va-bg">
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-grad flex items-center justify-center font-bold text-xs text-white shrink-0">{c.fullName?.slice(0,2).toUpperCase()}</div>
                    <span className="font-semibold">{c.fullName}</span>
                  </div>
                </td>
                <td className="text-va-text3">{c.email}</td>
                <td className="text-va-text3">{c.phone}</td>
                <td><strong>{c.orders?.length || 0}</strong></td>
                <td className="text-va-text3">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                <td><button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`}>View history</button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-va-text3">No clients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAYMENTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { getOrders().then(r => setOrders(r.data.orders)).catch(() => {}); }, []);

  return (
    <div className="py-[22px] px-6 flex-1">
      <div className="grid grid-cols-4 gap-3.5 mb-4">
        <div className="bg-grad border border-transparent rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg mb-3">💳</div>
          <div className="font-outfit text-[28px] font-extrabold text-white">LKR —</div>
          <div className="text-xs text-white/60 mt-0.5">Collected this month</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">⏳</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">LKR —</div>
          <div className="text-xs text-va-text3 mt-0.5">Balance pending</div>
          <div className="text-xs font-semibold mt-2 text-va-warn">Half-paid orders</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">🏦</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{orders.filter(o => o.paymentType === 'full').length}</div>
          <div className="text-xs text-va-text3 mt-0.5">Fully paid</div>
        </div>
        <div className="bg-white border border-va-border rounded-va px-5 py-[18px] shadow-va relative overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-grad-soft flex items-center justify-center text-lg mb-3">💰</div>
          <div className="font-outfit text-[28px] font-extrabold text-va-text">{orders.filter(o => o.paymentType === 'advance').length}</div>
          <div className="text-xs text-va-text3 mt-0.5">Advance paid</div>
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
                  <td><span className="text-xs bg-va-bg2 px-2 py-[3px] rounded font-semibold">{o.paymentType}</span></td>
                  <td><Badge status={o.status}/></td>
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
  const [orders, setOrders] = useState([]);
  useEffect(() => { getOrders().then(r => setOrders(r.data.orders)).catch(() => {}); }, []);
  return (
    <div className="py-[22px] px-6 flex-1">
      <div className={CARD}>
        <div className={CARD_HEAD}>
          <div className={CARD_TITLE}>Invoices</div>
          <button className={`${BTN_BASE} ${BTN_GHOST} text-xs px-3 py-1.5`}>Export all</button>
        </div>
        <div className={CARD_BODY}>
          {orders.map(o => (
            <div key={o.id} className="flex items-center justify-between py-3 border-b border-va-border last:border-b-0">
              <div>
                <div className="text-[13px] font-semibold">INV-2025-{o.id?.slice(0,8).toUpperCase()}</div>
                <div className="text-xs text-va-text3 mt-0.5">{o.customer?.fullName} · {new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold">{o.currency} {parseFloat(o.totalPrice||0).toLocaleString()}</div>
                <button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM} mt-1`}>Download PDF</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-center text-va-text3 py-8">No invoices yet.</div>}
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
    <div className="py-[22px] px-6 flex-1 max-w-[700px]">
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
