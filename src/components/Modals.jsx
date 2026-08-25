import { useState } from 'react';

const BTN_BASE   = 'rounded-md text-xs font-semibold cursor-pointer border font-sans transition-all px-3 py-1.5';
const BTN_FILL   = 'bg-grad text-white border-transparent hover:opacity-90';
const BTN_GHOST  = 'bg-transparent text-va-text3 border-va-border hover:border-va-text3 hover:text-va-text';
const BTN_DANGER = 'bg-transparent text-va-danger border-red-300 hover:bg-va-danger-bg';

const FIELD       = 'mb-4';
const FIELD_LABEL = 'text-xs font-semibold text-va-text block mb-1.5';
const FIELD_INPUT = 'w-full border border-va-border rounded-lg px-3 py-2.5 font-sans text-sm text-va-text bg-va-bg outline-none transition-colors focus:border-va-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(43,143,224,0.1)]';

const MODAL_OVERLAY = 'fixed inset-0 bg-[rgba(18,16,42,0.5)] flex items-center justify-center z-[1000] p-3 sm:p-4';
const MODAL         = 'bg-white rounded-va w-[440px] max-w-full max-h-[calc(100dvh-1.5rem)] shadow-va-md overflow-y-auto sm:max-h-[calc(100dvh-2rem)]';
const MODAL_HEAD    = 'px-[22px] py-[18px] border-b border-va-border flex items-center justify-between';
const MODAL_TITLE   = 'font-outfit text-[15px] font-bold text-va-text';
const MODAL_CLOSE   = 'text-xl text-va-text3 cursor-pointer leading-none px-1.5 py-0.5 rounded border-none bg-transparent hover:bg-va-bg2';
const MODAL_BODY    = 'px-[22px] py-5';
const MODAL_FOOT    = 'px-[22px] py-3.5 border-t border-va-border flex gap-2 justify-end';

// ── Cancel Order Modal ────────────────────────────────────────────────────────
export function CancelModal({ order, onClose, onConfirm, busy = false }) {
  const [reason, setReason] = useState('');
  if (!order) return null;
  return (
    <div className={MODAL_OVERLAY} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        <div className={MODAL_HEAD}>
          <div className={MODAL_TITLE}>Cancel Order</div>
          <button type="button" aria-label="Close modal" className={MODAL_CLOSE} onClick={onClose}>×</button>
        </div>
        <div className={MODAL_BODY}>
          <div className="rounded-lg px-3.5 py-2.5 text-sm flex gap-2 items-start mb-3.5 bg-va-warn-bg border border-orange-300 text-va-warn">⚠️ The order will stop, but its payment and activity history will be retained.</div>
          <p className="text-[13px] text-va-text2 leading-[1.7]">
            Are you sure you want to cancel order <strong>#{order.id?.slice(0,8)}</strong> for{' '}
            <strong>{order.customer?.fullName || 'this client'}</strong>? The client will be notified automatically.
          </p>
          <div className="mt-3.5 mb-0">
            <label className={FIELD_LABEL}>Reason for cancellation <span className="text-va-danger">*</span></label>
            <textarea
              className={`${FIELD_INPUT} resize-y min-h-[80px]`}
              placeholder="e.g. Reference photo is too low resolution to proceed…"
              value={reason}
              maxLength={500}
              required
              onChange={e => setReason(e.target.value)}
            />
            <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px]"><span className={reason.trim() ? 'text-va-text3' : 'text-va-danger'}>{reason.trim() ? 'This reason will be sent to the customer.' : 'A cancellation reason is required.'}</span><span className="shrink-0 text-va-text3">{reason.length}/500</span></div>
          </div>
        </div>
        <div className={MODAL_FOOT}>
          <button className={`${BTN_BASE} ${BTN_GHOST}`} disabled={busy} onClick={onClose}>Keep order</button>
          <button className={`${BTN_BASE} ${BTN_DANGER} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-45`} disabled={busy || !reason.trim()} onClick={() => onConfirm(reason.trim())}>
            {busy ? 'Cancelling…' : 'Cancel order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Order Modal ───────────────────────────────────────────────────────────
export function NewOrderModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    paperSize: 'A3', frameType: 'without_frame',
    subjectCount: 'one', note: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className={MODAL_OVERLAY} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        <div className={MODAL_HEAD}>
          <div className={MODAL_TITLE}>Add Order Manually</div>
          <button className={MODAL_CLOSE} onClick={onClose}>×</button>
        </div>
        <div className={MODAL_BODY}>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className={FIELD}>
              <label className={FIELD_LABEL}>Client Name</label>
              <input className={FIELD_INPUT} placeholder="Full name" value={form.fullName} onChange={e => set('fullName', e.target.value)}/>
            </div>
            <div className={FIELD}>
              <label className={FIELD_LABEL}>Phone</label>
              <input className={FIELD_INPUT} placeholder="+94 77 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)}/>
            </div>
          </div>
          <div className={FIELD}>
            <label className={FIELD_LABEL}>Email</label>
            <input className={FIELD_INPUT} placeholder="client@email.com" value={form.email} onChange={e => set('email', e.target.value)}/>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className={FIELD}>
              <label className={FIELD_LABEL}>Paper Size</label>
              <select className={FIELD_INPUT} value={form.paperSize} onChange={e => set('paperSize', e.target.value)}>
                <option value="A3">A3 — LKR 3,800</option>
                <option value="A4">A4 — LKR 2,500</option>
              </select>
            </div>
            <div className={FIELD}>
              <label className={FIELD_LABEL}>Frame</label>
              <select className={FIELD_INPUT} value={form.frameType} onChange={e => set('frameType', e.target.value)}>
                <option value="without_frame">No Frame</option>
                <option value="plastic_frame">Classic (+LKR 800)</option>
                <option value="wooden_frame">Premium (+LKR 1,500)</option>
              </select>
            </div>
          </div>
          <div className={FIELD}>
            <label className={FIELD_LABEL}>Number of Subjects</label>
            <select className={FIELD_INPUT} value={form.subjectCount} onChange={e => set('subjectCount', e.target.value)}>
              <option value="one">1 person</option>
              <option value="two">2 people</option>
              <option value="more_than_two">More than 2</option>
            </select>
          </div>
          <div className="mb-0">
            <label className={FIELD_LABEL}>Special Instructions</label>
            <textarea className={`${FIELD_INPUT} resize-y min-h-[80px]`} placeholder="Any notes from the client…" value={form.note} onChange={e => set('note', e.target.value)}/>
          </div>
        </div>
        <div className={MODAL_FOOT}>
          <button className={`${BTN_BASE} ${BTN_GHOST}`} onClick={onClose}>Cancel</button>
          <button className={`${BTN_BASE} ${BTN_FILL} px-4 py-2`} onClick={() => onSubmit(form)}>
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
}
