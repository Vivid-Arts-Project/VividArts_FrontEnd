import { useState, useEffect } from 'react';
import { api } from '../api';
import '../App.css';

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
  const [error, setError] = useState(null);
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
      setError('Payment was cancelled. You can try again when you are ready.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (paymentStatus !== 'success' || !returnedOrderId) return;

    setIsProcessing(true);
    api.getPaymentStatus(returnedOrderId)
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
      <div className="payment-root">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h2>Payment Successful!</h2>
          <p style={{ color: '#b5b0d3' }}>
            {successMessage}
          </p>
          <p style={{ color: '#b5b0d3', marginTop: '10px' }}>
            Order ID: {orderId || 'Processing...'}
          </p>
          <button 
            className="primary-button" 
            onClick={() => onComplete()}
            style={{ marginTop: '20px', padding: '12px 30px' }}
          >
            Go to Dashboard
          </button>
          <button 
            className="ghost-button" 
            onClick={() => setShowConfirmation(false)}
            style={{ marginTop: '10px' }}
          >
            Back to Payment
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="payment-root">
      <header className="payment-topbar">
        <div className="brand-section">
            <div className="logo-icon">M</div>
            <span className="logo-name">VIVID ARTS</span>
        </div>

        <nav className="nav-links">
            <a href="#">Gallery</a>
            <a href="#">My Orders</a>
        </nav>
    </header>

      <div className="payment-stepper">
        <div className="payment-step payment-done">
          <div className="payment-step-num">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="payment-step-label">Upload & customise</span>
        </div>
        <div className="payment-step-line payment-done"></div>
        <div className="payment-step payment-done">
          <div className="payment-step-num">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="payment-step-label">Review</span>
        </div>
        <div className="payment-step-line payment-done"></div>
        <div className="payment-step payment-active">
          <div className="payment-step-num">3</div>
          <span className="payment-step-label">Payment</span>
        </div>
        <div className="payment-step-line"></div>
        <div className="payment-step payment-inactive">
          <div className="payment-step-num">4</div>
          <span className="payment-step-label">Confirmation</span>
        </div>
      </div>

      <main className="main payment-main">
        <div>
          <div className="card">
            <div className="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Payment method
              <span className="secure-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                SSL secured
              </span>
            </div>

            <div className="pm-grid">
              <div className={`pm-option ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}>
                <div className="pm-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <div>
                  <div className="pm-label">Bank card</div>
                  <div className="pm-sub">Visa, Mastercard</div>
                </div>
              </div>
              <div className={`pm-option ${method === 'bank' ? 'active' : ''}`} onClick={() => setMethod('bank')}>
                <div className="pm-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                </div>
                <div>
                  <div className="pm-label">Bank transfer</div>
                  <div className="pm-sub">Direct deposit</div>
                </div>
              </div>
            </div>

            <div id="card-section" style={{ display: method === 'card' ? 'block' : 'none' }}>
              <div className="card-visual">
                <div className="card-chip"></div>
                <div className="card-number-display">Secure PayHere checkout</div>
                <div className="card-bottom">
                  <div>
                    <div className="cv-label">Provider</div>
                    <div className="cv-value">PayHere</div>
                  </div>
                  <div>
                    <div className="cv-label">Cards</div>
                    <div className="cv-value">Visa / Mastercard</div>
                  </div>
                  <div className="network-icon">
                    <svg width="36" height="22" viewBox="0 0 36 22" fill="none"><circle cx="13" cy="11" r="10" fill="rgba(255,255,255,0.25)"/><circle cx="23" cy="11" r="10" fill="rgba(255,255,255,0.15)"/></svg>
                  </div>
                </div>
              </div>

              <p className="bank-note">
                Card details are entered only on PayHere's secure checkout page.
              </p>
            </div>

            <div id="bank-section" style={{ display: method === 'bank' ? 'block' : 'none' }}>
              <div className="divider-label">select your bank</div>
              <div className="bank-grid">
                {bankOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`bank-opt ${bank === option ? 'active' : ''}`}
                    onClick={() => setBank(option)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"/></svg>
                    {option}
                  </button>
                ))}
              </div>
              <p className="bank-note">
                A transfer reference will be generated after you confirm this payment.
              </p>
            </div>

            {error && <div className="error-message" style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
            <button className="pay-btn" type="button" onClick={handlePay} disabled={isProcessing}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              {isProcessing ? 'Processing…' : `Pay ${formatMoney(dueAmount, currency.code, currency.rate)} now`}
            </button>

            <div className="trust-row">
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                256-bit encryption
              </div>
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                PCI DSS compliant
              </div>
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Refund policy
              </div>
            </div>
          </div>
        </div>

        <div className="summary-sticky">
          <div className="card summary-card">
            <div className="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Order summary
            </div>
            <div className="order-header">
              <div className="order-thumb">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <div>
                <div className="order-title">Pencil portrait commission</div>
                <div className="order-sub">A3 · 2 subjects · Classic frame</div>
              </div>
            </div>

            <div>
              <div className="line-item"><span className="line-key">Base price (A3)</span><span className="line-val">{displayValue(prices.base)}</span></div>
              <div className="line-item"><span className="line-key">Classic frame</span><span className="line-val">{displayValue(prices.frame)}</span></div>
              <div className="line-item"><span className="line-key">2nd subject</span><span className="line-val">{displayValue(prices.people)}</span></div>
              <div className="line-item"><span className="line-key">Delivery</span><span className="line-val">Courier</span></div>
            </div>

            <div className="total-row">
              <span className="total-label">Total</span>
              <span className="total-amount">{displayValue(total)}</span>
            </div>

            <div className="split-info">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              A 50% deposit is required to begin. The remaining balance is due after you approve the proof image.
            </div>

            <div className="due-now">
              <span className="due-label">Due now (50% deposit)</span>
              <span className="due-amount">{displayValue(dueAmount)}</span>
            </div>
          </div>

          <div className="card timeline-card">
            <div className="card-title" style={{ marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Estimated timeline
            </div>
            <div className="timeline-row"><span>Queue position</span><span>#3</span></div>
            <div className="timeline-row"><span>Sketching starts</span><span>~3 days</span></div>
            <div className="timeline-row"><span>Delivery estimate</span><span>7–10 working days</span></div>
          </div>

          <button type="button" className="ghost-button full back-button" onClick={onBack}>
            ← Back to details
          </button>
        </div>
      </main>
    </div>
  )
}
