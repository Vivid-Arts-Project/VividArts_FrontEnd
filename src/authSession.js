import { useEffect, useRef } from 'react';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const CUSTOMER_AUTH_EVENT = 'vividarts:customer-auth';
const CUSTOMER_SESSION_KEY = 'vividarts:customer-session';
const CUSTOMER_USERNAME_KEY = 'vividarts:customer-username';
const ADMIN_SESSION_KEY = 'vividarts:admin-session';
const PAYMENT_RETURN_SESSION_KEY = 'vividarts:payment-return-session';
const PAYMENT_RETURN_MAX_AGE_MS = 30 * 60 * 1000;

export function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_SESSION_KEY) === 'active' ? 'cookie-session' : null;
}

export function getCustomerUsername() {
  return localStorage.getItem(CUSTOMER_USERNAME_KEY) || '';
}

export function setCustomerUsername(username) {
  localStorage.setItem(CUSTOMER_USERNAME_KEY, username);
  window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
}

export function startCustomerSession(_token, username) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, 'active');
  localStorage.setItem(CUSTOMER_USERNAME_KEY, username);
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_USERNAME_KEY);
  localStorage.removeItem(PAYMENT_RETURN_SESSION_KEY);
  fetch('/api/customers/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
}

export function hasCustomerSession() {
  return Boolean(getCustomerToken());
}

export function startAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'active');
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasAdminSession() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active';
}

export function isPaymentReturnLocation() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname === '/commission/payment'
    && params.has('payment')
    && params.has('order_id');
}

export function preparePaymentReturnSession(orderId) {
  if (!hasCustomerSession() || !orderId) return;

  localStorage.setItem(PAYMENT_RETURN_SESSION_KEY, JSON.stringify({
    orderId,
    username: getCustomerUsername(),
    createdAt: Date.now(),
  }));
}

function restorePaymentReturnSession() {
  if (!isPaymentReturnLocation()) return false;

  const returnedOrderId = new URLSearchParams(window.location.search).get('order_id');
  try {
    const stored = JSON.parse(localStorage.getItem(PAYMENT_RETURN_SESSION_KEY) || 'null');
    const isValid = stored?.orderId === returnedOrderId
      && Date.now() - Number(stored.createdAt) <= PAYMENT_RETURN_MAX_AGE_MS;

    if (!isValid) return false;
    localStorage.setItem(CUSTOMER_SESSION_KEY, 'active');
    localStorage.setItem(CUSTOMER_USERNAME_KEY, stored.username || '');
    return true;
  } catch {
    return false;
  } finally {
    localStorage.removeItem(PAYMENT_RETURN_SESSION_KEY);
  }
}

export function resetCustomerSessionOnBoot() {
  restorePaymentReturnSession();
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  if (!hasCustomerSession()) clearCustomerSession();
}

export function useIdleTimeout(enabled, onIdle, timeout = IDLE_TIMEOUT_MS) {
  const lastActivity = useRef(0);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return undefined;

    lastActivity.current = Date.now();
    let expired = false;

    const recordActivity = () => {
      lastActivity.current = Date.now();
    };
    const checkActivity = () => {
      if (expired || Date.now() - lastActivity.current < timeout) return;
      expired = true;
      onIdleRef.current();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    const interval = window.setInterval(checkActivity, 30_000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.clearInterval(interval);
    };
  }, [enabled, timeout]);
}
