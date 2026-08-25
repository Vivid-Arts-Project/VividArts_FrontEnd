import { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../components/Icon';
import CustomerHeader from '../components/CustomerHeader';
import { saveBlob } from '../utils/download';

export default function InvoicePage({ orderId, onNavigate }) {
  const [invoice, setInvoice] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadInvoice = async () => {
      try {
        const status = await api.getPaymentStatus(orderId);
        if (!status.success || status.payment?.status !== 'completed') {
          throw new Error('This invoice is not available until payment is completed.');
        }

        const blob = await api.downloadInvoice(orderId);
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setInvoice(blob);
        setPreviewUrl(objectUrl);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load the invoice.');
      }
    };

    loadInvoice();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId]);

  const download = () => {
    if (invoice) saveBlob(invoice, `invoice-${orderId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#090816] text-white">
      <CustomerHeader onNavigate={onNavigate} active="orders"/>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a99bff]">Payment completed</p>
            <h1 className="mt-2 text-3xl font-extrabold">Your invoice</h1>
            <p className="mt-2 break-all text-sm text-white/50">Order {orderId}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => onNavigate('orders')} className="rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-sm font-bold transition hover:bg-white/[.11]">My orders</button>
            <button type="button" onClick={() => onNavigate('landing')} className="rounded-xl border border-white/15 bg-white/[.06] px-4 py-2.5 text-sm font-bold transition hover:bg-white/[.11]">Home</button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[.05] shadow-[0_22px_60px_rgba(0,0,0,.28)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Icon name="download" size={19}/></span>
              <div><p className="font-bold">Invoice PDF</p><p className="text-xs text-white/45">Ready to view and download</p></div>
            </div>
            <button type="button" onClick={download} disabled={!invoice} className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-extrabold text-[#062b1b] transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-50">
              {invoice ? 'Download PDF' : 'Preparing invoice…'}
            </button>
          </div>

          {error && <div className="m-5 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-5 text-sm text-red-100">{error}</div>}
          {!error && !previewUrl && <div className="flex min-h-[420px] items-center justify-center text-sm text-white/50">Generating your invoice…</div>}
          {previewUrl && <iframe title={`Invoice ${orderId}`} src={previewUrl} className="h-[75vh] min-h-[520px] w-full bg-white"/>}
        </section>
      </main>
    </div>
  );
}
