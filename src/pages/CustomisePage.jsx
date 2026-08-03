import { useMemo, useState } from "react";
import Stepper from "../components/Stepper";
import { showNotification } from "./NotificationContainer";

const SIZES = [
  { id: "A4", label: "A4", dims: "210 × 297 mm", price: 2500 },
  { id: "A3", label: "A3", dims: "297 × 420 mm", price: 3800 },
];

const FRAMES = [
  { id: "none", label: "No Frame", note: "Included", price: 0 },
  { id: "classic", label: "Classic", note: "+ LKR 800", price: 800 },
  { id: "premium", label: "Premium", note: "+ LKR 1,500", price: 1500 },
];

const SUBJECT_OPTIONS = [
  { id: "one", label: "1 subject", note: "Single portrait", price: 0 },
  { id: "two", label: "2 subjects", note: "+ LKR 1,200", price: 1200 },
  { id: "more", label: "More than 2", note: "+ LKR 2,200", price: 2200 },
];

const PICKUP_OPTIONS = [
  { id: "courier", label: "Courier delivery", note: "+ LKR 650", price: 650 },
  { id: "pickup", label: "Pickup", note: "Included", price: 0 },
];

const EXTRA_PERSON = 500;
const URGENT_BASE_PRICE = 2500;
const URGENT_EXTRA_PER_DAY = 400;
const MIN_DEADLINE_DAYS = 7;

function fmt(n) {
  return `LKR ${n.toLocaleString("en-LK")}`;
}

