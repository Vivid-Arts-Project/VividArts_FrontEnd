import { useCallback, useSyncExternalStore } from 'react';

const NAVIGATION_EVENT = 'vividarts:navigation';
const NAVIGATION_SESSION_KEY = 'vividarts:navigation-session';
let NAVIGATION_SESSION_ID = sessionStorage.getItem(NAVIGATION_SESSION_KEY);
if (!NAVIGATION_SESSION_ID) {
  NAVIGATION_SESSION_ID = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  sessionStorage.setItem(NAVIGATION_SESSION_KEY, NAVIGATION_SESSION_ID);
}

function subscribe(listener) {
  window.addEventListener('popstate', listener);
  window.addEventListener(NAVIGATION_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(NAVIGATION_EVENT, listener);
  };
}

function getLocation() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function resolveTarget(to) {
  const target = new URL(to, window.location.origin);
  if (target.origin !== window.location.origin) throw new Error('Cross-origin navigation is not allowed');
  return `${target.pathname}${target.search}${target.hash}`;
}

export function navigate(to, { replace = false } = {}) {
  if (typeof to === 'number') {
    window.history.go(to);
    return;
  }

  const target = resolveTarget(to);
  window.history[replace ? 'replaceState' : 'pushState'](
    { vividArtsNavigation: NAVIGATION_SESSION_ID },
    '',
    target,
  );
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function isTrustedNavigation() {
  return window.history.state?.vividArtsNavigation === NAVIGATION_SESSION_ID;
}

export function useLocation() {
  return useSyncExternalStore(subscribe, getLocation, () => '/');
}

export function useNavigate() {
  return useCallback((to, options) => navigate(to, options), []);
}
