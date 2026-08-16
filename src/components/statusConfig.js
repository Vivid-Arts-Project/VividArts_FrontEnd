export const STATUS_MAP = {
  in_queue:             { label: 'Queued',        icon: 'pending',   cls: 'bg-[#F0F0F8] text-[#555]'         },
  sketching:            { label: 'Sketching',      icon: 'pencil',    cls: 'bg-va-info-bg text-va-info'       },
  shading:              { label: 'Final Shading',  icon: 'pencil',    cls: 'bg-va-warn-bg text-va-warn'       },
  waiting_for_feedback: { label: 'Proof Sent',     icon: 'approval',  cls: 'bg-[#F0EBFA] text-va-purple'      },
  revision_requested:   { label: 'Revision',       icon: 'refresh',   cls: 'bg-va-danger-bg text-va-danger'   },
  approved:             { label: 'Approved & Finished', icon: 'completed', cls: 'bg-[#DCFCE7] text-[#15803D] ring-1 ring-inset ring-[#86EFAC]' },
  finished:             { label: 'Approved & Finished', icon: 'completed', cls: 'bg-va-success-bg text-va-success' },
  framed:               { label: 'Framed',         icon: 'proofs',    cls: 'bg-va-success-bg text-va-success' },
  shipped:              { label: 'Shipped',        icon: 'package',   cls: 'bg-[#ECFDF5] text-[#059669]'      },
  done:                 { label: 'Done',           icon: 'completed', cls: 'bg-va-success-bg text-va-success' },
};