export default function CustomisePage({ photoData, initialOrder = null, onNext = () => {}, onBack }) {
  const [sizeId, setSizeId] = useState(initialOrder?.sizeId ?? "A3");
  const [frameId, setFrameId] = useState(initialOrder?.frameId ?? "classic");
  const [subjectId, setSubjectId] = useState(initialOrder?.subjectId ?? "one");
  const [pickupId, setPickupId] = useState(initialOrder?.pickupId ?? "courier");
  const [people, setPeople] = useState(initialOrder?.people ?? 1);
  const [isUrgent, setIsUrgent] = useState(initialOrder?.isUrgent ?? false);
  const [deadlineDays, setDeadlineDays] = useState(initialOrder?.deadlineDays ?? MIN_DEADLINE_DAYS);
  const [notes, setNotes] = useState(initialOrder?.notes ?? "");
  const [error, setError] = useState("");

  const size = SIZES.find((s) => s.id === sizeId);
  const frame = FRAMES.find((f) => f.id === frameId);
  const subject = SUBJECT_OPTIONS.find((item) => item.id === subjectId);
  const pickup = PICKUP_OPTIONS.find((item) => item.id === pickupId);

  const urgentSurcharge = useMemo(() => {
    if (!isUrgent) return 0;
    return URGENT_BASE_PRICE + Math.max(0, deadlineDays - MIN_DEADLINE_DAYS) * URGENT_EXTRA_PER_DAY;
  }, [deadlineDays, isUrgent]);

  const peoplePrice = Math.max(0, people - 1) * EXTRA_PERSON;
  const total = useMemo(
    () => size.price + frame.price + subject.price + pickup.price + peoplePrice + urgentSurcharge,
    [frame.price, peoplePrice, pickup.price, size.price, subject.price, urgentSurcharge]
  );
  const deposit = Math.round(total * 0.5);
  const hasReferencePhoto = Boolean(photoData?.previewUrl || photoData?.photo);

  function handleContinue() {
    if (!hasReferencePhoto) {
      const message = "Please upload at least one high-resolution reference photo before continuing.";
      setError(message);
      showNotification("error", message);
      return;
    }

    setError("");
    onNext({
      sizeId,
      frameId,
      subjectId,
      pickupId,
      people,
      isUrgent,
      deadlineDays,
      notes,
      size,
      frame,
      subject,
      pickup,
      basePrice: size.price,
      framePrice: frame.price,
      subjectPrice: subject.price,
      pickupPrice: pickup.price,
      peoplePrice,
      urgencyPrice: urgentSurcharge,
      total,
      deposit,
    });
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] pb-16 font-sans text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-8 pt-7">
        <span className="text-sm font-bold tracking-[0.2em]">PENCIL PORTRAITS</span>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]"
            onClick={onBack}
          >
            ← Back
          </button>
          <button className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]">
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

          {hasReferencePhoto ? (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f7f6ff] p-3">
              <img
                src={photoData.previewUrl}
                alt="Uploaded preview"
                className="h-[52px] w-[52px] rounded-lg object-cover"
              />
              <span className="text-sm font-semibold text-[#6366f1]">
                High-resolution reference photo uploaded ✓
              </span>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-[#e7e5f1] bg-[#fafafe] p-3 text-sm text-[#6b6885]">
              Upload at least one clear reference photo before you continue.
            </div>
          )}

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Size
          </label>
          <div className="mb-1 grid gap-3 sm:grid-cols-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition ${
                  sizeId === s.id
                    ? "border-[#6366f1] bg-[#f5f3ff]"
                    : "border-[#e7e5f1] bg-white"
                }`}
                onClick={() => setSizeId(s.id)}
              >
                <span className="flex flex-col gap-1 text-[15px] font-bold">
                  {s.label}
                  <small className="text-sm font-medium text-[#6b6885]">{s.dims}</small>
                </span>
                <span className={`text-sm ${sizeId === s.id ? "text-[#6366f1]" : "text-[#6b6885]"}`}>
                  from {fmt(s.price)}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Frame
          </label>
          <div className="mb-1 grid gap-3 md:grid-cols-3">
            {FRAMES.map((f) => (
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
            Subjects to draw
          </label>
          <div className="mb-1 grid gap-3 md:grid-cols-3">
            {SUBJECT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition ${
                  subjectId === option.id
                    ? "border-[#6366f1] bg-[#f5f3ff]"
                    : "border-[#e7e5f1] bg-white"
                }`}
                onClick={() => setSubjectId(option.id)}
              >
                <span className="text-[15px] font-bold">{option.label}</span>
                <span className={`text-sm ${subjectId === option.id ? "text-[#6366f1]" : "text-[#6b6885]"}`}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-5 mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
            Pickup option
          </label>
          <div className="mb-1 grid gap-3 md:grid-cols-2">
            {PICKUP_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition ${
                  pickupId === option.id
                    ? "border-[#6366f1] bg-[#f5f3ff]"
                    : "border-[#e7e5f1] bg-white"
                }`}
                onClick={() => setPickupId(option.id)}
              >
                <span className="text-[15px] font-bold">{option.label}</span>
                <span className={`text-sm ${pickupId === option.id ? "text-[#6366f1]" : "text-[#6b6885]"}`}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#e7e5f1] bg-[#fafafe] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold">Urgent order</h3>
                <p className="text-sm text-[#6b6885]">Fast-track delivery with added rush pricing.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUrgent((value) => !value)}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isUrgent
                    ? "bg-[#6366f1] text-white"
                    : "border border-[#e7e5f1] bg-white text-[#6b6885]"
                }`}
              >
                {isUrgent ? "Urgent On" : "Urgent"}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6b6885]">
              Minimum deadline is 7 days. Adds {fmt(URGENT_BASE_PRICE)} + {fmt(URGENT_EXTRA_PER_DAY)} per extra day.
            </p>
            {isUrgent && (
              <div className="mt-3 rounded-lg border border-[#e7e5f1] bg-white p-3">
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b6885]">
                  Delivery deadline
                </label>
                <select
                  value={deadlineDays}
                  onChange={(event) => setDeadlineDays(Number(event.target.value))}
                  className="w-full rounded-lg border border-[#e7e5f1] bg-[#fafafe] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6366f1]"
                >
                  <option value={7}>7 days (minimum)</option>
                  <option value={10}>10 days</option>
                  <option value={14}>14 days</option>
                </select>
              </div>
            )}
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
              × {fmt(EXTRA_PERSON)} extra per additional person
            </span>
          </div>

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
                <dt className="text-[#6b6885]">Subjects</dt>
                <dd className="font-semibold">{subject.label}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">Pickup</dt>
                <dd className="font-semibold">{pickup.label}</dd>
              </div>
              <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                <dt className="text-[#6b6885]">People</dt>
                <dd className="font-semibold">{people}</dd>
              </div>
              {isUrgent && (
                <div className="flex justify-between border-b border-[#e7e5f1] py-2.5 text-sm">
                  <dt className="text-[#6b6885]">Urgent</dt>
                  <dd className="font-semibold">{deadlineDays} days</dd>
                </div>
              )}
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-[#6b6885]">Delivery</dt>
                <dd className="font-semibold">{isUrgent ? `${deadlineDays} days` : "7–10 working days"}</dd>
              </div>
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

            {error && <p className="mt-3 text-sm font-medium text-[#e54d4d]">{error}</p>}

            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-white"
              style={{ color: "#ffffff" }}
            >
              Confirm order & pay →
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
