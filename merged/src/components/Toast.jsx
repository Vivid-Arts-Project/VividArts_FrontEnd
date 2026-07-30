import React, { useEffect } from 'react';

// Usage: <Toast message="✓ Status updated" onDone={() => setToast(null)} />
export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 bg-va-success text-white px-[18px] py-2.5 rounded-lg text-[13px] font-semibold z-[9999] shadow-[0_4px_16px_rgba(0,0,0,0.15)] animate-toast">
      {message}
    </div>
  );
}
