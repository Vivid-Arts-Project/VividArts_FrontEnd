import React, { useEffect } from 'react';
import Icon from './Icon';

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!message) return null;
  const isError = /^[❌✕]/.test(message);
  const cleanMessage = message.replace(/^[✓✅❌✕]\s*/, '');

  return (
    <div className={`fixed bottom-5 right-5 min-w-[290px] max-w-[380px] bg-white border rounded-xl overflow-hidden z-[9999] shadow-[0_16px_40px_rgba(30,24,72,0.18)] animate-toast ${isError ? 'border-red-200' : 'border-emerald-200'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isError ? 'bg-va-danger-bg text-va-danger' : 'bg-va-success-bg text-va-success'}`}>
          <Icon name={isError ? 'alert' : 'completed'} size={20}/>
        </div>
        <div className="flex-1">
          <div className={`text-[11px] font-bold uppercase tracking-[0.8px] ${isError ? 'text-va-danger' : 'text-va-success'}`}>
            {isError ? 'Action failed' : 'Success'}
          </div>
          <div className="text-[13px] font-semibold text-va-text2 mt-0.5">{cleanMessage}</div>
        </div>
        <button type="button" aria-label="Dismiss notification" onClick={onDone} className="text-va-text3 hover:text-va-text border-none bg-transparent text-xl leading-none cursor-pointer">×</button>
      </div>
      <div className={`h-1 toast-progress ${isError ? 'bg-va-danger' : 'bg-va-success'}`}/>
    </div>
  );
}
