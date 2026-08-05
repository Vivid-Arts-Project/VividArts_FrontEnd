import { useEffect, useRef } from 'react';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const CUSTOMER_AUTH_EVENT = 'vividarts:customer-auth';
const CUSTOMER_TOKEN_KEY = 'vividarts:customer-token';
const CUSTOMER_USERNAME_KEY = 'vividarts:customer-username';
const ADMIN_SESSION_KEY = 'vividarts:admin-session';
const PAYMENT_RETURN_SESSION_KEY = 'vividarts:payment-return-session';
const PAYMENT_RETURN_MAX_AGE_MS = 30 * 60 * 1000;

export function getCustomerToken() {
  return sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function getCustomerUsername() {
  return sessionStorage.getItem(CUSTOMER_USERNAME_KEY) || '';
}

export function setCustomerUsername(username) {
  sessionStorage.setItem(CUSTOMER_USERNAME_KEY, username);
  window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
}

export function startCustomerSession(token, username) {
  sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  sessionStorage.setItem(CUSTOMER_USERNAME_KEY, username);
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
}

export function clearCustomerSession() {
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USERNAME_KEY);
  localStorage.removeItem(PAYMENT_RETURN_SESSION_KEY);
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
  const token = getCustomerToken();
  if (!token || !orderId) return;

  localStorage.setItem(PAYMENT_RETURN_SESSION_KEY, JSON.stringify({
    orderId,
    token,
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
      && typeof stored.token === 'string'
      && Date.now() - Number(stored.createdAt) <= PAYMENT_RETURN_MAX_AGE_MS;

    if (!isValid) return false;
    sessionStorage.setItem(CUSTOMER_TOKEN_KEY, stored.token);
    sessionStorage.setItem(CUSTOMER_USERNAME_KEY, stored.username || '');
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
