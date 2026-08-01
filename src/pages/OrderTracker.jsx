import React from 'react';

// Admin Backend එකට ගැළපෙන Stages 6
const STAGES = [
  { key: 'in_queue', label: 'Order Received' },
  { key: 'sketching', label: 'Sketching' },
  { key: 'shading', label: 'Final Shading' },
  { key: 'waiting_for_feedback', label: 'Proof Sent' },
  { key: 'finished', label: 'Approved' },
  { key: 'shipped', label: 'Shipped' },
];

export default function OrderTracker({ currentStatus = 'in_queue' }) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);

  return (
    <div className="w-full my-6 p-5 bg-[#14122a] border border-white/10 rounded-xl">
      <h4 className="text-xs font-bold text-[#a78bfa] uppercase tracking-wide mb-6">
        Order Progress Status
      </h4>

      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-white/10 z-0" />

        {/* Active Progress line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500 transition-all duration-500 z-0"
          style={{
            width: `${
              currentIndex >= 0
                ? (currentIndex / (STAGES.length - 1)) * 100
                : 0
            }%`,
          }}
        />

        {/* Step Circles */}
        {STAGES.map((stage, index) => {
          const isPassed = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isPassed
                    ? 'bg-emerald-500 text-black'
                    : isActive
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white ring-4 ring-purple-500/30 scale-110'
                    : 'bg-[#0a0916] border border-white/20 text-gray-400'
                }`}
              >
                {isPassed ? '✓' : index + 1}
              </div>

              <span
                className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                  isActive
                    ? 'text-[#a78bfa] font-bold'
                    : isPassed
                    ? 'text-emerald-400'
                    : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}