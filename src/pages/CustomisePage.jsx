import { useEffect, useMemo, useRef, useState } from "react";
import Stepper from "../components/Stepper";
import CommissionHeader from "../components/CommissionHeader";
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

function asPrice(value, fallback = 0) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : fallback;
}

function fmt(value) {
  return `LKR ${asPrice(value).toLocaleString("en-LK")}`;
}

function normalizeCatalog(data) {
  const sizes = Object.fromEntries(Object.entries(FALLBACK_CATALOG.sizes).map(([id, fallback]) => {
    const live = data?.sizes?.[id] ?? {};
    return [id, {
      ...fallback,
      ...live,
      price: asPrice(live.price, fallback.price),
      extraPersonPrice: asPrice(live.extraPersonPrice, fallback.extraPersonPrice),
    }];
  }));

  const frames = Object.fromEntries(Object.entries(FALLBACK_CATALOG.frames).map(([id, fallback]) => {
    const live = data?.frames?.[id] ?? {};
    return [id, {
      ...fallback,
      ...live,
      prices: Object.fromEntries(Object.keys(FALLBACK_CATALOG.sizes).map((sizeId) => [
        sizeId,
        asPrice(live.prices?.[sizeId], fallback.prices[sizeId]),
      ])),
    }];
  }));

  return {
    ...FALLBACK_CATALOG,
    ...data,
    sizes,
    frames,
    deliveryPrice: asPrice(data?.deliveryPrice, FALLBACK_CATALOG.deliveryPrice),
    urgentPrice: asPrice(data?.urgentPrice, FALLBACK_CATALOG.urgentPrice),
  };
}

