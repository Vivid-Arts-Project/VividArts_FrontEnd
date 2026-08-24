import { useState } from 'react';
import Icon from '../components/Icon';
import RoundBrandLogo from '../components/RoundBrandLogo';

function PasswordInput({ label, value, onChange, visible, onToggle }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-white/70">{label}</span><span className="flex items-center rounded-xl border border-white/10 bg-white/[.055] px-4 focus-within:border-[#7b8cff]"><input className="h-12 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25" type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder="Minimum 8 characters" autoComplete="new-password" required/><button type="button" onClick={onToggle} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-white/40 hover:bg-white/5 hover:text-white" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}><Icon name={visible ? 'eyeOff' : 'eye'} size={18}/></button></span></label>;
}

export default function ForgotPasswordPage({ onNavigate }) {
  const [step, setStep] = useState('email');
  const [form, setForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [visible, setVisible] = useState({ newPassword: false, confirmPassword: false });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault(); setBusy(true); setMessage(''); setError(false);
    try {
      const reset = step === 'code';
      const response = await fetch(`/api/customers/forgot-password/${reset ? 'reset' : 'send-otp'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reset ? form : { email: form.email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to continue.');
      setMessage(data.message);
      if (!reset) setStep('code');
      else setTimeout(() => onNavigate('login'), 1200);
    } catch (err) { setError(true); setMessage(err.message || 'Unable to continue.'); }
    finally { setBusy(false); }
  };
  const matches = form.confirmPassword && form.newPassword === form.confirmPassword;
  return <div className="flex min-h-screen items-center justify-center bg-[#090816] px-4 py-10 text-white"><div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#111025] p-8 shadow-2xl"><button type="button" onClick={() => onNavigate('landing')} className="mb-7 flex items-center gap-3 bg-transparent text-white"><RoundBrandLogo size={48}/><strong className="font-outfit tracking-wider">VIVID ARTS</strong></button><h1 className="font-outfit text-2xl font-bold">Reset your password</h1><p className="mt-2 text-sm leading-6 text-white/50">{step === 'email' ? 'Enter the email linked to your customer account.' : 'Enter the verification code from your email and choose a new password.'}</p><form onSubmit={submit} className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-xs font-semibold text-white/70">Email address</span><input className="h-12 w-full rounded-xl border border-white/10 bg-white/[.055] px-4 text-sm text-white outline-none focus:border-[#7b8cff]" type="email" value={form.email} onChange={e => set('email', e.target.value)} disabled={step === 'code'} required/></label>{step === 'code' && <><label className="block"><span className="mb-2 block text-xs font-semibold text-white/70">6-digit verification code</span><input className="h-12 w-full rounded-xl border border-white/10 bg-white/[.055] px-4 text-sm tracking-[.25em] text-white outline-none focus:border-[#7b8cff]" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={form.code} onChange={e => set('code', e.target.value.replace(/\D/g, ''))} required/></label><PasswordInput label="New password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} visible={visible.newPassword} onToggle={() => setVisible(v => ({ ...v, newPassword: !v.newPassword }))}/><PasswordInput label="Confirm new password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} visible={visible.confirmPassword} onToggle={() => setVisible(v => ({ ...v, confirmPassword: !v.confirmPassword }))}/>{form.confirmPassword && <div className={`flex items-center gap-2 text-xs font-semibold ${matches ? 'text-emerald-300' : 'text-red-300'}`}><Icon name={matches ? 'completed' : 'alert'} size={16}/>{matches ? 'Passwords match' : 'Passwords do not match'}</div>}</>}{message && <div className={`rounded-xl border px-4 py-3 text-xs ${error ? 'border-red-400/20 bg-red-400/10 text-red-200' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'}`}>{message}</div>}<button className="h-12 w-full rounded-xl bg-gradient-to-r from-[#2b8fe0] to-[#7b4fc8] text-sm font-bold disabled:opacity-50" disabled={busy || (step === 'code' && (!matches || form.newPassword.length < 8))}>{busy ? 'Please wait…' : step === 'email' ? 'Send verification code' : 'Reset password'}</button></form><button type="button" onClick={() => onNavigate('login')} className="mt-5 w-full bg-transparent text-xs font-semibold text-[#bca8ff]">Back to sign in</button></div></div>;
}
