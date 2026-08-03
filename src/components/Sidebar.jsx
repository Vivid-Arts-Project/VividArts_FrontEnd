import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import BrandLogo from './BrandLogo';

const NAV = [
  { section: 'Overview' },
  { id: 'orders',    icon: 'orders', label: 'Orders',        badgeDanger: false },
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard',     badgeDanger: false },
  { section: 'Workflow' },
  { id: 'proofs',    icon: 'proofs', label: 'Proof Upload',  badgeDanger: false },
  { id: 'revisions', icon: 'revisions', label: 'Revisions',     badgeDanger: true  },
  { section: 'People' },
  { id: 'clients',   icon: 'clients', label: 'Clients',       badgeDanger: false },
  { id: 'gallery',   icon: 'proofs', label: 'Website Images', badgeDanger: false },
  { section: 'Finance' },
  { id: 'payments',  icon: 'payments', label: 'Payments',      badgeDanger: false },
  { id: 'invoices',  icon: 'invoices', label: 'Invoices',      badgeDanger: false },
  { section: 'System' },
  { id: 'settings',  icon: 'settings', label: 'Settings',      badgeDanger: false },
];

export default function Sidebar({ page, onNav, stats }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const getBadge = (id) => {
    if (!stats) return null;
    if (id === 'orders')    return stats.total            || null;
    if (id === 'proofs')    return stats.inQueue          || null;
    if (id === 'revisions') return stats.waitingFeedback  || null;
    return null;
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/admin/login', { replace: true });
      setLoggingOut(false);
    }
  };

  // Build initials and display name from real DB data
  const initials = admin
    ? `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase() || 'A'
    : 'A';
  const displayName  = admin ? `${admin.firstName} ${admin.lastName}`.trim() || admin.username : '—';
  const businessName = admin?.businessName || 'Vivid Arts';

  return (
    <nav className="w-[230px] bg-grad-dark flex flex-col h-screen shrink-0 fixed top-0 left-0 z-[200] border-r border-white/[0.04]">
      {/* Logo — uses real businessName from DB */}
      <div className="px-4 pt-5 pb-[18px] border-b border-white/[0.06] flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white shadow-[0_8px_24px_rgba(69,52,160,0.3)]">
          <BrandLogo size={40}/>
        </span>
        <div className="min-w-0">
          <div className="font-outfit text-[18px] leading-tight font-extrabold text-white tracking-[-0.2px] drop-shadow-sm">{businessName}</div>
          <span className="mt-1 inline-flex rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">Admin Panel</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-2">
      {/* Nav items */}
      {NAV.map((item, i) => {
        if (item.section) return <div key={i} className="px-4 pt-4 pb-[5px] text-[10px] font-bold text-white/20 tracking-[1.2px] uppercase">{item.section}</div>;
        const badge = getBadge(item.id);
        const active = page === item.id;
        const badgeCls = item.badgeDanger
          ? 'bg-va-danger text-white'
          : active ? 'bg-black/20 text-white' : 'bg-white/[0.12] text-white';
        return (
          <button
            key={item.id}
            className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg mx-2 my-[1px] cursor-pointer transition-all duration-[180ms] text-[13px] font-medium select-none border-none w-[calc(100%-16px)] text-left ${active ? 'bg-grad text-white font-semibold' : 'bg-transparent text-white/45 hover:bg-white/[0.07] hover:text-white/85'}`}
            onClick={() => onNav(item.id)}
          >
            <span className="w-[18px] flex items-center justify-center shrink-0">
              <Icon name={item.icon} size={18}/>
            </span>
            <span className="flex-1">{item.label}</span>
            {badge && (
              <span className={`text-[10px] font-bold px-[7px] py-0.5 rounded-full ${badgeCls}`}>{badge}</span>
            )}
          </button>
        );
      })}
      </div>

      {/* User section — shows real name and role from DB */}
      <div className="shrink-0 px-3 py-3.5 border-t border-white/[0.06] bg-[#12102A]">
        <div className="flex items-center gap-2.5 cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]" onClick={() => onNav('settings')}>
          <div className="w-9 h-9 rounded-full bg-grad flex items-center justify-center font-bold text-[13px] text-white shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/70 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {displayName}
            </div>
            <div className="text-[10px] text-white/30 mt-[1px]">Artist · Administrator</div>
          </div>
        </div>
        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-2 w-full px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-white/60 text-xs font-semibold cursor-pointer text-left transition-colors hover:bg-red-500/15 hover:border-red-400/25 hover:text-red-200 disabled:cursor-wait disabled:opacity-60"
        >
          <span className="flex items-center gap-1.5">
            <Icon name="arrowLeft" size={14}/>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </span>
        </button>
      </div>
    </nav>
  );
}
