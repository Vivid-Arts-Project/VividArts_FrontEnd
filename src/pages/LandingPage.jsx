import React from 'react';
import NotificationBell from './NotificationBell';

const stats = [
  { value: "200+", label: "Portraits delivered" },
  { value: "4.9★", label: "Average rating" },
  { value: "7–10", label: "Days turnaround" },
];

const trustBadges = [
  { icon: "🔒", label: "Secure payments via PayHere" },
  { icon: "☁️", label: "Photos on Cloudinary" },
  { icon: "📄", label: "Instant PDF invoice" },
  { icon: "🔁", label: "2 free revisions" },
  { icon: "📦", label: "Island-wide delivery" },
];

const steps = [
  {
    number: "01",
    icon: "📤",
    title: "Upload Your Photo",
    body: "Submit your reference photo through our secure commission form.",
  },
  {
    number: "02",
    icon: "💳",
    title: "Pay & Confirm",
    body: "Pay securely online via PayHere or Stripe. Receive an instant PDF invoice.",
  },
  {
    number: "03",
    icon: "📈",
    title: "Track Progress",
    body: "Watch your portrait come to life on your personal dashboard.",
  },
  {
    number: "04",
    icon: "✅",
    title: "Approve & Receive",
    body: "Review the watermarked proof, request changes, then receive your framed portrait.",
  },
];

const gallery = [
  { label: "Solo", size: "A4", icon: "🧑", tone: "from-[#4c4f8c] to-[#34355f]" },
  { label: "Couple", size: "A3", icon: "💑", tone: "from-[#b06fe0] to-[#7c4fc9]" },
];

export default function LandingPage({ onNavigate = () => {} }) {
  return (
    <div className="min-h-screen bg-[#0a0916] font-sans text-[#f5f4fb]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0916]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-8">
          <span className="text-sm font-bold tracking-[0.2em]">PENCIL PORTRAITS</span>
          <nav className="hidden gap-8 text-sm text-[#a9a6c4] md:flex">
            <a className="transition hover:text-white" href="#home">
              Home
            </a>
            <a className="transition hover:text-white" href="#gallery">
              Gallery
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How It Works
            </a>
            <a className="transition hover:text-white" href="#about">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification Bell Icon එක */}
            <NotificationBell />

            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
              onClick={() => onNavigate('login')}
            >
              Sign In
            </button>
            <button
              className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
              onClick={() => onNavigate('commission')}
            >
              Commission a Portrait
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
              ✏️ Handcrafted Pencil Portraits
            </span>
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl lg:text-[52px]">
              Your memories,
              <br />
              <span className="bg-gradient-to-r from-[#93c5fd] to-[#a78bfa] bg-clip-text text-transparent">
                drawn by hand.
              </span>
            </h1>
            <p className="mb-8 max-w-[460px] text-base leading-7 text-[#a9a6c4]">
              Commission a bespoke pencil portrait from a skilled Sri Lankan
              artist. Upload a photo, choose your size, and receive a stunning
              hand-drawn artwork — delivered to your door.
            </p>
            <div className="mb-11 flex flex-wrap gap-3.5">
              <button
                className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
                onClick={() => onNavigate('commission')}
              >
                Commission Now →
              </button>
              <button className="rounded-full border border-white/10 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]">
                View Gallery ↓
              </button>
            </div>
            <div className="flex flex-wrap gap-7">
              {stats.map((s) => (
                <div
                  className="min-w-[110px] rounded-2xl border border-white/10 bg-[#14122a] px-5 py-3.5"
                  key={s.label}
                >
                  <strong className="text-xl">{s.value}</strong>
                  <div className="mt-1 text-[12.5px] text-[#716e94]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex min-h-[280px] flex-col justify-between rounded-[20px] bg-gradient-to-br from-[#d4a574] to-[#8a6c4a] p-6 font-semibold text-[#1c1206]">
              <span className="text-sm leading-relaxed">
                Family
                <br />
                Portrait
              </span>
              <span className="self-end text-sm opacity-75">A3</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map((g) => (
                <div
                  className={`flex min-h-[140px] flex-col justify-between rounded-[14px] bg-gradient-to-br p-4 text-white ${g.tone}`}
                  key={g.label}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-[22px]">
                    {g.icon}
                  </span>
                  <span className="flex items-baseline gap-1.5 text-base font-bold">
                    {g.label}
                    <small className="text-xs font-medium opacity-70">{g.size}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-wrap justify-center gap-7 border-y border-white/10 px-6 py-5 text-sm text-[#a9a6c4] sm:px-8">
          {trustBadges.map((b) => (
            <div className="flex items-center gap-2" key={b.label}>
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-8" id="how-it-works">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Simple Process
          </span>
          <h2 className="mb-14 text-3xl font-bold sm:text-[34px]">How it works</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((s) => (
              <div
                className="rounded-[18px] border border-white/10 bg-[#14122a] p-6 text-left"
                key={s.number}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  {s.icon}
                </div>
                <span className="mb-4 block text-sm font-semibold text-[#a78bfa]">{s.number}</span>
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="text-sm leading-6 text-[#a9a6c4]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}