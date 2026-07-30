import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

export default function Topbar({ page, onNewOrder, search, onSearch }) {
  const { admin } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const meta = PAGE_META[page] || { title: page, bread: page };

  // Use real businessName from DB, fallback to 'Vivid Arts'
  const businessName = admin?.businessName || 'Vivid Arts';

  return (
    <>
      <header className="h-[60px] bg-white border-b border-va-border flex items-center px-6 justify-between sticky top-0 z-[100] shadow-[0_1px_0_var(--va-border)]">
        <div>
          <div className="font-outfit text-[17px] font-bold text-va-text">{meta.title}</div>
          <div className="text-xs text-va-text3">{businessName} / <span className="text-va-purple font-semibold">{meta.bread}</span></div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 border border-va-border rounded-lg px-3 py-[7px] bg-va-bg text-[13px] text-va-text3 w-[200px] transition-colors focus-within:border-va-blue focus-within:bg-white">
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
          <div className="w-9 h-9 rounded-lg border border-va-border bg-white flex items-center justify-center cursor-pointer text-base relative transition-all hover:border-va-border2 hover:bg-va-bg" onClick={() => setShowNotif(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a5 5 0 00-5 5v3l-1 1v1h12v-1l-1-1V7a5 5 0 00-5-5z"
                stroke="var(--va-text2)" strokeWidth="1.2"/>
              <path d="M6.5 13a1.5 1.5 0 003 0"
                stroke="var(--va-text2)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <div className="absolute top-[7px] right-[7px] w-2 h-2 bg-va-danger rounded-full border-2 border-white"/>
          </div>
          <button
            className="px-4 py-2 bg-grad text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer font-sans transition-all flex items-center gap-1.5 hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(91,63,168,0.3)]"
            onClick={onNewOrder}
          >
            + New Order
          </button>
        </div>
      </header>

      {showNotif && (
        <div className="fixed top-[60px] right-4 w-[300px] bg-white border border-va-border rounded-va shadow-va-md z-[300] overflow-hidden">
          <div className="px-4 py-3 border-b border-va-border flex items-center justify-between">
            <div className="font-outfit text-[13px] font-bold">Notifications</div>
          </div>
          <div className="flex gap-2.5 px-4 py-3 border-b-0 items-start hover:bg-va-bg">
            <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--va-blue)' }}/>
            <div>
              <div className="text-xs text-va-text2 leading-relaxed">System ready — logged in as <strong>{admin?.username}</strong></div>
              <div className="text-[11px] text-va-text3 mt-[3px]">Just now</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
