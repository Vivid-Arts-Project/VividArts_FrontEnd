import React, { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import Icon from '../components/Icon';
import BrandLogo from '../components/BrandLogo';

const stats = [
  { value: "200+", label: "Portraits delivered" },
  { value: "4.9", label: "Average rating", icon: "rating" },
  { value: "7–10", label: "Days turnaround" },
];

const trustBadges = [
  { icon: "lock", label: "Secure payments via PayHere" },
  { icon: "cloud", label: "Photos on Cloudinary" },
  { icon: "invoices", label: "Instant PDF invoice" },
  { icon: "refresh", label: "2 free revisions" },
  { icon: "package", label: "Island-wide delivery" },
];

const steps = [
  {
    number: "01",
    icon: "upload",
    title: "Upload Your Photo",
    body: "Submit your reference photo through our secure commission form.",
  },
  {
    number: "02",
    icon: "payments",
    title: "Pay & Confirm",
    body: "Pay securely online via PayHere or Stripe. Receive an instant PDF invoice.",
  },
  {
    number: "03",
    icon: "dashboard",
    title: "Track Progress",
    body: "Watch your portrait come to life on your personal dashboard.",
  },
  {
    number: "04",
    icon: "completed",
    title: "Approve & Receive",
    body: "Review the watermarked proof, request changes, then receive your framed portrait.",
  },
];

const gallery = [
  { label: "Solo", size: "A4", icon: "user", tone: "from-[#4c4f8c] to-[#34355f]" },
  { label: "Couple", size: "A3", icon: "clients", tone: "from-[#b06fe0] to-[#7c4fc9]" },
];

export default function LandingPage({ onNavigate = () => {} }) {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(Boolean(localStorage.getItem('token')));
  const [displayName, setDisplayName] = useState(localStorage.getItem('username') || '');

  const handleCommission = () => {
    if (localStorage.getItem('token')) {
      onNavigate('commission');
      return;
    }
    setShowAuthPrompt(true);
  };

  useEffect(() => {
    const onStorage = () => setIsSignedIn(Boolean(localStorage.getItem('token')));
    const onStorageName = () => setDisplayName(localStorage.getItem('username') || '');
    window.addEventListener('storage', onStorage);
    window.addEventListener('storage', onStorageName);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('storage', onStorageName);
    };
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('token'); } catch (_) {}
    setIsSignedIn(false);
    // Optionally navigate to landing/home
    onNavigate('landing');
  };

  const handleAuthNavigation = (page) => {
    setShowAuthPrompt(false);
    onNavigate(page);
  };

  return (
    <div id="home" className="min-h-screen bg-[#0a0916] font-sans text-[#f5f4fb]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0916]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-8">
          <span className="text-sm font-bold tracking-[0.2em]">PENCIL PORTRAITS</span>
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">{(displayName || 'U').slice(0,1).toUpperCase()}</div>
              <div className="text-sm font-medium text-white/90">{displayName}</div>
            </div>
          )}
          <nav className="hidden gap-8 text-sm text-[#a9a6c4] md:flex">
            <a className="transition hover:text-white" href="#home">
              Home
            </a>
            <a className="transition hover:text-white" href="#about">
              About
            </a>
            <a className="transition hover:text-white" href="#how-it-works">
              How It Works
            </a>
            <a className="transition hover:text-white" href="#gallery">
              Gallery
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Notification Bell Icon එක */}
            <NotificationBell />

            {!isSignedIn ? (
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
                onClick={() => onNavigate('login')}
              >
                Sign In
              </button>
            ) : (
              <>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
                  onClick={() => onNavigate('profile')}
                >
                  My Account
                </button>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
            <button
              className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0a0916]"
              onClick={handleCommission}
            >
              Commission a Portrait
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="order-1 mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
              <Icon name="pencil" size={16}/> Handcrafted Pencil Portraits
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
                onClick={handleCommission}
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
                  <strong className="flex items-center gap-1.5 text-xl">
                    {s.value}
                    {s.icon && <Icon name={s.icon} size={17} className="text-[#a78bfa]"/>}
                  </strong>
                  <div className="mt-1 text-[12.5px] text-[#716e94]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="gallery" className="grid gap-4 scroll-mt-24">
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
                    <Icon name={g.icon} size={20}/>
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

        <section className="order-3 mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-7 border-y border-white/10 px-6 py-5 text-sm text-[#a9a6c4] sm:px-8">
          {trustBadges.map((b) => (
            <div className="flex items-center gap-2" key={b.label}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[.06] text-[#a99bff]">
                <Icon name={b.icon} size={17}/>
              </span>
              <span>{b.label}</span>
            </div>
          ))}
        </section>

        <section className="order-4 mx-auto w-full max-w-7xl px-6 py-20 text-center sm:px-8" id="how-it-works">
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b8fe0]/25 to-[#8b5cf6]/25 text-[#b8a9ff] ring-1 ring-white/10">
                  <Icon name={s.icon} size={23}/>
                </div>
                <span className="mb-4 block text-sm font-semibold text-[#a78bfa]">{s.number}</span>
                <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="text-sm leading-6 text-[#a9a6c4]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="order-2 relative overflow-hidden border-y border-white/10">
          <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6d5bff]/10 blur-[110px]"/>
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
            <div className="relative mx-auto min-h-[430px] w-full max-w-[480px]">
              <div className="absolute inset-x-8 inset-y-0 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#20204a] via-[#17152f] to-[#121025] shadow-[0_30px_80px_rgba(0,0,0,.35)]">
                <div className="absolute inset-5 rounded-[20px] border border-white/[.08] bg-[radial-gradient(circle_at_50%_32%,rgba(147,197,253,.2),transparent_48%)]"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrandLogo size={230} full className="opacity-95 drop-shadow-[0_18px_30px_rgba(43,143,224,.18)]"/>
                </div>
                <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
                  <div><span className="block text-[10px] uppercase tracking-[.2em] text-white/35">Vivid Arts</span><strong className="mt-1 block font-outfit text-lg">Drawn with intention</strong></div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[.07] text-[#9ccfff]"><Icon name="pencil" size={22}/></span>
                </div>
              </div>
              <div className="absolute -left-1 top-10 rounded-2xl border border-white/10 bg-[#15132d]/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                <strong className="block text-lg text-white">100%</strong>
                <span className="text-[11px] text-white/45">Hand-drawn</span>
              </div>
              <div className="absolute -right-1 top-10 rounded-2xl border border-white/10 bg-[#15132d]/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                <strong className="block text-lg text-white">Sri Lanka</strong>
                <span className="text-[11px] text-white/45">Made locally</span>
              </div>
            </div>

            <div>
              <span className="mb-4 block text-xs font-semibold uppercase tracking-[.2em] text-[#a78bfa]">About Vivid Arts</span>
              <h2 className="max-w-[650px] font-outfit text-3xl font-bold leading-tight tracking-[-.025em] text-white sm:text-[42px]">
                More than a portrait—
                <span className="block bg-gradient-to-r from-[#93c5fd] to-[#a78bfa] bg-clip-text text-transparent">a memory made permanent.</span>
              </h2>
              <p className="mt-6 max-w-[620px] text-[15px] leading-7 text-[#a9a6c4]">
                Vivid Arts is an independent Sri Lankan portrait studio dedicated to transforming meaningful photographs into carefully handcrafted pencil artwork. Every portrait is drawn with patience, precision, and respect for the story behind the image.
              </p>
              <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#77738f]">
                From the first reference photo to the final framed piece, you stay part of the creative process through secure proof reviews, clear progress updates, and thoughtful revisions.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ['pencil', 'Handcrafted', 'Created by an artist, never generated.'],
                  ['revisions', 'Collaborative', 'Your feedback shapes the final piece.'],
                  ['completed', 'Made to last', 'Finished with care for lifelong display.'],
                ].map(([icon, title, description]) => (
                  <div key={title} className="group rounded-2xl border border-white/10 bg-[#14122a] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-[#8b75dd]/40 hover:bg-[#191633]">
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b8fe0]/20 to-[#8b5cf6]/20 text-[#b7aaff] ring-1 ring-white/10 transition group-hover:scale-105">
                      <Icon name={icon} size={20}/>
                    </span>
                    <strong className="block text-sm text-white">{title}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[#77738f]">{description}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button onClick={handleCommission} className="inline-flex items-center gap-2 rounded-full border-none bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(99,102,241,.42)]">
                  Start your portrait <Icon name="arrowRight" size={17}/>
                </button>
                <span className="inline-flex items-center gap-2 text-xs text-[#77738f]"><Icon name="completed" size={16} className="text-[#5dc997]"/> Personal service from start to finish</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showAuthPrompt && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#070611]/75 px-5 backdrop-blur-md auth-prompt-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAuthPrompt(false);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="commission-auth-title" className="auth-prompt-card relative w-full max-w-[440px] overflow-hidden rounded-[26px] border border-white/[.13] bg-[#121027] shadow-[0_30px_100px_rgba(0,0,0,.6)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-[#2b8fe0]/25 via-[#7b4fc8]/20 to-transparent"/>
            <button type="button" aria-label="Close" onClick={() => setShowAuthPrompt(false)} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[.06] text-xl leading-none text-white/55 transition hover:bg-white/10 hover:text-white">×</button>
            <div className="relative px-7 pb-7 pt-9 text-center sm:px-9 sm:pb-9">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#2b8fe0] to-[#7b4fc8] text-white shadow-[0_16px_40px_rgba(91,63,168,.45)]">
                <Icon name="lock" size={28}/>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a99bff]">Customer access</span>
              <h2 id="commission-auth-title" className="mt-2 font-outfit text-2xl font-bold text-white">Sign in to commission a portrait</h2>
              <p className="mx-auto mt-3 max-w-[340px] text-sm leading-6 text-[#918da9]">
                Your account keeps reference photos, payments, artist proofs, revisions, and order updates private and secure.
              </p>

              <button type="button" onClick={() => handleAuthNavigation('login')} className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(91,63,168,.48)]">
                Sign in and continue <Icon name="arrowRight" size={17} className="transition-transform group-hover:translate-x-1"/>
              </button>
              <button type="button" onClick={() => handleAuthNavigation('register')} className="mt-3 h-[48px] w-full rounded-xl border border-white/10 bg-white/[.05] text-sm font-semibold text-white/80 transition hover:border-[#8172cf]/50 hover:bg-white/[.08] hover:text-white">
                Create a new account
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/35">
                <Icon name="lock" size={13}/> Secure access to your portrait workspace
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
