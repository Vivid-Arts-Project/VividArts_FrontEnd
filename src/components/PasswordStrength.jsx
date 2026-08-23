const passwordChecks = [
  { label: '8 Chars', test: value => value.length >= 8 },
  { label: 'A–Z', test: value => /[A-Z]/.test(value) },
  { label: 'a–z', test: value => /[a-z]/.test(value) },
  { label: '123', test: value => /[0-9]/.test(value) },
  { label: '@#$', test: value => /[^A-Za-z0-9]/.test(value) },
];

function getPasswordStrength(password = '') {
  const checks = passwordChecks.map(check => ({ ...check, met: check.test(password) }));
  const score = checks.filter(check => check.met).length;
  const tone = !password ? 'empty' : score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
  const label = !password ? 'Start typing' : tone === 'weak' ? 'Weak' : tone === 'medium' ? 'Medium' : 'Strong';
  const level = !password ? 0 : tone === 'weak' ? 1 : tone === 'medium' ? 2 : 3;
  return { checks, label, level, tone };
}

const TONES = {
  empty: { color: '#89859f', glow: 'rgba(137,133,159,.18)' },
  weak: { color: '#fb7185', glow: 'rgba(251,113,133,.35)' },
  medium: { color: '#fbbf24', glow: 'rgba(251,191,36,.35)' },
  strong: { color: '#34d399', glow: 'rgba(52,211,153,.35)' },
};

export default function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);
  const tone = TONES[strength.tone];

  return (
    <div className="mt-2.5 text-left" aria-live="polite">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-extrabold">
        <span className="text-white/45">Password Strength</span>
        <strong style={{ color: tone.color }} className="transition-colors duration-300">{strength.label}</strong>
      </div>
      <div
        role="progressbar"
        aria-label={`Password strength: ${strength.label}`}
        aria-valuemin="0"
        aria-valuemax="3"
        aria-valuenow={strength.level}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <span
          className="block h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(strength.level / 3) * 100}%`, backgroundColor: tone.color, boxShadow: `0 3px 12px ${tone.glow}` }}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap justify-between gap-x-2.5 gap-y-2" aria-label="Password requirements">
        {strength.checks.map(check => (
          <span key={check.label} className={`inline-flex items-center gap-1 text-[10px] font-extrabold transition-colors duration-300 ${check.met ? 'text-emerald-300' : 'text-white/30'}`}>
            <i aria-hidden="true" className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px] not-italic transition-all duration-300 ${check.met ? 'scale-105 border-emerald-400 bg-emerald-400 text-[#09281d]' : 'border-current'}`}>{check.met ? '✓' : ''}</i>
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
