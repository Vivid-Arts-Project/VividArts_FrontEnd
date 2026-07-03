import { useState, useEffect } from 'react';
import { api } from '../api';

const prices = { base: 3800, frame: 800, people: 500 }
const bankOptions = ['Commercial Bank', 'Sampath Bank', 'BOC', 'HNB', "People's Bank", 'NTB', 'NSB', 'Pan Asia Bank', 'Union Bank', 'Seylan Bank', 'DFCC Bank', 'Standard Chartered', 'Citibank', 'HSBC', 'Amex',]
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

export default function Payment({ onBack = () => {}, onComplete = () => {} }) {
  const [currency] = useState(currencies[0])
  const [method, setMethod] = useState('card')
  const [bank, setBank] = useState(bankOptions[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get('payment') === 'cancelled'
      ? 'Payment was cancelled. You can try again when you are ready.'
      : null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Your deposit has been received.');


 // Fetch prices on mount
  useEffect(() => {
    api.getPrices()
      .then(data => {
        if (data.success) {
          // Update prices if needed
          console.log('Prices loaded:', data.prices);
        }
      })
      .catch(err => console.error('Failed to load prices:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get('order_id');
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'cancelled') {
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (paymentStatus !== 'success' || !returnedOrderId) return;

    Promise.resolve()
      .then(() => setIsProcessing(true))
      .then(() => api.getPaymentStatus(returnedOrderId))
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error || 'Unable to read payment status');
        }

        setOrderId(result.payment.orderId)
        setSuccessMessage(
          result.payment.status === 'completed'
            ? 'Your PayHere payment has been confirmed.'
            : 'Your PayHere payment was submitted. We will confirm it as soon as PayHere sends the notification.'
        )
        setShowConfirmation(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      .catch((err) => {
        setError(err.message || 'Unable to check payment status. Please contact support.');
      })
      .finally(() => setIsProcessing(false));
  }, []);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (method === 'card') {
        const result = await api.createPayhereCheckout({
          currency: currency.code,
          customer: {
            firstName: 'Vivid',
            lastName: 'Arts',
            email: 'customer@example.com',
            phone: '0771234567',
            address: 'Colombo',
            city: 'Colombo',
            country: 'Sri Lanka'
          }
        });

        if (!result.success || !result.checkoutUrl || !result.checkoutFields) {
          throw new Error(result.error || 'Failed to start PayHere checkout');
        }

        setOrderId(result.orderId);
        submitCheckoutForm(result.checkoutUrl, result.checkoutFields);
        return;
      }

      // Step 1: Create order first if not exists
      let currentOrderId = orderId;

      if (!currentOrderId) {
        const orderData = {
          currency: currency.code,
          paymentMethod: method,
          bankDetails: method === 'bank' ? {
            bankName: bank
          } : null
        };

        const orderResult = await api.createPaymentOrder(orderData);
        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Failed to create order');
        }
        currentOrderId = orderResult.payment.orderId;
        setOrderId(currentOrderId);
      }

      // Step 2: Process payment
      const paymentData = {
        orderId: currentOrderId,
        amount: dueAmount,
        currency: currency.code,
        paymentMethod: method,
        ...(method === 'bank' && {
          bankDetails: {
            bankName: bank
          }
        })
      };

      const result = await api.processPayment(paymentData);

      if (result.success) {
        // Payment successful
        setSuccessMessage('Your bank transfer has been recorded.');
        setShowConfirmation(true);
        setIsProcessing(false);
        return;}

      else {
        setError(result.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = prices.base + prices.frame + prices.people
  const dueAmount = Math.round(total * 0.5)
  const displayValue = (amount) => formatMoney(amount, currency.code, currency.rate)

  if (showConfirmation) {
    return (
      <div className="max-w-[980px] mx-auto p-[18px]">
        <div className="bg-white rounded-[18px] border border-black/10 text-[#222] text-center p-10">
          <div className="text-[60px] mb-5">✅</div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-[#b5b0d3]">
            {successMessage}
          </p>
          <p className="text-[#b5b0d3] mt-[10px]">
            Order ID: {orderId || 'Processing...'}
          </p>
          <button
            className="border-none rounded-full px-6 py-[14px] cursor-pointer transition-all bg-gradient-to-br from-[#7f6cff] to-[#5cd1ff] text-white shadow-[0_18px_40px_rgba(92,209,255,0.22)] hover:-translate-y-px mt-5 px-[30px] py-3"
            onClick={() => onComplete()}
          >
            Go to Dashboard
          </button>
          <button
            className="border border-white/[0.16] rounded-full px-6 py-[14px] cursor-pointer transition-colors bg-transparent text-[#e7e3f5] hover:bg-white/[0.08] mt-[10px]"
            onClick={() => setShowConfirmation(false)}
          >
            Back to Payment
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-[980px] mx-auto p-[18px]">
      <header className="h-[88px] max-[720px]:h-auto bg-white flex items-center justify-between px-14 max-[720px]:px-4 max-[720px]:py-[14px] border-b border-[#e7e2ff] mb-[18px] max-[720px]:flex-wrap">
        <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4da3ff] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold">M</div>
            <span className="text-xl font-extrabold text-gray-900 tracking-[-0.5px]">VIVID ARTS</span>
        </div>

        <nav className="flex gap-6 max-[720px]:hidden">
            <a href="#" className="text-[#5a3fbb] text-base font-bold bg-[rgba(109,91,255,0.12)] px-[18px] py-[10px] rounded-full transition-colors hover:text-[#3c2ca8] hover:bg-[rgba(109,91,255,0.18)]">Gallery</a>
            <a href="#" className="text-[#5a3fbb] text-base font-bold bg-[rgba(109,91,255,0.12)] px-[18px] py-[10px] rounded-full transition-colors hover:text-[#3c2ca8] hover:bg-[rgba(109,91,255,0.18)]">My Orders</a>
        </nav>
    </header>

      <div className="bg-white border-b border-black/10 px-[22px] py-[18px] flex items-center justify-center rounded-[20px] mb-[18px]">
        <div className="flex items-center gap-2 min-w-[105px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-semibold bg-[#534ab7] text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-xs font-medium text-[#534ab7]">Upload & customise</span>
        </div>
        <div className="w-[54px] h-px bg-[#534ab7] mx-2"></div>
        <div className="flex items-center gap-2 min-w-[105px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-semibold bg-[#534ab7] text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-xs font-medium text-[#534ab7]">Review</span>
        </div>
        <div className="w-[54px] h-px bg-[#534ab7] mx-2"></div>
        <div className="flex items-center gap-2 min-w-[105px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-semibold bg-[#534ab7] text-white outline outline-[3px] outline-[rgba(127,119,221,0.18)]">3</div>
          <span className="text-xs font-medium text-[#534ab7]">Payment</span>
        </div>
        <div className="w-[54px] h-px bg-[#ddd] mx-2"></div>
        <div className="flex items-center gap-2 min-w-[105px]">
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-semibold bg-[#e4e4f0] text-[#999]">4</div>
          <span className="text-xs font-medium text-[#bbb]">Confirmation</span>
        </div>
      </div>

      <main className="grid grid-cols-[1fr_340px] max-[720px]:grid-cols-1 gap-5 items-start">
        <div>
          <div className="bg-white rounded-[18px] border border-black/10 p-6 mb-4 text-[#222]">
            <div className="text-sm font-semibold text-[#1a1a2e] mb-[18px] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7f77dd] shrink-0"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Payment method
              <span className="ml-auto inline-flex items-center gap-1 bg-[#f2efff] text-[#534ab7] text-[11px] font-medium px-[10px] py-[3px] rounded-full">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                SSL secured
              </span>
            </div>

            <div className="grid grid-cols-2 gap-[10px] mb-[22px]">
              <div
                className={`border-[1.5px] rounded-xl px-[14px] py-[13px] flex items-center gap-[11px] cursor-pointer transition-colors bg-white hover:border-[#7f77dd] hover:bg-[#f8f7ff] ${method === 'card' ? 'border-[#534ab7] bg-[#f0efff]' : 'border-black/10'}`}
                onClick={() => setMethod('card')}
              >
                <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[#534ab7] shrink-0 ${method === 'card' ? 'bg-[#e7e1ff]' : 'bg-[#f2f2fa]'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a2e]">Bank card</div>
                  <div className="text-[11px] text-[#8f8eab] mt-px">Visa, Mastercard</div>
                </div>
              </div>
              <div
                className={`border-[1.5px] rounded-xl px-[14px] py-[13px] flex items-center gap-[11px] cursor-pointer transition-colors bg-white hover:border-[#7f77dd] hover:bg-[#f8f7ff] ${method === 'bank' ? 'border-[#534ab7] bg-[#f0efff]' : 'border-black/10'}`}
                onClick={() => setMethod('bank')}
              >
                <div className={`w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[#534ab7] shrink-0 ${method === 'bank' ? 'bg-[#e7e1ff]' : 'bg-[#f2f2fa]'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a2e]">Bank transfer</div>
                  <div className="text-[11px] text-[#8f8eab] mt-px">Direct deposit</div>
                </div>
              </div>
            </div>

            <div style={{ display: method === 'card' ? 'block' : 'none' }}>
              <div className="relative overflow-hidden bg-[#1b1546] rounded-[18px] px-6 py-[22px] mb-[22px] before:content-[''] before:absolute before:-top-10 before:-right-10 before:w-[130px] before:h-[130px] before:rounded-full before:bg-[rgba(127,119,221,0.18)] after:content-[''] after:absolute after:-bottom-[50px] after:left-0 after:w-[110px] after:h-[110px] after:rounded-full after:bg-[rgba(127,119,221,0.1)]">
                <div className="w-[34px] h-[26px] rounded-md bg-[#ef9f27] mb-5"></div>
                <div className="font-mono text-base tracking-[3px] text-white font-medium mb-4">Secure PayHere checkout</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-white/65 uppercase tracking-[1px] mb-[3px]">Provider</div>
                    <div className="text-[13px] text-white font-medium">PayHere</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/65 uppercase tracking-[1px] mb-[3px]">Cards</div>
                    <div className="text-[13px] text-white font-medium">Visa / Mastercard</div>
                  </div>
                  <div className="text-white/60">
                    <svg width="36" height="22" viewBox="0 0 36 22" fill="none" className="block"><circle cx="13" cy="11" r="10" fill="rgba(255,255,255,0.25)"/><circle cx="23" cy="11" r="10" fill="rgba(255,255,255,0.15)"/></svg>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#8f8eab] mt-[14px] text-center">
                Card details are entered only on PayHere's secure checkout page.
              </p>
            </div>

            <div style={{ display: method === 'bank' ? 'block' : 'none' }}>
              <div className="relative flex items-center gap-[10px] text-[11px] text-[#8f8eab] my-4 before:content-[''] before:flex-1 before:h-px before:bg-black/10 after:content-[''] after:flex-1 after:h-px after:bg-black/10">select your bank</div>
              <div className="grid grid-cols-3 gap-2">
                {bankOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`border rounded-xl px-[10px] py-3 text-center cursor-pointer text-[11px] font-medium bg-white transition-colors inline-flex flex-col gap-[6px] hover:border-[#7f77dd] hover:text-[#534ab7] hover:bg-[#f0efff] ${bank === option ? 'border-[#534ab7] bg-[#f0efff] text-[#534ab7]' : 'border-black/10 text-[#5d5d72]'}`}
                    onClick={() => setBank(option)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#bbb] mx-auto mb-[5px] block"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                    {option}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#8f8eab] mt-[14px] text-center">
                A transfer reference will be generated after you confirm this payment.
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
          <div className="bg-white rounded-[18px] border border-black/10 p-6 mb-4 text-[#222]">
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
                <div className="text-xs text-[#6b6b80] mt-0.5">A3 · 2 subjects · Classic frame</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Base price (A3)</span><span className="font-medium">{displayValue(prices.base)}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Classic frame</span><span className="font-medium">{displayValue(prices.frame)}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">2nd subject</span><span className="font-medium">{displayValue(prices.people)}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-black/[0.06] text-[13px] last:border-b-0"><span className="text-[#6b6b80]">Delivery</span><span className="font-medium">Courier</span></div>
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

          <div className="bg-white rounded-[18px] border border-black/10 p-6 mb-4 text-[#222]">
            <div className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7f77dd] shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Estimated timeline
            </div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Queue position</span><span className="text-[#534ab7] font-medium">#3</span></div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Sketching starts</span><span className="text-[#534ab7] font-medium">~3 days</span></div>
            <div className="flex justify-between text-xs py-[5px]"><span className="text-[#6b6b80]">Delivery estimate</span><span className="text-[#534ab7] font-medium">7–10 working days</span></div>
          </div>

          <button type="button" className="border border-white/[0.16] rounded-full px-6 py-[14px] cursor-pointer transition-colors bg-transparent text-[#e7e3f5] hover:bg-white/[0.08] w-full mt-[18px]" onClick={onBack}>
            ← Back to details
          </button>
        </div>
      </main>
    </div>
  )
}
