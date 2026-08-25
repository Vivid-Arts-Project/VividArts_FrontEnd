import { useEffect, useState } from 'react';
import { api } from '../api';
import { clearCustomerSession, CUSTOMER_AUTH_EVENT, getCustomerToken } from '../authSession';
import { useLocation, useNavigate } from '../router';
import NotificationBell from '../pages/NotificationBell';
import BrandLogo from './BrandLogo';
import Icon from './Icon';

const PATHS = {
  landing: '/',
  gallery: '/gallery',
  login: '/login',
  profile: '/profile',
  orders: '/my-orders',
  reviews: '/reviews',
};

const primaryItems = [
  { key: 'home', label: 'Home', icon: 'home', section: 'home' },
  { key: 'about', label: 'About', icon: 'info', section: 'about' },
  { key: 'process', label: 'How It Works', icon: 'orders', section: 'how-it-works' },
  { key: 'gallery', label: 'Gallery', icon: 'proofs', route: 'gallery' },
  { key: 'reviews', label: 'Reviews', icon: 'rating', route: 'reviews' },
];

export default function CustomerHeader({ onNavigate, active = 'home' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(active);
  const [isSignedIn, setIsSignedIn] = useState(Boolean(getCustomerToken()));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    const syncAuthentication = () => {
      const signedIn = Boolean(getCustomerToken());
      setIsSignedIn(signedIn);
      if (!signedIn) setPendingOrderCount(0);
    };
    window.addEventListener(CUSTOMER_AUTH_EVENT, syncAuthentication);
    window.addEventListener('storage', syncAuthentication);
    return () => {
      window.removeEventListener(CUSTOMER_AUTH_EVENT, syncAuthentication);
      window.removeEventListener('storage', syncAuthentication);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return undefined;
    let mounted = true;
    let latestRequest = 0;
    const refreshPendingOrders = () => {
      latestRequest += 1;
      const requestId = latestRequest;
      return api.getMyOrders()
        .then(orders => {
          if (mounted && requestId === latestRequest) {
            setPendingOrderCount(orders.filter(order => order.paymentStatus === 'payment_pending').length);
          }
        })
        .catch(() => {});
    };
    const handlePendingOrdersChanged = (event) => {
      const delta = Number(event.detail?.delta);
      if (Number.isFinite(delta) && delta !== 0) {
        setPendingOrderCount(current => Math.max(0, current + delta));
      }
      refreshPendingOrders();
    };
    refreshPendingOrders();
    window.addEventListener('vividarts:pending-orders', handlePendingOrdersChanged);
    return () => {
      mounted = false;
      window.removeEventListener('vividarts:pending-orders', handlePendingOrdersChanged);
    };
  }, [isSignedIn]);

  const goToRoute = (target) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(target);
    else navigate(PATHS[target] ?? '/');
  };

  const goToSection = (section, key) => {
    setActiveNav(key);
    setMobileMenuOpen(false);
    const scrollToSection = () => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.split(/[?#]/, 1)[0] === '/') {
      window.history.replaceState(window.history.state, '', `/#${section}`);
      scrollToSection();
      return;
    }
    navigate(`/#${section}`);
    window.setTimeout(scrollToSection, 0);
  };

  const activate = (item) => {
    setActiveNav(item.key);
    if (item.route) goToRoute(item.route);
    else goToSection(item.section, item.key);
  };

  const handleLogout = () => {
    clearCustomerSession();
    setIsSignedIn(false);
    setPendingOrderCount(0);
    goToRoute('landing');
  };

  const navItemClass = key => `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white ${activeNav === key ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.05)]' : 'text-[#aaa7bd]'}`;

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 font-outfit sm:px-6 sm:pt-4">
      <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center gap-4 rounded-[34px] border border-white/[.13] bg-[#151326]/85 px-3 py-2.5 shadow-[0_20px_45px_rgba(0,0,0,.38)] backdrop-blur-[20px] sm:px-5 lg:px-6">
        <button type="button" onClick={() => goToSection('home', 'home')} className="group flex shrink-0 items-center gap-3 text-left" aria-label="Vivid Arts home">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b9afff]/30 bg-white shadow-[0_10px_28px_rgba(93,78,210,0.3)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(111,87,230,0.4)]">
            <BrandLogo size={48}/>
          </span>
          <span className="hidden sm:block">
            <span className="block text-[17px] font-black tracking-[0.12em] text-white">VIVID ARTS</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#aaa3c9]">Pencil portraits</span>
          </span>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-1 px-2 xl:flex" aria-label="Primary navigation">
          {primaryItems.map(item => (
            <button type="button" key={item.key} className={navItemClass(item.key)} onClick={() => activate(item)}>
              <Icon name={item.icon} size={15} className={activeNav === item.key ? 'text-[#a99bff]' : 'opacity-65'}/>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            {!isSignedIn ? (
              <button type="button" className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(126,87,225,.38)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(126,87,225,.48)]" onClick={() => goToRoute('login')}>Sign In</button>
            ) : (
              <>
                <button type="button" className={navItemClass('profile')} onClick={() => goToRoute('profile')}><Icon name="user" size={15}/>My Account</button>
                <button type="button" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[#aaa7bd] transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white" onClick={handleLogout}><Icon name="power" size={15}/>Logout</button>
                <button type="button" className={`relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(126,87,225,.38)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(126,87,225,.48)] ${activeNav === 'orders' ? 'ring-2 ring-white/25' : ''}`} onClick={() => goToRoute('orders')}>
                  <Icon name="orders" size={15}/>My Orders
                  {pendingOrderCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#151326] bg-red-500 px-1 text-[10px] font-black text-white" aria-label={`${pendingOrderCount} incomplete orders`}>{pendingOrderCount}</span>}
                </button>
              </>
            )}
          </div>
          {isSignedIn && <NotificationBell/>}
          <button type="button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[.07] text-white transition hover:border-[#a78bfa]/50 hover:bg-white/10 xl:hidden" onClick={() => setMobileMenuOpen(open => !open)}>
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={21}/>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-[1500px] rounded-[24px] border border-white/[.13] bg-[#151326]/95 px-4 pb-5 pt-4 shadow-[0_20px_45px_rgba(0,0,0,.38)] backdrop-blur-[20px] xl:hidden">
          <nav className="grid grid-cols-2 gap-2 text-sm font-semibold text-[#d4d0e5]" aria-label="Mobile navigation">
            {primaryItems.map(item => (
              <button type="button" key={item.key} className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-center transition ${activeNav === item.key ? 'border-white/15 bg-white/10 text-white' : 'border-white/[.08] bg-white/[.04] text-[#c5c1d2]'}`} onClick={() => activate(item)}>
                <Icon name={item.icon} size={15} className="text-[#a99bff]"/>{item.label}
              </button>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            {!isSignedIn ? (
              <button type="button" className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-4 py-3 text-sm font-semibold text-white shadow-md" onClick={() => goToRoute('login')}>Sign In</button>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" className="rounded-xl border border-white/15 bg-white/[.07] px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10" onClick={() => goToRoute('profile')}>My Account</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.07] px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/10" onClick={handleLogout}><Icon name="power" size={16}/>Logout</button>
                <button type="button" className="relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#9258e8] px-3 py-3 text-sm font-semibold text-white shadow-md" onClick={() => goToRoute('orders')}>My Orders{pendingOrderCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#151326] bg-red-500 px-1 text-[10px] font-black text-white">{pendingOrderCount}</span>}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
