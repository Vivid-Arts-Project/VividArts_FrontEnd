import React from 'react';

export const STATUS_MAP = {
  in_queue:             { label: '⏳ Queued',        cls: 'bg-[#F0F0F8] text-[#555]'         },
  sketching:            { label: '🖊 Sketching',      cls: 'bg-va-info-bg text-va-info'       },
  shading:              { label: '✏️ Final Shading',  cls: 'bg-va-warn-bg text-va-warn'       },
  waiting_for_feedback: { label: '🔍 Proof Sent',    cls: 'bg-[#F0EBFA] text-va-purple'      },
  revision:             { label: '↩ Revision',        cls: 'bg-va-danger-bg text-va-danger'   },
  finished:             { label: '✓ Approved',        cls: 'bg-va-success-bg text-va-success' },
  framed:               { label: '🖼 Framed',          cls: 'bg-va-success-bg text-va-success' },
  shipped:              { label: '📦 Shipped',        cls: 'bg-[#ECFDF5] text-[#059669]'      },
  done:                 { label: '✅ Done',            cls: 'bg-va-success-bg text-va-success' },
};

export default function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.in_queue;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}
