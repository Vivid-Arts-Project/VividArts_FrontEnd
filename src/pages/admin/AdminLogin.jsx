import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import BrandLogo from '../../components/BrandLogo';
import Icon from '../../components/Icon';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090816] font-sans text-white">
      <div className="login-grid absolute inset-0 opacity-30"/>
      <div className="login-orb login-orb-one"/>
      <div className="login-orb login-orb-two"/>
      <div className="login-orb login-orb-three"/>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <BrandLogo size={52}/>
          <div><strong className="block font-outfit text-base tracking-wide">VIVID ARTS</strong><span className="block text-[10px] tracking-[.18em] text-white/40">ADMIN WORKSPACE</span></div>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-semibold text-white/75 no-underline backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
          <Icon name="arrowLeft" size={16}/> Customer site
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 pb-12 sm:px-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block login-copy-enter">
          <span className="mb-5 inline-flex rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-[#bca8ff]">Secure admin workspace</span>
          <h1 className="max-w-[650px] font-outfit text-5xl font-bold leading-[1.08] tracking-[-.035em] xl:text-[62px]">
            Create, manage,
            <span className="block bg-gradient-to-r from-[#6ecbff] via-[#9e8cff] to-[#c591ff] bg-clip-text text-transparent">and deliver beautifully.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-7 text-[#aaa7c4]">A focused command centre for portrait orders, customer proofs, revisions, payments, and delivery progress.</p>

          <div className="admin-login-stage mt-10 max-w-[570px]">
            {[
              ['orders', 'Order pipeline', 'See every active commission'],
              ['proofs', 'Proof reviews', 'Keep approvals moving'],
              ['payments', 'Payment overview', 'Track deposits and balances'],
            ].map(([icon, title, description], index) => (
              <div key={title} className={`admin-login-float-card admin-login-float-card-${index + 1}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.08] text-[#a9cfff]"><Icon name={icon} size={22}/></span>
                <span className="mt-auto"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-white/40">{description}</span></span>
              </div>
            ))}
          </div>
        </section>

        <section className="login-card-enter w-full rounded-[28px] border border-white/[.12] bg-white/[.075] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <div className="rounded-[23px] border border-white/[.08] bg-[#111025]/92 px-7 py-9 sm:px-9">
            <div className="mb-8 flex items-start justify-between">
              <div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9f91ff]">Administrator access</span><h1 className="mt-2 font-outfit text-3xl font-bold tracking-[-.02em]">Welcome back</h1><p className="mt-2 text-sm text-white/40">Sign in to manage Vivid Arts.</p></div>
              <BrandLogo size={54}/>
            </div>

            {error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-3 text-xs text-red-300"><Icon name="alert" size={17}/>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/65">Username</span>
                <span className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-4 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]">
                  <Icon name="user" size={18} className="text-white/30 group-focus-within:text-[#8da7ff]"/>
                  <input className="h-12 w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/20" type="text" placeholder="Enter your username" value={form.username} onChange={e => set('username', e.target.value)} autoFocus autoComplete="username" required/>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/65">Password</span>
                <span className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-4 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]">
                  <Icon name="lock" size={18} className="text-white/30 group-focus-within:text-[#8da7ff]"/>
                  <input className="h-12 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/20" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="current-password" required/>
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-white/30 cursor-pointer hover:bg-white/5 hover:text-white"><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18}/></button>
                </span>
              </label>

              <button className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.36)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(91,63,168,.5)] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
                {loading ? <span className="login-spinner"/> : <>Enter admin panel <Icon name="arrowRight" size={17} className="transition-transform group-hover:translate-x-1"/></>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/40">Need an administrator account? <Link to="/admin/register" className="font-bold text-[#9e91ff] no-underline hover:text-[#c0b7ff] hover:underline">Register here</Link></p>
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/25"><Icon name="lock" size={13}/> Protected administrator access</div>
          </div>
        </section>
      </main>
    </div>
  );
}
