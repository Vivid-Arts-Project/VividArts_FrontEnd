import BrandLogo from './BrandLogo';

export default function RoundBrandLogo({ size = 56, className = '' }) {
  const markSize = Math.round(size * 0.82);

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/35 bg-white shadow-[0_10px_32px_rgba(85,91,220,.32)] ring-1 ring-[#9ca9ff]/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <BrandLogo size={markSize}/>
    </span>
  );
}
