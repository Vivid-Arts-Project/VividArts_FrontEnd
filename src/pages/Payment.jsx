import { useState, useEffect } from 'react';
import { api } from '../api';
import Stepper from '../components/Stepper';

// 💡 1. Notification function එක Import කරගන්න (path එක exact location එකට අනුව)
import { showNotification } from './notifications';
import Icon from '../components/Icon';
import CommissionHeader from '../components/CommissionHeader';

const fallbackOrder = {
  size: { id: 'A3', label: 'A3' },
  frame: { id: 'classic', label: 'Classic' },
  people: 1,
  basePrice: 3500,
  framePrice: 1800,
  peoplePrice: 0,
  deliveryPrice: 500,
  deliveryMethod: 'courier',
  urgentPrice: 0,
  total: 5800,
  deposit: 2900,
}
const currencies = [
  { code: 'LKR', label: 'LKR – Sri Lankan rupee', rate: 1 },
]

function formatMoney(amount, code, rate) {
  const value = Math.round(amount * rate)
  return `${code} ${value.toLocaleString()}`
}

function submitCheckoutForm(actionUrl, fields) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = actionUrl

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

export default function Payment({ order, onBack = () => {}, onComplete = () => {} }) {
  const safeOrder = order || fallbackOrder
  const [currency] = useState(currencies[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get('payment') === 'cancelled'
      ? 'Payment was cancelled. You can try again when you are ready.'
      : null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Your deposit has been received.');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: 'Colombo', city: 'Colombo', country: 'Sri Lanka',
  });

  // Fetch prices on mount
  useEffect(() => {
    api.getPrices()
      .then(data => {
        if (data.success) {
          console.log('Prices loaded:', data.prices);
        }
      })
      .catch(err => console.error('Failed to load prices:', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api.getProfile(token)
      .then((data) => {
        const fullName = (data.full_name || data.username || '').trim();
        const [firstName = '', ...lastNameParts] = fullName.split(/\s+/);
        setCustomerInfo((previous) => ({
          ...previous,
          firstName,
          lastName: lastNameParts.join(' '),
          email: data.email || '',
          phone: data.phone_number || '',
          address: data.address && data.address !== 'N/A' ? data.address : previous.address,
        }));
      })
      .catch((err) => console.error('Failed to load customer profile:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get('order_id');
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'cancelled') {
      // Clear the query params synchronously so React StrictMode's second
      // dev-mode effect invocation doesn't see them and fire this again.
      window.history.replaceState({}, document.title, window.location.pathname);
      // 💡 2. Payment cancel වුණොත් Warning/Error Toast එකක් පෙන්නන්න
      showNotification('warning', 'Payment was cancelled. You can try again.');
      return;
    }

    if (paymentStatus !== 'success' || !returnedOrderId) return;

    // Clear the query params synchronously (see comment above) before any
    // async work, so a StrictMode double-invoke can't show this twice.
    window.history.replaceState({}, document.title, window.location.pathname);

    Promise.resolve()
      .then(() => setIsProcessing(true))
      .then(() => import.meta.env.DEV ? api.confirmSandboxReturn(returnedOrderId) : undefined)
      .then(() => api.getPaymentStatus(returnedOrderId))
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error || 'Unable to read payment status');
        }

        setOrderId(result.payment.orderId);
        
        const msg = result.payment.status === 'completed'
          ? 'Your PayHere payment has been confirmed.'
          : 'Your PayHere payment was submitted. We will confirm it as soon as PayHere sends the notification.';
        
        setSuccessMessage(msg);
        setShowConfirmation(true);

        // 💡 3. Payment එක සාර්ථක වුණාම Auto Payment Success Toast එක පෙන්නන්න
        showNotification('payment_success', msg);
      })
      .catch((err) => {
        const errText = err.message || 'Unable to check payment status. Please contact support.';
        setError(errText);
        // 💡 4. Error එකක් ආවොත් Error Toast එක පෙන්නන්න
        showNotification('error', errText);
      })
      .finally(() => setIsProcessing(false));
  }, []);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await api.createPayhereCheckout({
        currency: currency.code,
        order: {
          sizeId: safeOrder.sizeId || safeOrder.size?.id,
          frameId: safeOrder.frameId || safeOrder.frame?.id,
          people: safeOrder.people,
          deliveryMethod: safeOrder.deliveryMethod || 'courier',
          deliveryAddress: safeOrder.deliveryMethod === 'courier' ? safeOrder.deliveryAddress : null,
          urgent: safeOrder.urgent === true,
          urgentDeadline: safeOrder.urgent ? safeOrder.urgentDeadline : null,
          notes: safeOrder.notes || ''
        },
        customer: {
          ...customerInfo,
          address: safeOrder.deliveryMethod === 'courier' && safeOrder.deliveryAddress
            ? safeOrder.deliveryAddress
            : customerInfo.address,
        }
      });

      if (!result.success || !result.checkoutUrl || !result.checkoutFields) {
        throw new Error(result.error || 'Failed to start PayHere checkout');
      }

      setOrderId(result.orderId);
      submitCheckoutForm(result.checkoutUrl, result.checkoutFields);
    } catch (err) {
      const errText = err.message || 'Payment failed. Please try again.';
      setError(errText);
      // 💡 5. PayHere Redirect වෙන්න කලින් error එකක් ආවොත් Toast එක පෙන්නන්න
      showNotification('error', errText);
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  const total = safeOrder.total
  const dueAmount = safeOrder.deposit
  const displayValue = (amount) => formatMoney(amount, currency.code, currency.rate)

  if (showConfirmation) {
    return (
      <div className="max-w-[980px] mx-auto px-[18px] py-7">
        <CommissionHeader onBack={() => setShowConfirmation(false)} onHome={onComplete} />
        <Stepper current={4} />

        <div className="bg-white rounded-[18px] border border-black/10 text-[#222] text-center p-6 sm:p-10">
          <div className="payment-success-check" role="img" aria-label="Payment completed successfully">
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle className="payment-success-check__circle" cx="40" cy="40" r="32" />
              <path className="payment-success-check__tick" d="M24 41.5l10.5 10.5L57 27.5" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-[#4b5563]">
            {successMessage}
          </p>
          <p className="text-[#4b5563] mt-[10px]">
            Order ID: {orderId || 'Processing...'}
          </p>
          {orderId && successMessage === 'Your PayHere payment has been confirmed.' && (
            <a
              href={api.getInvoiceUrl(orderId)}
              className="mt-[10px] inline-flex w-full min-w-0 items-center justify-center rounded-full border border-[#9fe3c5] bg-gradient-to-br from-[#f4fff9] to-[#eafff5] px-5 py-3 font-semibold text-[#087a57] shadow-[0_12px_28px_rgba(5,150,105,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#50c894] hover:shadow-[0_18px_36px_rgba(5,150,105,0.2)] sm:w-auto sm:min-w-[230px] sm:px-[30px]"
            >
              Download Invoice (PDF)
            </a>
          )}
          <br />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              className="w-full min-w-0 rounded-full px-5 py-3 cursor-pointer transition-all border border-[#cfc8ff] bg-gradient-to-br from-[#f7f5ff] to-[#edf8ff] text-[#5a3fbb] font-semibold shadow-[0_12px_28px_rgba(91,63,168,0.12)] hover:-translate-y-0.5 hover:border-[#8b7cff] hover:shadow-[0_18px_36px_rgba(91,63,168,0.2)] sm:w-auto sm:min-w-[190px] sm:px-[30px]"
              onClick={() => onComplete()}
            >
              Go to Home Page
            </button>
            <button
              className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-full border border-[#cfc8ff] bg-gradient-to-br from-[#f7f5ff] to-[#edf8ff] px-5 py-3 font-semibold text-[#5a3fbb] shadow-[0_12px_28px_rgba(91,63,168,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#8b7cff] hover:shadow-[0_18px_36px_rgba(91,63,168,0.2)] sm:w-auto sm:min-w-[190px] sm:px-[30px]"
              onClick={() => setShowConfirmation(false)}
            >
              <Icon name="arrowLeft" size={18}/>
              Back to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[980px] mx-auto px-[18px] py-7">
      <CommissionHeader onBack={onBack} onHome={onComplete} />

      <Stepper current={3} />

      <main className="grid grid-cols-[1fr_340px] max-[720px]:grid-cols-1 gap-5 items-start">
        <div>
          <div className="mb-4 rounded-[18px] border border-black/10 bg-white p-4 text-[#222] sm:p-6">
            <div className="text-sm font-semibold text-[#1a1a2e] mb-[18px] flex items-center flex-wrap gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7f77dd] shrink-0"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Payment method
              <span className="ml-auto inline-flex items-center gap-1 bg-[#f2efff] text-[#534ab7] text-[11px] font-medium px-[10px] py-[3px] rounded-full whitespace-nowrap">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                SSL secured
              </span>
            </div>

            <div className="mb-[22px]">
              <div className="border-[1.5px] rounded-xl px-[14px] py-[13px] flex items-center gap-[11px] bg-white border-[#534ab7] bg-[#f0efff]">
                <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[#534ab7] shrink-0 bg-[#e7e1ff]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a2e]">Bank card</div>
                  <div className="text-[11px] text-[#8f8eab] mt-px">Visa, Mastercard</div>
                </div>
              </div>
            </div>

            <div>
              <div className="relative overflow-hidden bg-[#1b1546] rounded-[18px] px-6 py-[22px] mb-[22px] before:content-[''] before:absolute before:-top-10 before:-right-10 before:w-[130px] before:h-[130px] before:rounded-full before:bg-[rgba(127,119,221,0.18)] after:content-[''] after:absolute after:-bottom-[50px] after:left-0 after:w-[110px] after:h-[110px] after:rounded-full after:bg-[rgba(127,119,221,0.1)]">
                <div className="w-[34px] h-[26px] rounded-md bg-[#ef9f27] mb-5"></div>
                <div className="mb-4 font-mono text-sm font-medium tracking-[2px] text-white sm:text-base sm:tracking-[3px]">Secure PayHere checkout</div>
                <div className="flex flex-wrap justify-between items-end gap-x-4 gap-y-3">
                  <div className="shrink-0">
                    <div className="text-[10px] text-white/65 uppercase tracking-[1px] mb-[3px] whitespace-nowrap">Provider</div>
                    <div className="text-[13px] text-white font-medium whitespace-nowrap">PayHere</div>
                  </div>
                  <div className="shrink-0">
                    <div className="text-[10px] text-white/65 uppercase tracking-[1px] mb-[3px] whitespace-nowrap">Cards</div>
                    <div className="text-[13px] text-white font-medium whitespace-nowrap">Visa / Mastercard</div>
                  </div>
                  <div className="text-white/60 hidden sm:block shrink-0 ml-auto">
                    <svg width="36" height="22" viewBox="0 0 36 22" fill="none" className="block"><circle cx="13" cy="11" r="10" fill="rgba(255,255,255,0.25)"/><circle cx="23" cy="11" r="10" fill="rgba(255,255,255,0.15)"/></svg>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#8f8eab] mt-[14px] text-center">
                Card details are entered only on PayHere's secure checkout page.
              </p>
            </div>

            {error && <div className="text-red-600 mb-3">{error}</div>}
            <button className="w-full bg-[#534ab7] text-white rounded-xl py-[14px] text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all mt-2 hover:bg-[#3c3489] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed" type="button" onClick={handlePay} disabled={isProcessing}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              {isProcessing ? 'Processing…' : `Pay ${formatMoney(dueAmount, currency.code, currency.rate)} now`}
            </button>

            <div className="flex gap-4 justify-center mt-[14px] flex-wrap">
              <div className="flex items-center gap-[5px] text-[11px] text-[#8f8eab]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                256-bit encryption
              </div>
              <div className="flex items-center gap-[5px] text-[11px] text-[#8f8eab]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                PCI DSS compliant
              </div>
              <div className="flex items-center gap-[5px] text-[11px] text-[#8f8eab]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Refund policy
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-5 max-[720px]:static">
          <div className="mb-4 rounded-[18px] border border-black/10 bg-white p-4 text-[#222] sm:p-6">
            <div className="text-sm font-semibold text-[#1a1a2e] mb-[18px] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7f77dd] shrink-0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Order summary
            </div>
            <div className="flex items-center gap-3 mb-[18px]">
              <div className="w-[52px] h-[52px] rounded-[14px] bg-[#f0efff] flex items-center justify-center text-[#534ab7]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div>
                <div className="text-sm font-medium">Pencil portrait commission</div>
                <div className="text-xs text-[#6b6b80] mt-0.5">
                  {safeOrder.size.label} · {safeOrder.people} subject{safeOrder.people > 1 ? 's' : ''} · {safeOrder.frame.label} frame
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Base price ({safeOrder.size.label})</span><span className="font-medium">{displayValue(safeOrder.basePrice)}</span></div>
              {safeOrder.framePrice > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">{safeOrder.frame.label} frame</span><span className="font-medium">{displayValue(safeOrder.framePrice)}</span></div>
              )}
              {safeOrder.peoplePrice > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Extra subjects</span><span className="font-medium">{displayValue(safeOrder.peoplePrice)}</span></div>
              )}
              {safeOrder.deliveryPrice > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Delivery charge</span><span className="font-medium">{displayValue(safeOrder.deliveryPrice)}</span></div>
              )}
              {safeOrder.urgentPrice > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Urgent order</span><span className="font-medium">{displayValue(safeOrder.urgentPrice)}</span></div>
              )}
              {safeOrder.urgent && safeOrder.urgentDeadline && (
                <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Requested by</span><span className="font-medium">{new Date(`${safeOrder.urgentDeadline}T00:00:00`).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Delivery</span><span className="font-medium">{safeOrder.deliveryMethod === 'pickup' ? 'Pickup' : 'Courier'}</span></div>
              {safeOrder.deliveryMethod === 'courier' && safeOrder.deliveryAddress && (
                <div className="flex justify-between gap-4 py-2 border-b border-black/[0.06] text-[13px]"><span className="shrink-0 text-[#6b6b80]">Address</span><span className="text-right font-medium">{safeOrder.deliveryAddress}</span></div>
              )}
            </div>

            <div className="flex justify-between items-center mt-[14px] pt-[14px] border-t-[1.5px] border-[rgba(83,74,183,0.18)]">
              <span className="text-sm font-medium">Total</span>
              <span className="text-[22px] font-semibold text-[#534ab7]">{displayValue(total)}</span>
            </div>

            <div className="bg-[#f0efff] rounded-[14px] px-[14px] py-3 my-[14px] flex gap-[10px] text-xs text-[#534ab7] leading-normal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              A 50% deposit is required to begin. The remaining balance is due after you approve the proof image.
            </div>

            <div className="flex justify-between items-center bg-[#f6f2ff] rounded-[14px] px-[14px] py-[11px]">
              <span className="text-xs font-medium text-[#534ab7]">Due now (50% deposit)</span>
              <span className="text-base font-semibold text-[#534ab7]">{displayValue(dueAmount)}</span>
            </div>
          </div>

          <div className="mb-4 rounded-[18px] border border-black/10 bg-white p-4 text-[#222] sm:p-6">
            <div className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7f77dd] shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Estimated timeline
            </div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Queue position</span><span className="text-[#534ab7] font-medium">#3</span></div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Sketching starts</span><span className="text-[#534ab7] font-medium">~3 days</span></div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Delivery estimate</span><span className="text-[#534ab7] font-medium">7–10 working days</span></div>
          </div>

        </div>
      </main>
    </div>
  )
}
