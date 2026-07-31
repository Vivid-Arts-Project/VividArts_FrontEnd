import { useState } from 'react';
import { showNotification } from './NotificationContainer';
import Icon from '../components/Icon';

function LoginPage({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setMessage('Login successful.');
      showNotification('success', 'Login successful! Welcome back.');
      onNavigate('profile');
    } catch (error) {
      const errText = error.message || 'Login failed. Please check your credentials.';
      setMessage(errText);
      showNotification('error', errText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090816] font-sans text-white">
      <div className="login-grid absolute inset-0 opacity-30"/>
      <div className="login-orb login-orb-one"/>
      <div className="login-orb login-orb-two"/>
      <div className="login-orb login-orb-three"/>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <button type="button" onClick={() => onNavigate('landing')} className="flex items-center gap-3 border-none bg-transparent text-white cursor-pointer">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2b8fe0] via-[#7b4fc8] to-[#5b3fa8] shadow-[0_8px_28px_rgba(91,63,168,.45)]">
            <svg width="23" height="23" viewBox="0 0 20 20" fill="none">
              <path d="M3 16 6.5 4 10 10.5 13 6.5 17 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="text-left">
            <strong className="block font-outfit text-base tracking-wide">VIVID ARTS</strong>
            <span className="block text-[10px] tracking-[.18em] text-white/40">PENCIL PORTRAITS</span>
          </span>
        </button>
        <button type="button" onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
          <Icon name="arrowLeft" size={16}/> Back to home
        </button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 pb-12 sm:px-8 lg:grid-cols-[1fr_470px]">
        <section className="hidden lg:block login-copy-enter">
          <span className="mb-5 inline-flex items-center rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-semibold tracking-[.16em] text-[#bca8ff] uppercase">
            Your portrait journey
          </span>
          <h1 className="max-w-[650px] font-outfit text-5xl font-bold leading-[1.08] tracking-[-.035em] xl:text-[64px]">
            Welcome back to your
            <span className="block bg-gradient-to-r from-[#6ecbff] via-[#9e8cff] to-[#c591ff] bg-clip-text text-transparent">creative space.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-7 text-[#aaa7c4]">
            Track your commissioned portrait, review artist proofs, request revisions, and keep every special memory in one beautiful place.
          </p>

          <div className="relative mt-10 h-[210px] max-w-[540px]">
            <div className="login-art-card login-art-card-one">
              <div className="mb-auto h-10 w-10 rounded-xl bg-white/10 p-2 text-[#9fdbff]"><Icon name="proofs" size={24}/></div>
              <div><strong className="block text-sm">Proof ready</strong><span className="text-xs text-white/45">Review your latest artwork</span></div>
            </div>
            <div className="login-art-card login-art-card-two">
              <div className="mb-auto h-10 w-10 rounded-xl bg-white/10 p-2 text-[#c5adff]"><Icon name="orders" size={24}/></div>
              <div><strong className="block text-sm">Order tracking</strong><span className="text-xs text-white/45">Follow every pencil stroke</span></div>
            </div>
          </div>
        </section>

        <section className="login-card-enter w-full rounded-[28px] border border-white/[.12] bg-white/[.075] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <div className="rounded-[23px] border border-white/[.08] bg-[#111025]/90 px-6 py-8 sm:px-9 sm:py-10">
            <div className="mb-8">
              <h2 className="font-outfit text-3xl font-bold tracking-[-.02em]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[#8f8ba8]">Sign in to manage your portraits and account.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/70">Username</span>
                <span className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-4 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]">
                  <Icon name="user" size={18} className="text-[#77738e] transition group-focus-within:text-[#8da7ff]"/>
                  <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" placeholder="Enter your username" className="h-12 w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"/>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/70">Password</span>
                <span className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-4 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]">
                  <Icon name="lock" size={18} className="text-[#77738e] transition group-focus-within:text-[#8da7ff]"/>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" className="h-12 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"/>
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-[#77738e] cursor-pointer transition hover:bg-white/5 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18}/>
                  </button>
                </span>
              </label>

              {message && (
                <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-xs ${message.includes('successful') ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-red-400/20 bg-red-400/10 text-red-300'}`}>
                  <Icon name={message.includes('successful') ? 'completed' : 'alert'} size={17}/>{message}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.36)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(91,63,168,.5)] disabled:cursor-wait disabled:opacity-70">
                {isLoading ? <span className="login-spinner"/> : <>Sign in securely <Icon name="arrowRight" size={17} className="transition-transform group-hover:translate-x-1"/></>}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-white/10"/><span className="text-[10px] uppercase tracking-[.16em] text-white/30">New to Vivid Arts?</span><span className="h-px flex-1 bg-white/10"/></div>
            <button type="button" onClick={() => onNavigate('register')} className="w-full rounded-xl border border-white/10 bg-white/[.045] px-4 py-3.5 text-sm font-semibold text-white/80 transition hover:border-[#7b6ad0]/50 hover:bg-white/[.08] hover:text-white">
              Create a customer account
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/30">
              <Icon name="lock" size={13}/> Secure access to your private portrait dashboard
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
