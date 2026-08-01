import { useState } from 'react';
import Icon from '../components/Icon';
import { showNotification } from './NotificationContainer';
import BrandLogo from '../components/BrandLogo';

function RegisterPage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      showNotification('error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const successMessage = data.message || 'Registration successful.';
      setMessage(successMessage);
      showNotification('success', successMessage);
      setTimeout(() => onNavigate('login'), 1200);
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setMessage(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);
  const fieldClass = 'group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-4 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]';
  const passwordScore = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const passwordStrength = passwordScore <= 1
    ? { label: 'Poor', level: 1, text: 'text-red-300', bar: 'bg-red-500' }
    : passwordScore <= 3
      ? { label: 'Middle', level: 2, text: 'text-yellow-300', bar: 'bg-yellow-400' }
      : { label: 'Strong', level: 3, text: 'text-emerald-300', bar: 'bg-emerald-500' };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090816] font-sans text-white">
      <div className="login-grid absolute inset-0 opacity-30"/>
      <div className="login-orb login-orb-one"/>
      <div className="login-orb login-orb-two"/>
      <div className="login-orb login-orb-three"/>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <button type="button" onClick={() => onNavigate('landing')} className="flex items-center gap-3 border-none bg-transparent text-white cursor-pointer">
          <BrandLogo size={48}/>
          <span className="text-left"><strong className="block font-outfit text-base tracking-wide">VIVID ARTS</strong><span className="block text-[10px] tracking-[.18em] text-white/40">PENCIL PORTRAITS</span></span>
        </button>
        <button type="button" onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
          <Icon name="arrowLeft" size={16}/> Back to home
        </button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 pb-12 sm:px-8 lg:grid-cols-[.9fr_520px]">
        <section className="hidden lg:block login-copy-enter">
          <span className="mb-5 inline-flex items-center rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-semibold tracking-[.16em] text-[#bca8ff] uppercase">
            Begin something meaningful
          </span>
          <h1 className="max-w-[620px] font-outfit text-5xl font-bold leading-[1.08] tracking-[-.035em] xl:text-[62px]">
            Turn your memories into
            <span className="block bg-gradient-to-r from-[#6ecbff] via-[#9e8cff] to-[#c591ff] bg-clip-text text-transparent">timeless artwork.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-7 text-[#aaa7c4]">
            Create your private Vivid Arts account to commission portraits, approve proofs, request revisions, and follow every stage of your artwork.
          </p>
          <div className="register-benefit-stage mt-9 max-w-[560px]">
            {[
              ['proofs', 'Private proofs', 'Review artwork securely'],
              ['revisions', 'Easy revisions', 'Share feedback directly'],
              ['orders', 'Live tracking', 'Follow every milestone'],
              ['invoices', 'Instant invoices', 'Keep payment records'],
            ].map(([icon, title, text], index) => (
              <div
                key={title}
                className={`register-benefit-card register-benefit-card-${index + 1} ${index % 2 === 0 ? 'register-benefit-card--up' : 'register-benefit-card--down'}`}
                style={{
                  '--register-delay': `${.25 + index * .1}s`,
                  '--card-rotation': ['-4deg', '4deg', '3deg', '-3deg'][index],
                }}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.08] ${index % 2 === 0 ? 'text-[#91d2ff]' : 'text-[#c3a1ff]'}`}><Icon name={icon} size={22}/></span>
                <span className="mt-auto"><strong className="block text-sm text-white/95">{title}</strong><span className="mt-1 block text-xs text-white/40">{text}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="login-card-enter w-full rounded-[28px] border border-white/[.12] bg-white/[.075] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <div className="rounded-[23px] border border-white/[.08] bg-[#111025]/90 px-6 py-7 sm:px-9 sm:py-8">
            <div className="mb-6">
              <h2 className="font-outfit text-3xl font-bold tracking-[-.02em]">Create your account</h2>
              <p className="mt-2 text-sm text-[#8f8ba8]">Your portrait journey starts here.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Username', type: 'text', value: username, setter: setUsername, icon: 'user', placeholder: 'Choose a username', autoComplete: 'username' },
                { label: 'Email address', type: 'email', value: email, setter: setEmail, icon: 'mail', placeholder: 'you@example.com', autoComplete: 'email' },
              ].map(field => (
                <label className="block" key={field.label}>
                  <span className="mb-1.5 block text-xs font-semibold text-white/70">{field.label}</span>
                  <span className={fieldClass}>
                    <Icon name={field.icon} size={18} className="text-[#77738e] transition group-focus-within:text-[#8da7ff]"/>
                    <input type={field.type} value={field.value} onChange={event => field.setter(event.target.value)} required autoComplete={field.autoComplete} placeholder={field.placeholder} className="h-11 w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"/>
                  </span>
                </label>
              ))}

              {[
                { label: 'Password', value: password, setter: setPassword, visible: showPassword, toggle: setShowPassword, autoComplete: 'new-password' },
                { label: 'Confirm password', value: confirmPassword, setter: setConfirmPassword, visible: showConfirmPassword, toggle: setShowConfirmPassword, autoComplete: 'new-password' },
              ].map(field => (
                <label className="block" key={field.label}>
                  <span className="mb-1.5 block text-xs font-semibold text-white/70">{field.label}</span>
                  <span className={fieldClass}>
                    <Icon name="lock" size={18} className="text-[#77738e] transition group-focus-within:text-[#8da7ff]"/>
                    <input type={field.visible ? 'text' : 'password'} value={field.value} onChange={event => field.setter(event.target.value)} required autoComplete={field.autoComplete} placeholder={field.label} className="h-11 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"/>
                    <button type="button" onClick={() => field.toggle(previous => !previous)} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-[#77738e] cursor-pointer transition hover:bg-white/5 hover:text-white" aria-label={field.visible ? `Hide ${field.label.toLowerCase()}` : `Show ${field.label.toLowerCase()}`}>
                      <Icon name={field.visible ? 'eyeOff' : 'eye'} size={18}/>
                    </button>
                  </span>
                  {field.label === 'Password' && password && (
                    <span className="mt-2 block password-strength-enter">
                      <span className="flex gap-1.5">
                        {[1, 2, 3].map(level => (
                          <span key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.level ? passwordStrength.bar : 'bg-white/10'}`}/>
                        ))}
                      </span>
                    </span>
                  )}
                </label>
              ))}

              {confirmPassword && (
                <div className={`register-match-message ${passwordsMatch ? 'text-emerald-300' : 'text-red-300'}`}>
                  <Icon name={passwordsMatch ? 'completed' : 'alert'} size={16}/>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              {message && <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-xs ${message.toLowerCase().includes('success') ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-red-400/20 bg-red-400/10 text-red-300'}`}><Icon name={message.toLowerCase().includes('success') ? 'completed' : 'alert'} size={17}/>{message}</div>}

              <button type="submit" disabled={isLoading} className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.36)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(91,63,168,.5)] disabled:cursor-wait disabled:opacity-70">
                {isLoading ? <span className="login-spinner"/> : <>Create account <Icon name="arrowRight" size={17} className="transition-transform group-hover:translate-x-1"/></>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/45">Already have an account? <button type="button" onClick={() => onNavigate('login')} className="border-none bg-transparent p-0 font-bold text-[#9e91ff] cursor-pointer hover:text-[#bcb3ff] hover:underline">Sign in</button></p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;
