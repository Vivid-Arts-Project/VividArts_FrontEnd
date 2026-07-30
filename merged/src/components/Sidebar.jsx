import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NAV = [
  { section: 'Overview' },
  { id: 'orders',    icon: '📋', label: 'Orders',        badgeDanger: false },
  { id: 'dashboard', icon: '📊', label: 'Dashboard',     badgeDanger: false },
  { section: 'Workflow' },
  { id: 'proofs',    icon: '🖼️', label: 'Proof Upload',  badgeDanger: false },
  { id: 'revisions', icon: '💬', label: 'Revisions',     badgeDanger: true  },
  { section: 'People' },
  { id: 'clients',   icon: '👤', label: 'Clients',       badgeDanger: false },
  { section: 'Finance' },
  { id: 'payments',  icon: '💳', label: 'Payments',      badgeDanger: false },
  { id: 'invoices',  icon: '📄', label: 'Invoices',      badgeDanger: false },
  { section: 'System' },
  { id: 'settings',  icon: '⚙️', label: 'Settings',      badgeDanger: false },
];

export default function Sidebar({ page, onNav, stats }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const getBadge = (id) => {
    if (!stats) return null;
    if (id === 'orders')    return stats.total            || null;
    if (id === 'proofs')    return stats.inQueue          || null;
    if (id === 'revisions') return stats.waitingFeedback  || null;
    return null;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
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
      <div className="px-5 pt-[22px] pb-[18px] border-b border-white/[0.06] flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-lg bg-grad flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 16L6.5 4L10 10.5L13 6.5L17 16"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="font-outfit text-base font-extrabold text-white tracking-[-0.3px]">{businessName}</div>
          <span className="text-[10px] font-semibold text-white/30 bg-white/[0.07] rounded block mt-[3px] px-[7px] py-0.5 tracking-wide uppercase">Admin Panel</span>
        </div>
      </div>

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
            <span className="w-[18px] text-center text-[15px] shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {badge && (
              <span className={`text-[10px] font-bold px-[7px] py-0.5 rounded-full ${badgeCls}`}>{badge}</span>
            )}
          </button>
        );
      })}

      {/* User section — shows real name and role from DB */}
      <div className="mt-auto px-3 py-3.5 border-t border-white/[0.06]">
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
          className="mt-2 w-full px-3 py-[7px] bg-white/[0.06] border border-white/10 rounded-lg text-white/50 text-xs font-semibold cursor-pointer text-left"
        >
          ⇠ Sign out
        </button>
      </div>
    </nav>
  );
}
