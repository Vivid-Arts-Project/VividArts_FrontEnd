import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Icon from './Icon';

const PAGE_META = {
  orders:    { title: 'Order Management',   bread: 'Orders'    },
  dashboard: { title: 'Dashboard',          bread: 'Dashboard' },
  proofs:    { title: 'Proof Upload',        bread: 'Proofs'    },
  revisions: { title: 'Revision Requests',  bread: 'Revisions' },
  clients:   { title: 'Clients',            bread: 'Clients'   },
  payments:  { title: 'Payments',           bread: 'Payments'  },
  invoices:  { title: 'Invoices',           bread: 'Invoices'  },
  settings:  { title: 'Settings',           bread: 'Settings'  },
};

export default function Topbar({ page, onNewOrder, search, onSearch, onMenu }) {
  const { admin } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const meta = PAGE_META[page] || { title: page, bread: page };

  // Use real businessName from DB, fallback to 'Vivid Arts'
  const businessName = admin?.businessName || 'Vivid Arts';

  return (
    <>
      <header className="sticky top-0 z-[100] flex min-h-[60px] items-center justify-between gap-2 border-b border-va-border bg-white px-3 py-2 shadow-[0_1px_0_var(--va-border)] sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <button type="button" aria-label="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-va-border bg-va-bg text-va-purple md:hidden" onClick={onMenu}>
            <Icon name="menu" size={20}/>
          </button>
          <div className="min-w-0">
            <div className="truncate font-outfit text-[15px] font-bold text-va-text sm:text-[17px]">{meta.title}</div>
            <div className="truncate text-[10px] text-va-text3 sm:text-xs">{businessName} / <span className="text-va-purple font-semibold">{meta.bread}</span></div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-va-border bg-va-bg px-3 py-[7px] text-[13px] text-va-text3 transition-colors focus-within:border-va-blue focus-within:bg-white sm:flex sm:w-[180px] lg:w-[220px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="var(--va-text3)" strokeWidth="1.2"/>
              <path d="M9.5 9.5L12 12" stroke="var(--va-text3)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search orders, clients…"
              value={search}
              onChange={e => onSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-[13px] font-sans text-va-text w-full"
            />
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className={`w-9 h-9 rounded-lg border flex items-center justify-center cursor-pointer relative transition-all ${showNotif ? 'border-va-purple bg-grad-soft text-va-purple shadow-[0_0_0_3px_rgba(91,63,168,0.08)]' : 'border-va-border bg-white text-va-text2 hover:border-va-border2 hover:bg-va-bg hover:text-va-purple'}`}
            onClick={() => setShowNotif(v => !v)}
          >
            <Icon name="bell" size={18}/>
            <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-va-danger rounded-full border-2 border-white"/>
          </button>
          <button
            aria-label="Create new order"
            className="flex h-9 items-center gap-1.5 rounded-lg border-none bg-grad px-3 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:opacity-90 hover:shadow-[0_4px_14px_rgba(91,63,168,0.3)] sm:h-auto sm:px-4 sm:py-2"
            onClick={onNewOrder}
          >
            <span aria-hidden="true">+</span><span className="hidden sm:inline">New Order</span>
          </button>
        </div>
      </header>

      {showNotif && (
        <div className="notification-pop fixed left-3 right-3 top-[68px] z-[300] overflow-hidden rounded-xl border border-va-border bg-white shadow-[0_18px_50px_rgba(30,24,72,0.18)] sm:left-auto sm:right-4 sm:w-[330px]">
          <div className="absolute -top-1.5 right-[77px] w-3 h-3 rotate-45 bg-white border-l border-t border-va-border"/>
          <div className="px-4 py-3.5 border-b border-va-border flex items-center justify-between bg-gradient-to-r from-[#f5f9ff] to-[#f6f1ff]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-grad text-white flex items-center justify-center shadow-sm"><Icon name="bell" size={17}/></div>
              <div>
                <div className="font-outfit text-sm font-bold text-va-text">Notifications</div>
                <div className="text-[10px] text-va-text3">Your latest account activity</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-va-purple bg-white border border-va-border rounded-full px-2 py-1">1 new</span>
          </div>
          <div className="flex gap-3 px-4 py-4 items-start bg-blue-50/40 hover:bg-blue-50 transition-colors cursor-default">
            <div className="w-9 h-9 rounded-full bg-va-info-bg text-va-info flex items-center justify-center shrink-0"><Icon name="info" size={18}/></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-va-text2 leading-relaxed"><strong>System ready</strong> — logged in as {admin?.username}</div>
              <div className="text-[11px] text-va-text3 mt-1">Just now</div>
            </div>
            <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-va-blue"/>
          </div>
          <div className="px-4 py-2.5 text-center border-t border-va-border bg-white">
            <button type="button" className="border-none bg-transparent text-[11px] font-semibold text-va-purple cursor-pointer hover:underline">Mark all as read</button>
          </div>
        </div>
      )}
    </>
  );
}
