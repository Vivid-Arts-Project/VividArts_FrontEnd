import { useState, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import { STATUS_MAP } from '../components/statusConfig';
import { getOrders, updateStatus, sendMessage, setLocation, uploadProof, referencePhotoDownloadUrl } from '../api/adminApi';
import { useNavigate } from '../router';

const STAGE_ORDER = ['in_queue','sketching','waiting_for_feedback','approved','framed','shipped','done'];
const BASE_STAGES = [
  { key: 'in_queue',             label: 'Queued'          },
  { key: 'sketching',            label: 'Sketching'       },
  { key: 'waiting_for_feedback', label: 'Waiting for feedback or approval' },
  { key: 'approved',             label: 'Proof approved — continue artwork' },
];

const BTN_FILL  = 'bg-grad text-white border-transparent hover:opacity-90';
const BTN_GHOST = 'bg-transparent text-va-text3 border-va-border hover:border-va-text3 hover:text-va-text';
const BTN_DANGER = 'bg-transparent text-va-danger border-red-300 hover:bg-va-danger-bg';
const BTN_BASE  = 'rounded-md text-xs font-semibold cursor-pointer border font-sans transition-all px-3 py-1.5';
const BTN_SM    = 'px-2.5 py-[5px] text-[11px]';
const FIELD_INPUT = 'w-full border border-va-border rounded-lg px-3 py-2.5 font-sans text-sm text-va-text bg-va-bg outline-none transition-colors focus:border-va-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(43,143,224,0.1)]';

const FRAME_LABELS = {
  without_frame: 'No Frame',
  plastic_frame: 'Classic',
  wooden_frame: 'Premium',
};

const getFrameLabel = (frameType) => FRAME_LABELS[frameType] || frameType?.replace(/_/g, ' ') || '—';

// ── Detail Panel ──────────────────────────────────────────────────────────────
export function DetailPanel({ order, onClose, onStatusSaved, onToast, onCancel, businessAddress = '' }) {
  const [status, setStatus]     = useState(order.status);
  const [saving, setSaving]     = useState(false);
  const [chatMsg, setChatMsg]   = useState('');
  const [location, setLoc]      = useState(order.artistLocation || '');
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const effectiveStatus = order.status === 'finished' ? 'approved' : order.status;
  const curIdx = STAGE_ORDER.indexOf(effectiveStatus);
  const stages = [
    ...BASE_STAGES,
    ...(order.frameType && order.frameType !== 'without_frame' ? [{ key: 'framed', label: 'Framed' }] : []),
    ...(order.pickupOption === 'courier' ? [{ key: 'shipped', label: 'Shipped' }] : []),
    { key: 'done', label: 'Done' },
  ];
  const statusOptions = (() => {
    if (effectiveStatus === 'in_queue') return [['in_queue', 'Queued'], ['sketching', 'Sketching']];
    if (effectiveStatus === 'sketching') return [['sketching', 'Sketching — upload a proof when ready']];
    if (effectiveStatus === 'revision_requested') return [['revision_requested', 'Revision requested — upload a new proof']];
    if (effectiveStatus === 'waiting_for_feedback') return [['waiting_for_feedback', 'Waiting for customer feedback or approval']];
    if (effectiveStatus === 'approved') {
      if (order.frameType && order.frameType !== 'without_frame') return [['approved', 'Approved & Finished'], ['framed', 'Framed']];
      if (order.pickupOption === 'courier') return [['approved', 'Approved & Finished'], ['shipped', 'Shipped']];
      return [['approved', 'Approved & Finished'], ['done', 'Done']];
    }
    if (effectiveStatus === 'framed') return order.pickupOption === 'courier' ? [['framed', 'Framed'], ['shipped', 'Shipped']] : [['framed', 'Framed'], ['done', 'Done']];
    if (effectiveStatus === 'shipped') return [['shipped', 'Shipped'], ['done', 'Done']];
    return [['done', 'Done']];
  })();

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
      onStatusSaved();
    } catch { onToast('Failed to save location'); }
  };

  const handleUseBusinessLocation = async () => {
    try {
      await setLocation(order.id, '');
      setLoc('');
      onToast('Business pickup location restored');
      onStatusSaved();
    } catch { onToast('Failed to restore business location'); }
  };

  const handleProofUpload = async () => {
    if (!proofFile || uploadingProof) return;
    if (!proofFile.type.startsWith('image/')) return onToast('Please select a JPG or PNG image');
    if (proofFile.size > 10 * 1024 * 1024) return onToast('Proof image must be 10 MB or smaller');
    setUploadingProof(true);
    try {
      await uploadProof(order.id, proofFile);
      setProofFile(null);
      onToast(`Proof sent to ${order.customer?.fullName || 'client'} — awaiting approval`);
      onStatusSaved();
    } catch (error) {
      onToast(error.response?.data?.error || 'Proof upload failed');
    } finally { setUploadingProof(false); }
  };

  const messages = order.messages || [];

  return (
    <div className="flex min-h-full w-full flex-col bg-va-bg">
      <div className="px-[18px] py-4 border-b border-va-border flex items-center justify-between sticky top-0 z-10 bg-white">
        <div>
          <div className="font-outfit text-[13px] font-bold">Order #{order.id?.slice(0,8)}</div>
          <div className="mt-1"><Badge status={order.status}/></div>
        </div>
        <button type="button" aria-label="Close order details" className="text-lg text-va-text3 cursor-pointer leading-none px-1.5 py-0.5 rounded border-none bg-transparent hover:bg-va-bg2 hover:text-va-text" onClick={onClose}>×</button>
      </div>

      <div className="grid flex-1 items-start gap-5 px-3 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-6">
        <div className="contents lg:block lg:rounded-va lg:border lg:border-va-border lg:bg-white lg:p-5 lg:shadow-va">
        {/* Order Details */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Order Details</div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Client</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.customer?.fullName}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Paper</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.paperSize}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Subjects</span><span className="font-semibold text-va-text text-right max-w-[60%]">{order.subjectCount?.replace(/_/g,' ')}</span></div>
          <div className="flex justify-between items-start mb-2 text-xs"><span className="text-va-text3">Frame</span><span className="font-semibold text-va-text text-right max-w-[60%]">{getFrameLabel(order.frameType)}</span></div>
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
          {order.customerNote && (
            <div className="mt-3 rounded-lg border border-red-200 bg-va-danger-bg px-3 py-2.5 text-xs">
              <div className="mb-1 font-bold text-va-text">Special instructions</div>
              <div className="whitespace-pre-wrap leading-relaxed text-va-text2">{order.customerNote}</div>
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Progress</div>
          <div className="flex flex-col">
            {stages.map((st, i) => {
              const stIdx = STAGE_ORDER.indexOf(st.key);
              const isDone   = stIdx < curIdx;
              const isActive = st.key === effectiveStatus;
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {order.referencePhotos.map((url, i) => (
                <div key={url} className="overflow-hidden rounded-lg border border-va-border bg-va-bg">
                  <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Reference ${i + 1}`} className="h-36 w-full object-cover"/></a>
                  <a href={referencePhotoDownloadUrl(order.id, i)} className={`${BTN_BASE} ${BTN_GHOST} m-2 flex items-center justify-center gap-1.5 no-underline`}>
                    <Icon name="download" size={14}/> Download reference {i + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proof upload */}
        <div className="mb-5 pb-5 border-b border-va-border">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Proof Upload</div>
          {order.proofImagePath ? (
            <>
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
          ) : <div className="mb-3 text-xs text-va-text3">No proof has been uploaded for this order yet.</div>}
          <div className="rounded-lg border border-blue-200 bg-va-info-bg px-3 py-2.5 text-xs text-va-info">Uploading sends the proof to the customer and changes the order to waiting for feedback.</div>
          <label className="mt-3 block cursor-pointer rounded-lg border-[1.5px] border-dashed border-va-border2 bg-va-bg px-3.5 py-5 text-center transition-all hover:border-va-blue hover:bg-va-info-bg">
            <input type="file" accept="image/jpeg,image/png" className="hidden" disabled={uploadingProof} onChange={e => setProofFile(e.target.files?.[0] || null)}/>
            <Icon name="upload" size={26} className="mx-auto mb-1.5 text-va-purple"/>
            <div className="text-xs font-semibold text-va-text">{proofFile ? proofFile.name : order.proofImagePath ? 'Choose a replacement proof' : 'Choose proof image'}</div>
            <div className="mt-1 text-[11px] text-va-text3">JPG or PNG · Max 10 MB</div>
          </label>
          {proofFile && <button className={`${BTN_BASE} ${BTN_FILL} mt-2 w-full py-[9px] text-[13px]`} disabled={uploadingProof} onClick={handleProofUpload}>{uploadingProof ? 'Uploading…' : 'Upload and send proof'}</button>}
        </div>

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
                {STATUS_MAP[status]?.label || String(status || '').replaceAll('_', ' ')}
              </span>
              <span className={`text-va-text3 transition-transform ${statusMenuOpen ? 'rotate-90' : ''}`}>›</span>
            </button>
            {statusMenuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-lg border border-va-border bg-white p-1.5 shadow-[0_12px_30px_rgba(27,22,62,0.16)]">
                {statusOptions.map(([value, label]) => (
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
        {order.pickupOption === 'pickup' ? (
          <div className="mb-5 pb-5 border-b border-va-border">
            <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Pickup Location</div>
            {businessAddress && <div className="mb-3 rounded-lg border border-va-border bg-va-bg px-3 py-2.5 text-xs leading-relaxed"><span className="font-bold text-va-text">Business pickup location</span><div className="mt-1 whitespace-pre-wrap text-va-text2">{businessAddress}</div></div>}
            {!businessAddress && <div className="mb-3 rounded-lg bg-va-info-bg px-3 py-2.5 text-xs text-va-text2">No business pickup location is saved. Add one in Settings, or enter an address for this order below.</div>}
            <label className="mb-1.5 block text-xs font-semibold text-va-text">Different location for this order only</label>
            <textarea className={`${FIELD_INPUT} resize-y min-h-[80px]`} rows={2} value={location} onChange={e => setLoc(e.target.value)} placeholder="Enter another address or Google Maps link (optional)"/>
            <div className="mt-1.5 flex items-center gap-2"><button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} onClick={handleSaveLocation}>Save order location</button>{order.artistLocation && <button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} onClick={handleUseBusinessLocation}>Use business location</button>}</div>
          </div>
        ) : (
          <div className="mb-5 pb-5 border-b border-va-border">
            <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Delivery</div>
            <div className="rounded-lg bg-va-info-bg px-3 py-2.5 text-xs text-va-text2">This customer selected courier delivery, so a pickup location is not required.</div>
            <div className="mt-3 text-xs"><span className="font-semibold text-va-text">Delivery address</span><div className="mt-1 whitespace-pre-wrap text-va-text2">{order.customer?.address || 'No delivery address is available. Contact the client using chat.'}</div></div>
          </div>
        )}

        </div>

        {/* Chat */}
        <div className="mb-5 rounded-va border border-va-border bg-white p-4 shadow-va lg:sticky lg:top-[84px] lg:col-start-2 lg:row-start-1">
          <div className="text-[11px] font-bold text-va-text3 tracking-wide uppercase mb-3">Chat</div>
          <div className="h-[360px] overflow-y-auto bg-va-bg rounded-lg p-3 mb-2 flex flex-col gap-2">
            {messages.length === 0 && <div className="text-xs text-va-text3">No messages yet.</div>}
            {messages.map((m, i) => {
              const isRevision = m.senderType === 'system' && m.message.toLowerCase().includes('requested changes');
              const isSystem = m.senderType === 'system' && !isRevision;
              return (
              <div key={m.message_id || i} className={`max-w-[82%] ${m.senderType === 'admin' ? 'self-end' : isSystem || isRevision ? 'self-center' : 'self-start'}`}>
                <div className={`px-3 py-[7px] rounded-2xl text-xs leading-relaxed ${
                  m.senderType === 'admin'
                    ? 'bg-va-blue text-white'
                    : isRevision
                      ? 'border border-orange-300 bg-va-warn-bg text-va-warn'
                      : isSystem
                        ? 'border border-va-border bg-white text-va-text3'
                      : 'bg-white text-va-text border border-va-border'
                }`}>
                  {m.message}
                </div>
                <div className={`mt-1 text-[9px] font-semibold uppercase tracking-wide text-va-text3 ${m.senderType === 'admin' ? 'text-right' : isSystem || isRevision ? 'text-center' : ''}`}>{m.senderType === 'admin' ? 'You' : isRevision ? 'Revision request' : isSystem ? 'Order update' : 'Customer'}</div>
              </div>
            );})}
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
          <button type="button" className={`${BTN_BASE} ${BTN_DANGER} w-full py-[9px] text-[13px]`} onClick={onCancel}>
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────
export default function OrdersPage({ search, onToast }) {
  const navigate = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('active');

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
      filter === 'active' ? o.status !== 'done' :
      filter === 'completed' ? o.status === 'done' :
      filter === 'sketch' ? o.status === 'sketching' :
      filter === 'proof'  ? o.status === 'waiting_for_feedback' :
      filter === 'revision' ? o.status === 'revision_requested' :
      filter === 'approved' ? ['approved', 'finished'].includes(o.status) : true;
    return matchSearch && matchFilter;
  });

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
            <div className="font-outfit text-sm font-bold text-va-text">{filter === 'completed' ? 'Completed Orders' : 'Active Production Queue'}</div>
            <div className="flex gap-1.5 flex-wrap">
              {[['active','Active'],['sketch','Sketching'],['proof','Proof Sent'],['revision','Revision'],['approved','Approved'],['completed','Done']].map(([f, l]) => (
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
                      className={`cursor-pointer transition-colors [&>td]:px-3.5 [&>td]:py-3 [&>td]:border-b [&>td]:text-[13px] [&>td]:align-middle ${['approved', 'finished'].includes(o.status) ? '[&>td]:border-emerald-200 [&>td]:bg-emerald-50/70 hover:[&>td]:bg-emerald-100/70' : '[&>td]:border-va-border hover:[&>td]:bg-va-bg'}`}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
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
                      <td><div className="flex flex-col items-start gap-1"><Badge status={o.status}/>{['approved', 'finished'].includes(o.status) && <span className="text-[10px] font-bold text-emerald-700">Ready for next step</span>}</div></td>
                      <td>
                        <div className="flex gap-[5px]">
                          <button className={`${BTN_BASE} ${BTN_FILL} ${BTN_SM}`} onClick={e => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`); }}>Manage</button>
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

    </div>
  );
}
