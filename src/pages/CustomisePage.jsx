import { useEffect, useMemo, useState } from "react";
import Stepper from "../components/Stepper";
import BrandLogo from "../components/BrandLogo";
import { api } from "../api";

const FALLBACK_CATALOG = {
  sizes: {
    A4: { label: "A4", price: 2000, extraPersonPrice: 500 },
    A3: { label: "A3", price: 3500, extraPersonPrice: 750 },
  },
  frames: {
    none: { label: "No Frame", prices: { A4: 0, A3: 0 } },
    classic: { label: "Classic", prices: { A4: 1000, A3: 1800 } },
    premium: { label: "Premium", prices: { A4: 1500, A3: 2400 } },
  },
  deliveryPrice: 500,
  urgentPrice: 500,
};

const SIZE_DIMS = { A4: "210 × 297 mm", A3: "297 × 420 mm" };

function fmt(n) {
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function CustomisePage({ photoData, initialOrder = null, onNext = () => {}, onBack, onNavigate = () => {} }) {
  const [sizeId, setSizeId] = useState(initialOrder?.sizeId ?? "A3");
  const [frameId, setFrameId] = useState(initialOrder?.frameId ?? "classic");
  const [people, setPeople] = useState(initialOrder?.people ?? 1);
  const [notes, setNotes] = useState(initialOrder?.notes ?? "");
  const [urgent, setUrgent] = useState(initialOrder?.urgent ?? false);
  const [catalog, setCatalog] = useState(FALLBACK_CATALOG);

  useEffect(() => {
    let active = true;
    const loadLivePrices = () => api.getPrices()
      .then((data) => { if (active && data.success) setCatalog(data); })
      .catch((error) => console.error("Failed to load live pricing:", error));
    loadLivePrices();
    window.addEventListener("focus", loadLivePrices);
    return () => {
      active = false;
      window.removeEventListener("focus", loadLivePrices);
    };
  }, []);

  const sizes = Object.entries(catalog.sizes).map(([id, value]) => ({ id, ...value, dims: SIZE_DIMS[id] }));
  const size = { id: sizeId, ...catalog.sizes[sizeId], dims: SIZE_DIMS[sizeId] };
  const frames = Object.entries(catalog.frames).map(([id, value]) => ({
    id,
    label: value.label,
    price: value.prices[sizeId],
    note: value.prices[sizeId] ? `+ ${fmt(value.prices[sizeId])}` : "Included",
  }));
  const frame = frames.find((item) => item.id === frameId);
  const extraPersonPrice = size.extraPersonPrice;

  const total = useMemo(
    () => size.price + frame.price + Math.max(0, people - 1) * extraPersonPrice
      + catalog.deliveryPrice + (urgent ? catalog.urgentPrice : 0),
    [size.price, frame.price, people, extraPersonPrice, catalog.deliveryPrice, catalog.urgentPrice, urgent]
  );
  const deposit = Math.round(total * 0.5);

  function handleContinue() {
    onNext({
      sizeId,
      frameId,
      people,
      notes,
      urgent,
      size,
      frame,
      basePrice: size.price,
      framePrice: frame.price,
      extraPersonPrice,
      peoplePrice: Math.max(0, people - 1) * extraPersonPrice,
      deliveryPrice: catalog.deliveryPrice,
      urgentPrice: urgent ? catalog.urgentPrice : 0,
      total,
      deposit,
    });
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] pb-16 font-sans text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-8 pt-7">
        <span className="flex items-center gap-3"><BrandLogo size={44}/><span className="text-sm font-bold tracking-[0.2em]">PENCIL PORTRAITS</span></span>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]"
            onClick={onBack}
          >
            ← Back
          </button>
          <button type="button" onClick={() => onNavigate('profile')} className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]">
            My Account
          </button>
        </div>
      </header>

      <div className="mx-auto mt-7 max-w-7xl px-8">
        <Stepper current={2} />
      </div>

      <main className="mx-auto mt-7 grid max-w-7xl gap-6 px-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <section className="rounded-[18px] bg-white p-6 text-[#1b1830] shadow-xl sm:p-7">
          <h2 className="text-xl font-bold">Customize Your Portrait</h2>
          <p className="mt-1 text-sm text-[#6b6885]">
            Price updates in real-time as you choose
          </p>

          {photoData?.previewUrl && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f7f6ff] p-3">
              <img
                src={photoData.previewUrl}
                alt="Uploaded preview"
                className="h-[52px] w-[52px] rounded-lg object-cover"
              />
              <span className="text-sm font-semibold text-[#6366f1]">
                Reference photo uploaded ✓
              </span>
            </div>
          )}

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Size
          </label>
          <div className="mb-1 grid gap-3 sm:grid-cols-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${ 
                  sizeId === s.id
                    ? "border-[#6366f1] bg-[#f5f3ff] "
                    : "border-[#e7e5f1] bg-white"
                   
                }`}
                onClick={() => setSizeId(s.id)}
              >
                <span className="flex flex-col gap-1 text-[15px]   font-bold">
                  {s.label}
                  <small className="text-sm font-medium text-[#6b6885] ">{s.dims}</small>
                </span>
                <span className={`text-sm ${sizeId === s.id ? "text-[#6366f1]" : "text-[#6b6885]" }`}>
                  from {fmt(s.price)}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Frame
          </label>
          <div className="mb-1 grid gap-3 md:grid-cols-3">
            {frames.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition ${
                  frameId === f.id
                    ? "border-[#6366f1] bg-[#f5f3ff]"
                    : "border-[#e7e5f1] bg-white"
                }`}
                onClick={() => setFrameId(f.id)}
              >
                <span className="text-[15px] font-bold">{f.label}</span>
                <span className={`text-sm ${frameId === f.id ? "text-[#6366f1]" : "text-[#6b6885]"}`}>
                  {f.note}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Number of People
          </label>
          <div className="mb-1 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-[#e7e5f1] px-4 py-2">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e7e5f1] bg-[#f5f4fa] text-lg"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[14px] text-center font-bold">{people}</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e7e5f1] bg-[#f5f4fa] text-lg"
                onClick={() => setPeople((p) => Math.min(10, p + 1))}
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <span className="text-sm text-[#6b6885]">
              × {fmt(extraPersonPrice)} extra per additional person
            </span>
          </div>

          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-[#e7e5f1] bg-[#fafafe] p-4">
            <span><strong className="block text-sm">Urgent order</strong><span className="text-xs text-[#6b6885]">Add {fmt(catalog.urgentPrice)} for priority handling</span></span>
            <input type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} className="h-5 w-5 accent-[#6366f1]" />
          </label>

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]" htmlFor="cp-notes">
            Special Instructions <span className="text-xs font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="cp-notes"
            className="w-full resize-y rounded-xl border border-[#e7e5f1] bg-[#fafafe] px-3.5 py-3 text-sm text-[#1b1830] outline-none focus:ring-2 focus:ring-[#6366f1]"
            rows={4}
            placeholder="E.g. Please focus on the facial expression, soft background..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-[18px] bg-white p-6 text-[#1b1830] shadow-xl sm:p-7">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <dl className="mt-2">
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Size</dt>
                <dd className="font-semibold">{size.id}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Base Price</dt>
                <dd className="font-semibold">{fmt(size.price)}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Frame</dt>
                <dd className="font-semibold">
                  {frame.label}
                  {frame.price > 0 ? ` (+${frame.price.toLocaleString("en-LK")})` : ""}
                </dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">People</dt>
                <dd className="font-semibold">{people}</dd>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-[#6b6885]">Delivery charge</dt>
                <dd className="font-semibold">{fmt(catalog.deliveryPrice)}</dd>
              </div>
              {urgent && <div className="flex justify-between border-t border-[#e7e5f1] py-2.5 text-sm"><dt className="text-[#6b6885]">Urgent order</dt><dd className="font-semibold">{fmt(catalog.urgentPrice)}</dd></div>}
            </dl>

            <div className="mt-4 rounded-xl bg-[#f5f3ff] p-4 text-center">
              <span className="text-sm text-[#6b6885]">Total</span>
              <div className="mt-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-3xl font-bold text-transparent">
                {fmt(total)}
              </div>
              <span className="mt-1 block text-xs text-[#6b6885]">
                50% deposit required to begin ({fmt(deposit)})
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-white"
              style={{ color: "#ffffff" }}
            >
              Continue to payment →
            </button>
          </section>

         
        </div>
      </main>
    </div>
  );
}
