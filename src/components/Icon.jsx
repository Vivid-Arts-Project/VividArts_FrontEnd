const paths = {
  home: (
    <>
      <path d="m3 11 9-8 9 8"/>
      <path d="M5 10v11h14V10M9 21v-7h6v7"/>
    </>
  ),
  power: (
    <>
      <path d="M12 2v10"/>
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>
    </>
  ),
  orders: (
    <>
      <path d="M9 5h6M9 9h6M9 13h4"/>
      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
      <path d="M6 5h.01M6 9h.01M6 13h.01"/>
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </>
  ),
  proofs: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <circle cx="8.5" cy="9" r="1.5"/>
      <path d="m3 17 5-5 4 4 2-2 7 6"/>
    </>
  ),
  revisions: (
    <>
      <path d="M21 12a8 8 0 0 1-13.5 5.8L3 19l1.2-4.2A8 8 0 1 1 21 12Z"/>
      <path d="M8 12h.01M12 12h.01M16 12h.01"/>
    </>
  ),
  clients: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </>
  ),
  payments: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20M6 15h2"/>
    </>
  ),
  invoices: (
    <>
      <path d="M6 2h9l5 5v15H6Z"/>
      <path d="M14 2v6h6M9 13h6M9 17h6"/>
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08a1.7 1.7 0 0 0-1.52 1Z"/>
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2"/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="m3 7 9 6 9-6"/>
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>
  ),
  pencil: (
    <>
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/>
      <path d="m13.5 8 3 3M4 20l1.5-4"/>
    </>
  ),
  cloud: (
    <path d="M17.5 19H6a4 4 0 0 1-.8-7.9A7 7 0 0 1 18.7 9a5 5 0 0 1-1.2 10Z"/>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5"/>
      <path d="M6.1 9a7 7 0 0 1 11.4-2.5L20 9M4 15l2.5 2.5A7 7 0 0 0 17.9 15"/>
    </>
  ),
  package: (
    <>
      <path d="m3 7 9-5 9 5-9 5Z"/>
      <path d="M3 7v10l9 5 9-5V7M12 12v10M7.5 4.5l9 5"/>
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2Z"/>
      <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8Z"/>
      <path d="m5 14 .6 1.4L7 16l-1.4.6L5 18l-.6-1.4L3 16l1.4-.6Z"/>
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </>
  ),
  eyeOff: (
    <>
      <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.1 3M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7a10 10 0 0 0 3.4-.6"/>
    </>
  ),
  completed: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <path d="m8 12 2.5 2.5L16 9"/>
    </>
  ),
  approval: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </>
  ),
  revenue: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M6 9H5v2M18 15h1v-2"/>
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
      <path d="M10 21h4"/>
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.75 3h15.7a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/>
      <path d="M12 9v4M12 17h.01"/>
    </>
  ),
  pointer: (
    <>
      <path d="M9 11V5a2 2 0 0 1 4 0v5-2a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.2-2.3L3.6 14a2 2 0 0 1 2.8-2.8L9 13.5"/>
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 11v5M12 8h.01"/>
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5"/>
      <path d="M4 15v5h16v-5"/>
    </>
  ),
  camera: (
    <>
      <path d="M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/>
      <circle cx="12" cy="13" r="4"/>
      <path d="M18 10h.01"/>
    </>
  ),
  pending: (
    <>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </>
  ),
  bank: (
    <>
      <path d="m3 10 9-6 9 6M5 10h14M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18"/>
    </>
  ),
  advance: (
    <>
      <path d="M4 7h16v12H4Z"/>
      <path d="M8 7V5h8v2M12 10v6M10 12h4"/>
    </>
  ),
  arrowLeft: (
    <>
      <path d="m15 18-6-6 6-6"/>
      <path d="M9 12h10"/>
    </>
  ),
  arrowRight: (
    <>
      <path d="m9 18 6-6-6-6"/>
      <path d="M5 12h10"/>
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16"/>
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18"/>
    </>
  ),
  rating: <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.32l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94Z"/>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
