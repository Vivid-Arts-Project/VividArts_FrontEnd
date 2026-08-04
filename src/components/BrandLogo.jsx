export default function BrandLogo({ size = 48, full = false, className = '' }) {
  const height = size * (full ? 0.65 : 0.52);

  return (
    <span
      aria-hidden="true"
      className={`brand-logo ${className}`}
      style={{ width: size, height }}
    >
      <img
        src="/vivid-arts-logo.png"
        alt=""
        className={`brand-logo-image ${full ? 'brand-logo-image--full' : 'brand-logo-image--mark'}`}
        style={{ width: size * 1.345, height: size * 1.345 }}
      />
    </span>
  );
}
