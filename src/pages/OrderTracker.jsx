import Icon from '../components/Icon';

export default function OrderTracker({
  status = 'in_queue',
  workflowStatus = null,
  isPaymentPending = false,
  frameType = 'without_frame',
  className = '',
}) {
  const effectiveStatus = isPaymentPending ? 'payment_pending' : (workflowStatus || status);
  const isRevision = effectiveStatus === 'revision_requested';
  const hasFrame = Boolean(frameType && frameType !== 'without_frame');

  if (effectiveStatus === 'cancelled') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-red-400/25 bg-gradient-to-br from-[#2a1525] via-[#181127] to-[#18152c] p-5 shadow-[0_16px_50px_rgba(0,0,0,.35)] ${className}`}>
        <div className="flex items-center gap-3 text-red-200"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15"><Icon name="alert" size={20}/></span><div><p className="text-xs font-extrabold uppercase tracking-[.16em]">Order cancelled</p><p className="mt-1 text-xs leading-5 text-white/45">Production has stopped. Your order and payment history remain available.</p></div></div>
      </div>
    );
  }

  // Dynamic Stages: If customer ordered a frame, include the dedicated "Framed" step before Done
  const stages = [
    {
      key: 'in_queue',
      label: 'Queued',
      description: 'Order confirmed & queued',
      icon: 'orders',
      color: 'from-[#2b8fe0] to-[#3b82f6]',
    },
    {
      key: 'sketching',
      label: 'Sketching',
      description: 'Pencil drawing in progress',
      icon: 'pencil',
      color: 'from-[#3b82f6] to-[#6366f1]',
    },
    {
      key: 'waiting_for_feedback',
      label: 'Proof Review',
      description: 'Waiting for your approval',
      icon: 'proofs',
      color: 'from-[#6366f1] to-[#8b5cf6]',
    },
    {
      key: 'approved',
      label: 'Proof Approved',
      description: 'Waiting for final payment',
      icon: 'completed',
      color: 'from-[#8b5cf6] to-[#a855f7]',
    },
    {
      key: 'payment_finished',
      label: 'Payment Finished',
      description: 'Full payment received',
      icon: 'payments',
      color: 'from-[#0ea5e9] to-[#14b8a6]',
    },
    ...(hasFrame
      ? [
          {
            key: 'framed',
            label: 'Framed',
            description: 'Custom framing completed',
            icon: 'proofs',
            color: 'from-[#a855f7] to-[#ec4899]',
          },
        ]
      : []),
    {
      key: 'done',
      label: 'Completed',
      description: 'Shipped / Ready for pickup',
      icon: 'package',
      color: 'from-[#10b981] to-[#059669]',
    },
  ];

  const getStageIndex = (currentStatus) => {
    const normalized = String(currentStatus || '').toLowerCase().trim();
    if (normalized === 'payment_pending') return 0;
    if (['shipped', 'done', 'completed'].includes(normalized)) return stages.length - 1;
    if (hasFrame && normalized === 'framed') return stages.findIndex(stage => stage.key === 'framed');
    if (normalized === 'payment_finished' || (!hasFrame && normalized === 'framed')) return stages.findIndex(stage => stage.key === 'payment_finished');
    if (['approved', 'finished'].includes(normalized)) return stages.findIndex(stage => stage.key === 'approved');
    if (['waiting_for_feedback', 'proof_sent'].includes(normalized)) return 2;
    if (['sketching', 'shading', 'revision_requested', 'revision'].includes(normalized)) return 1;
    return 0;
  };

  const currentIndex = getStageIndex(effectiveStatus);
  const isDone = currentIndex === stages.length - 1 && ['shipped', 'done', 'completed'].includes(effectiveStatus);
  
  // Center-to-center percentage calculation
  const totalStages = stages.length;
  const progressRatio = isDone ? 1 : Math.max(0, Math.min(1, currentIndex / (totalStages - 1)));

  // Center offset of first and last node
  const halfColPercent = 100 / (2 * totalStages);
  const trackWidthPercent = 100 - (2 * halfColPercent);

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/[.12] bg-gradient-to-br from-[#161435]/95 via-[#111027]/98 to-[#131f3b]/95 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,.35)] ${className}`}>
      {/* Header Status Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-2.5 w-2.5 rounded-full ${
            isRevision
              ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)]'
              : effectiveStatus === 'waiting_for_feedback'
              ? 'bg-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,1)] animate-ping'
              : isDone
              ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]'
              : 'bg-[#60a5fa] shadow-[0_0_10px_rgba(96,165,250,1)]'
          } animate-pulse`}/>
          <span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#a99bff]">
            Order Progress {hasFrame && <span className="text-white/45">· Framed Order</span>}
          </span>
        </div>

        {/* Dynamic Context Badge */}
        <div className="flex items-center gap-2">
          {isPaymentPending ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-[11px] font-bold text-red-200 shadow-[0_0_12px_rgba(239,68,68,.2)]">
              Payment Incomplete
            </span>
          ) : isRevision ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3.5 py-1 text-[11px] font-bold text-amber-200 shadow-[0_0_16px_rgba(251,191,36,.3)] animate-pulse">
              <Icon name="revisions" size={13} className="text-amber-300"/> Changes Requested — Artist modifying sketch
            </span>
          ) : effectiveStatus === 'waiting_for_feedback' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/50 bg-gradient-to-r from-[#6366f1]/25 to-[#8b5cf6]/25 px-3.5 py-1 text-[11px] font-bold text-[#e8e4ff] animate-pulse shadow-[0_0_16px_rgba(139,92,246,.35)]">
              <Icon name="proofs" size={13} className="text-[#c4b5fd]"/> Proof Ready — Waiting for your approval
            </span>
          ) : effectiveStatus === 'approved' || effectiveStatus === 'finished' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-[11px] font-bold text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,.25)]">
              <Icon name="completed" size={13} className="text-emerald-300"/> Proof Approved — Waiting for final payment
            </span>
          ) : effectiveStatus === 'payment_finished' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/15 px-3.5 py-1 text-[11px] font-bold text-sky-200 shadow-[0_0_14px_rgba(14,165,233,.25)]">
              <Icon name="payments" size={13} className="text-sky-300"/> Payment Finished — Full balance received
            </span>
          ) : effectiveStatus === 'framed' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3.5 py-1 text-[11px] font-bold text-purple-200 shadow-[0_0_14px_rgba(168,85,247,.25)]">
              <Icon name="proofs" size={13} className="text-purple-300"/> Artwork Framed & Packaged
            </span>
          ) : isDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3.5 py-1 text-[11px] font-bold text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,.3)]">
              <Icon name="completed" size={13} className="text-emerald-300"/> Order Completed
            </span>
          ) : (
            <span className="text-xs font-semibold text-white/55">
              Stage {currentIndex + 1} of {stages.length}: <strong className="text-white/90">{stages[currentIndex]?.label}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Progress Line Stepper Container */}
      <div className="relative -mt-2 mb-2 overflow-x-auto pb-2 pt-4 custom-scrollbar">
        <div className="relative min-w-[420px] px-1 sm:min-w-0 sm:px-3">
          {/* Background Base Rail */}
          <div
            className="absolute top-[18px] sm:top-[22px] -translate-y-1/2 h-2 sm:h-2.5 rounded-full bg-white/10 border border-white/[.08] shadow-inner z-0"
            style={{
              left: `${halfColPercent}%`,
              right: `${halfColPercent}%`,
            }}
          />

          {/* Dynamic Vibrant Colored Progress Line */}
          <div
            className="absolute top-[18px] sm:top-[22px] -translate-y-1/2 h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-[#2b8fe0] via-[#7b4fc8] via-[#a855f7] to-[#10b981] shadow-[0_0_16px_rgba(139,92,246,.75),0_0_24px_rgba(16,185,129,.45)] transition-all duration-700 ease-out z-0"
            style={{
              left: `${halfColPercent}%`,
              width: `${progressRatio * trackWidthPercent}%`,
            }}
          />

          {/* Stage Nodes Grid */}
          <div className={`relative z-10 grid ${hasFrame ? 'grid-cols-6' : 'grid-cols-5'}`}>
          {stages.map((stage, index) => {
            const isPassed = index < currentIndex || (isDone && index === currentIndex);
            const isCurrent = index === currentIndex && !isDone;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center px-1">
                {/* Node Disc */}
                <div
                  className={`relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-500 ${
                    isPassed
                      ? 'bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] text-white shadow-[0_0_18px_rgba(16,185,129,.6)] ring-2 ring-[#34d399]'
                      : isCurrent
                      ? isRevision
                        ? 'bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#d97706] text-white shadow-[0_0_22px_rgba(245,158,11,.85)] ring-4 ring-[#f59e0b]/40 scale-110'
                        : 'bg-gradient-to-r from-[#2b8fe0] via-[#6366f1] to-[#8b5cf6] text-white shadow-[0_0_22px_rgba(99,102,241,.85)] ring-4 ring-[#8b5cf6]/40 scale-110'
                      : 'border-2 border-white/15 bg-[#100e26] text-white/35 shadow-inner'
                  }`}
                >
                  {isPassed ? (
                    <span className="text-sm sm:text-base font-black text-white">✓</span>
                  ) : (
                    <Icon name={stage.icon} size={17} className={isCurrent ? 'text-white' : 'text-white/40'}/>
                  )}

                  {/* Pulsing halo ring on active step */}
                  {isCurrent && (
                    <span className={`absolute -inset-1.5 animate-ping rounded-full opacity-80 ${
                      isRevision ? 'bg-amber-400/40' : 'bg-[#8b5cf6]/40'
                    }`}/>
                  )}
                </div>

                {/* Stage Title */}
                <span
                  className={`mt-3 block text-[10px] sm:text-xs font-bold leading-tight ${
                    isCurrent
                      ? isRevision
                        ? 'text-amber-300 font-extrabold'
                        : 'text-[#c4b5fd] font-extrabold'
                      : isPassed
                      ? 'text-white font-bold'
                      : 'text-white/35 font-medium'
                  }`}
                >
                  {stage.label}
                </span>

                {/* Subtitle / Description */}
                <span
                  className={`mt-1 hidden sm:block text-[9px] sm:text-[10px] leading-tight ${
                    isCurrent
                      ? isRevision
                        ? 'text-amber-200/80 font-semibold'
                        : 'text-[#a5b4fc]/85 font-medium'
                      : isPassed
                      ? 'text-emerald-300/70 font-medium'
                      : 'text-white/20'
                  }`}
                >
                  {isCurrent && isRevision ? 'Revision in progress' : stage.description}
                </span>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