export default function CustomisePage({ photoData, initialOrder = null, onNext = () => {}, onBack, onNavigate = () => {} }) {
  const [sizeId, setSizeId] = useState(initialOrder?.sizeId ?? "");
  const [frameId, setFrameId] = useState(initialOrder?.frameId ?? "");
  const [people, setPeople] = useState(initialOrder?.people ?? 1);
  const [notes, setNotes] = useState(initialOrder?.notes ?? "");
  const [deliveryMethod, setDeliveryMethod] = useState(initialOrder?.deliveryMethod ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState(initialOrder?.deliveryAddress ?? "");
  const [deliveryAddressError, setDeliveryAddressError] = useState("");
  const [urgent, setUrgent] = useState(initialOrder?.urgent ?? false);
  const [urgentDeadline, setUrgentDeadline] = useState(initialOrder?.urgentDeadline ?? "");
  const [urgentDeadlineError, setUrgentDeadlineError] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [catalog, setCatalog] = useState(FALLBACK_CATALOG);
  const deliveryAddressRef = useRef(null);
  const urgentDeadlineRef = useRef(null);

  const minimumUrgentDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    let active = true;
    const loadLivePrices = () => api.getPrices()
      .then((data) => { if (active && data.success) setCatalog(normalizeCatalog(data)); })
      .catch((error) => console.error("Failed to load live pricing:", error));
    loadLivePrices();
    window.addEventListener("focus", loadLivePrices);
    return () => {
      active = false;
      window.removeEventListener("focus", loadLivePrices);
    };
  }, []);

  const sizes = Object.entries(catalog.sizes).map(([id, value]) => ({ id, ...value, dims: SIZE_DIMS[id] }));
  const size = sizeId ? { id: sizeId, ...catalog.sizes[sizeId], dims: SIZE_DIMS[sizeId] } : null;
  const frames = Object.entries(catalog.frames).map(([id, value]) => ({
    id,
    label: value.label,
    price: sizeId ? value.prices[sizeId] : 0,
    note: sizeId ? (value.prices[sizeId] ? `+ ${fmt(value.prices[sizeId])}` : "Included") : "Select a size first",
  }));
  const frame = frames.find((item) => item.id === frameId) ?? null;
  const extraPersonPrice = size?.extraPersonPrice ?? 0;

  const total = useMemo(
    () => (size?.price ?? 0) + (frame?.price ?? 0) + Math.max(0, people - 1) * extraPersonPrice
      + (deliveryMethod === "courier" ? catalog.deliveryPrice : 0) + (urgent ? catalog.urgentPrice : 0),
    [size?.price, frame?.price, people, extraPersonPrice, deliveryMethod, catalog.deliveryPrice, catalog.urgentPrice, urgent]
  );
  const deposit = Math.round(total * 0.5);

  function handleContinue() {
    if (!sizeId || !frameId || !deliveryMethod) {
      setSelectionError("Please select a portrait size, frame, and delivery option before continuing.");
      return;
    }

    setSelectionError("");
    if (deliveryMethod === "courier" && !deliveryAddress.trim()) {
      setDeliveryAddressError("Please enter the address where we should deliver your portrait.");
      window.requestAnimationFrame(() => {
        deliveryAddressRef.current?.focus({ preventScroll: true });
        deliveryAddressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    if (urgent && (!urgentDeadline || urgentDeadline < minimumUrgentDate)) {
      setUrgentDeadlineError(`Please select a date on or after ${new Date(`${minimumUrgentDate}T00:00:00`).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}.`);
      window.requestAnimationFrame(() => {
        urgentDeadlineRef.current?.focus({ preventScroll: true });
        urgentDeadlineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setUrgentDeadlineError("");
    setDeliveryAddressError("");
    onNext({
      sizeId,
      frameId,
      people,
      notes,
      deliveryMethod,
      deliveryAddress: deliveryMethod === "courier" ? deliveryAddress.trim() : null,
      urgent,
      urgentDeadline: urgent ? urgentDeadline : null,
      size,
      frame,
      basePrice: size.price,
      framePrice: frame.price,
      extraPersonPrice,
      peoplePrice: Math.max(0, people - 1) * extraPersonPrice,
      deliveryPrice: deliveryMethod === "courier" ? catalog.deliveryPrice : 0,
      urgentPrice: urgent ? catalog.urgentPrice : 0,
      total,
      deposit,
    });
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] pb-16 font-sans text-white">
      <div className="mx-auto max-w-[980px] px-[18px] py-7">
        <CommissionHeader onBack={onBack} onHome={() => onNavigate('landing')} />
        <Stepper current={2} />

      <main className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
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

          {selectionError && (
            <div className="mt-4 rounded-xl border border-[#e9a39a] bg-[#fff3f1] px-4 py-3 text-sm font-semibold text-[#b33c2e]">
              {selectionError}
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
                className={`group relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-300 ${ 
                  sizeId === s.id
                    ? "border-[#6366f1] bg-gradient-to-br from-[#f5f3ff] to-[#eef5ff] shadow-[0_10px_24px_rgba(99,102,241,0.14)]"
                    : "border-[#e7e5f1] bg-white hover:-translate-y-0.5 hover:border-[#bbb3ee] hover:shadow-[0_10px_22px_rgba(99,102,241,0.08)]"
                   
                }`}
                onClick={() => {
                  setSizeId(s.id);
                  setFrameId("");
                  setSelectionError("");
                }}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex flex-col gap-1 text-[15px] font-bold">
                    {s.label}
                    <small className="text-sm font-medium text-[#6b6885]">{s.dims}</small>
                  </span>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${sizeId === s.id ? "border-[#6366f1]" : "border-[#c9c6d7] group-hover:border-[#9489df]"}`}>
                    <span className={`rounded-full bg-[#6366f1] transition-all duration-300 ${sizeId === s.id ? "h-2.5 w-2.5 scale-100 opacity-100" : "h-0 w-0 scale-0 opacity-0"}`} />
                  </span>
                </span>
                <span className={`text-sm font-semibold transition-colors ${sizeId === s.id ? "text-[#5a3fbb]" : "text-[#6b6885]" }`}>
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
                className={`group relative flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
                  frameId === f.id
                    ? "border-[#6366f1] bg-gradient-to-br from-[#f5f3ff] to-[#eef5ff] shadow-[0_10px_24px_rgba(99,102,241,0.14)]"
                    : "border-[#e7e5f1] bg-white hover:-translate-y-0.5 hover:border-[#bbb3ee] hover:shadow-[0_10px_22px_rgba(99,102,241,0.08)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-[#eceaf3] disabled:bg-[#faf9fc] disabled:opacity-65 disabled:shadow-none"
                }`}
                onClick={() => { setFrameId(f.id); setSelectionError(""); }}
                disabled={!sizeId}
              >
                <span className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${frameId === f.id ? "border-[#6366f1]" : "border-[#c9c6d7] group-hover:border-[#9489df] group-disabled:border-[#d8d5e1]"}`}>
                  <span className={`rounded-full bg-[#6366f1] transition-all duration-300 ${frameId === f.id ? "h-2.5 w-2.5 scale-100 opacity-100" : "h-0 w-0 scale-0 opacity-0"}`} />
                </span>
                <span className="text-[15px] font-bold">{f.label}</span>
                <span className={`text-sm font-semibold transition-colors ${frameId === f.id ? "text-[#5a3fbb]" : "text-[#6b6885]"}`}>
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

          <fieldset className="mt-5">
            <legend className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">Delivery option</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`group cursor-pointer rounded-2xl border-2 p-4 transition-all ${deliveryMethod === "courier" ? "border-[#6366f1] bg-gradient-to-br from-[#f5f3ff] to-[#eef5ff] shadow-[0_10px_24px_rgba(99,102,241,0.14)]" : "border-[#e7e5f1] bg-white hover:-translate-y-0.5 hover:border-[#bbb3ee]"}`}>
                <input type="radio" name="delivery-method" value="courier" checked={deliveryMethod === "courier"} onChange={(event) => { setDeliveryMethod(event.target.value); setSelectionError(""); }} className="sr-only" />
                <span className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${deliveryMethod === "courier" ? "bg-[#6366f1] text-white" : "bg-[#f1effc] text-[#67607f]"}`}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-extrabold text-[#29253b]">Courier delivery</strong>
                    <span className={`mt-1 block text-sm font-bold ${deliveryMethod === "courier" ? "text-[#5a3fbb]" : "text-[#6b6885]"}`}>+ {fmt(catalog.deliveryPrice)}</span>
                  </span>
                  <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full border-2 ${deliveryMethod === "courier" ? "border-[#6366f1]" : "border-[#c9c6d7]"}`}>
                    {deliveryMethod === "courier" && <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />}
                  </span>
                </span>
              </label>

              <label className={`group cursor-pointer rounded-2xl border-2 p-4 transition-all ${deliveryMethod === "pickup" ? "border-[#6366f1] bg-gradient-to-br from-[#f5f3ff] to-[#eef5ff] shadow-[0_10px_24px_rgba(99,102,241,0.14)]" : "border-[#e7e5f1] bg-white hover:-translate-y-0.5 hover:border-[#bbb3ee]"}`}>
                <input type="radio" name="delivery-method" value="pickup" checked={deliveryMethod === "pickup"} onChange={(event) => { setDeliveryMethod(event.target.value); setDeliveryAddressError(""); setSelectionError(""); }} className="sr-only" />
                <span className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${deliveryMethod === "pickup" ? "bg-[#6366f1] text-white" : "bg-[#f1effc] text-[#67607f]"}`}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M9 20v-5h6v5"/></svg>
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm font-extrabold text-[#29253b]">Pickup</strong>
                    <span className={`mt-1 block text-sm font-bold ${deliveryMethod === "pickup" ? "text-[#5a3fbb]" : "text-[#6b6885]"}`}>No cost</span>
                  </span>
                  <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full border-2 ${deliveryMethod === "pickup" ? "border-[#6366f1]" : "border-[#c9c6d7]"}`}>
                    {deliveryMethod === "pickup" && <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          {deliveryMethod === "courier" && (
            <div className="mt-3 rounded-2xl border-2 border-[#d9d3ff] bg-gradient-to-br from-[#faf9ff] to-[#f0f5ff] p-4 shadow-[0_10px_24px_rgba(99,102,241,0.1)] sm:p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6366f1] text-white shadow-[0_8px_20px_rgba(99,102,241,0.25)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1116 0z"/><circle cx="12" cy="10" r="2.5"/></svg>
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="delivery-address" className="block text-sm font-extrabold text-[#29253b]">Delivery address</label>
                  <p className="mt-1 text-xs leading-5 text-[#6b6885]">Enter the complete address where your finished portrait should be delivered.</p>
                  <textarea
                    id="delivery-address"
                    ref={deliveryAddressRef}
                    rows={3}
                    value={deliveryAddress}
                    onChange={(event) => { setDeliveryAddress(event.target.value); setDeliveryAddressError(""); }}
                    placeholder="House number, street, city, postal code"
                    aria-invalid={Boolean(deliveryAddressError)}
                    aria-describedby={deliveryAddressError ? "delivery-address-error" : undefined}
                    className={`mt-3 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#29253b] outline-none transition focus:ring-4 ${deliveryAddressError ? "border-[#dc5d48] focus:border-[#dc5d48] focus:ring-[#dc5d48]/10" : "border-[#cfc8ff] focus:border-[#6366f1] focus:ring-[#6366f1]/10"}`}
                  />
                  {deliveryAddressError && <p id="delivery-address-error" className="mt-2 text-xs font-semibold text-[#c2412d]">{deliveryAddressError}</p>}
                </div>
              </div>
            </div>
          )}

          <label className={`group relative mt-5 flex cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300 sm:p-5 ${
            urgent
              ? "border-[#f59e0b] bg-gradient-to-r from-[#fff8e7] to-[#fff1d4] shadow-[0_14px_30px_rgba(245,158,11,0.18)]"
              : "border-[#f1cc83] bg-gradient-to-r from-[#fffdf7] to-[#fff8e9] shadow-[0_10px_24px_rgba(180,121,22,0.1)] hover:-translate-y-0.5 hover:border-[#f0ad32] hover:shadow-[0_15px_32px_rgba(180,121,22,0.16)]"
          }`}>
            <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#fbbf24]/10" />
            <span className="relative flex min-w-0 items-center gap-3.5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${urgent ? "bg-[#f59e0b] text-white" : "bg-[#fff0c4] text-[#c77808]"}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2L4.5 13h7L11 22l8.5-11h-7L13 2z" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="mb-1 flex flex-wrap items-center gap-2">
                  <strong className="text-base font-extrabold text-[#2a2117]">Urgent order</strong>
                  <span className="rounded-full bg-[#f59e0b] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Priority</span>
                </span>
                <span className="block text-sm font-medium text-[#7a5b28]">
                  Faster priority handling for <strong className="text-[#b86606]">+ {fmt(catalog.urgentPrice)}</strong>
                </span>
              </span>
            </span>
            <span className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 ${urgent ? "border-[#d78708] bg-[#f59e0b]" : "border-[#d6b879] bg-white"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-300 ${urgent ? "left-[25px] bg-white" : "left-0.5 bg-[#caa45e]"}`} />
            </span>
            <input
              type="checkbox"
              checked={urgent}
              onChange={(event) => {
                setUrgent(event.target.checked);
                setUrgentDeadlineError("");
              }}
              className="sr-only"
            />
          </label>

          {urgent && (
            <div className="mt-3 overflow-hidden rounded-2xl border-2 border-[#f3cf89] bg-gradient-to-br from-[#fffdf8] via-[#fff9eb] to-[#fff3d8] p-4 shadow-[0_12px_28px_rgba(180,121,22,0.12)] sm:p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#c77808] shadow-[0_7px_18px_rgba(180,121,22,0.14)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M8 2v4M16 2v4M3 9h18" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <label htmlFor="urgent-deadline" className="block text-sm font-extrabold text-[#2a2117]">
                    When do you need your portrait?
                  </label>
                  <p className="mt-1 text-xs leading-5 text-[#806334]">
                    Choose your preferred completion date. Urgent portraits require at least 7 days.
                  </p>
                  <input
                    id="urgent-deadline"
                    ref={urgentDeadlineRef}
                    type="date"
                    min={minimumUrgentDate}
                    value={urgentDeadline}
                    onChange={(event) => {
                      setUrgentDeadline(event.target.value);
                      setUrgentDeadlineError("");
                    }}
                    aria-invalid={Boolean(urgentDeadlineError)}
                    aria-describedby={urgentDeadlineError ? "urgent-deadline-error" : undefined}
                    className={`mt-3 w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-[#342819] outline-none transition focus:ring-4 ${urgentDeadlineError ? "border-[#dc5d48] focus:border-[#dc5d48] focus:ring-[#dc5d48]/10" : "border-[#e5bc69] focus:border-[#e49a18] focus:ring-[#f59e0b]/10"}`}
                  />
                  {urgentDeadlineError && <p id="urgent-deadline-error" className="mt-2 text-xs font-semibold text-[#c2412d]">{urgentDeadlineError}</p>}
                </div>
              </div>
            </div>
          )}

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
                <dd className="font-semibold">{size?.id || "Not selected"}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Base Price</dt>
                <dd className="font-semibold">{size ? fmt(size.price) : "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Frame</dt>
                <dd className="font-semibold">
                  {frame ? frame.label : "Not selected"}
                  {frame?.price > 0 ? ` (+${asPrice(frame.price).toLocaleString("en-LK")})` : ""}
                </dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">People</dt>
                <dd className="font-semibold">{people}</dd>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-[#6b6885]">Delivery</dt>
                <dd className="font-semibold">{deliveryMethod === "courier" ? `Courier (${fmt(catalog.deliveryPrice)})` : deliveryMethod === "pickup" ? "Pickup (Free)" : "Not selected"}</dd>
              </div>
              {urgent && <div className="flex justify-between border-t border-[#e7e5f1] py-2.5 text-sm"><dt className="text-[#6b6885]">Urgent order</dt><dd className="font-semibold">{fmt(catalog.urgentPrice)}</dd></div>}
              {urgent && urgentDeadline && <div className="flex justify-between border-t border-[#e7e5f1] py-2.5 text-sm"><dt className="text-[#6b6885]">Requested by</dt><dd className="font-semibold">{new Date(`${urgentDeadline}T00:00:00`).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}</dd></div>}
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
    </div>
  );
}
