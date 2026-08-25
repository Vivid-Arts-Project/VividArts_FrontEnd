import BrandLogo from './BrandLogo';

export default function CommissionHeader({ onBack, onHome = () => {} }) {
  return (
    <header className="mb-[18px] flex min-h-[96px] flex-wrap items-center justify-between gap-3 overflow-hidden rounded-[20px] border border-white/70 bg-gradient-to-r from-white via-[#fbfaff] to-[#f2f5ff] px-4 py-4 font-outfit text-[#17142c] shadow-[0_18px_45px_rgba(7,5,28,0.24)] sm:gap-4 sm:px-8">
      <button type="button" onClick={onHome} className="group flex min-w-0 items-center gap-3 text-left sm:gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dcd7ff] bg-white shadow-[0_10px_24px_rgba(83,74,183,0.14)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_30px_rgba(83,74,183,0.2)] sm:h-14 sm:w-16">
          <BrandLogo size={50}/>
        </span>
        <span>
          <span className="block text-lg font-black tracking-[0.08em] text-[#17142c] sm:text-xl">VIVID ARTS</span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#726b91]">Pencil portraits</span>
        </span>
      </button>

      <nav className="ml-auto flex items-center justify-end gap-2 max-[440px]:w-full max-[440px]:justify-stretch sm:gap-2.5">
        {onBack && (
          <button type="button" onClick={onBack} className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#c5b9ff] bg-gradient-to-r from-[#eee9ff] via-[#e5e0ff] to-[#ddd9ff] px-4 py-2.5 text-sm font-semibold text-[#5337b5] shadow-[0_8px_22px_rgba(91,63,168,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#927ee8] hover:from-[#e5ddff] hover:to-[#d3ceff] hover:shadow-[0_13px_28px_rgba(91,63,168,0.25)] max-[440px]:flex-1 sm:px-5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back
          </button>
        )}
        <button type="button" onClick={onHome} className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#bcaeff] bg-gradient-to-r from-[#e9e4ff] via-[#dedbff] to-[#d5e3ff] px-4 py-2.5 text-sm font-semibold text-[#5337b5] shadow-[0_8px_22px_rgba(91,63,168,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8875df] hover:from-[#ddd5ff] hover:to-[#c9ddff] hover:shadow-[0_13px_28px_rgba(91,63,168,0.28)] max-[440px]:flex-1 sm:px-5">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>
          Home
        </button>
      </nav>
    </header>
  );
}
