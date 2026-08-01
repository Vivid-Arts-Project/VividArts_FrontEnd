import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';
import Icon from '../../components/Icon';

export default function AdminRegister() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await register({
        username:  form.username,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fieldCls = "group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-3.5 transition focus-within:border-[#7b8cff] focus-within:bg-white/[.08] focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.1)]";
  const labelCls = "mb-1.5 block text-[11px] font-semibold text-white/65";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090816] font-sans text-white">
      <div className="login-grid absolute inset-0 opacity-30"/>
      <div className="login-orb login-orb-one"/>
      <div className="login-orb login-orb-two"/>
      <div className="login-orb login-orb-three"/>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3"><BrandLogo size={52}/><div><strong className="block font-outfit text-base tracking-wide">VIVID ARTS</strong><span className="block text-[10px] tracking-[.18em] text-white/40">ADMIN WORKSPACE</span></div></div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-semibold text-white/75 no-underline backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"><Icon name="arrowLeft" size={16}/> Customer site</Link>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-14 px-6 pb-8 sm:px-8 lg:grid-cols-[1fr_540px]">
        <section className="hidden lg:block login-copy-enter">
          <span className="mb-5 inline-flex rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-[#bca8ff]">Set up your workspace</span>
          <h1 className="max-w-[620px] font-outfit text-5xl font-bold leading-[1.08] tracking-[-.035em] xl:text-[60px]">Lead every portrait from <span className="block bg-gradient-to-r from-[#6ecbff] via-[#9e8cff] to-[#c591ff] bg-clip-text text-transparent">idea to delivery.</span></h1>
          <p className="mt-6 max-w-[510px] text-base leading-7 text-[#aaa7c4]">Create a protected administrator profile and bring orders, client communication, proofs, payments, and delivery into one creative workflow.</p>
          <div className="admin-login-stage mt-9 max-w-[570px]">
            {[
              ['settings', 'Your workspace', 'Personalise business settings'],
              ['clients', 'Client care', 'Keep every conversation organised'],
              ['dashboard', 'Clear oversight', 'See progress at a glance'],
            ].map(([icon, title, description], index) => (
              <div key={title} className={`admin-login-float-card admin-login-float-card-${index + 1}`}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[.08] text-[#a9cfff]"><Icon name={icon} size={22}/></span><span className="mt-auto"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-white/40">{description}</span></span></div>
            ))}
          </div>
        </section>

        <section className="login-card-enter w-full rounded-[28px] border border-white/[.12] bg-white/[.075] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <div className="rounded-[23px] border border-white/[.08] bg-[#111025]/92 px-6 py-7 sm:px-8">
            <div className="mb-6 flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9f91ff]">Administrator setup</span><h1 className="mt-2 font-outfit text-[28px] font-bold tracking-[-.02em]">Create admin account</h1><p className="mt-1.5 text-sm text-white/40">Set up secure access to Vivid Arts.</p></div><BrandLogo size={52}/></div>

            {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-3 text-xs text-red-300"><Icon name="alert" size={17}/>{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['First name', 'firstName', 'Amal'],
                  ['Last name', 'lastName', 'Perera'],
                ].map(([label, key, placeholder]) => <label key={key} className="block"><span className={labelCls}>{label}</span><span className={fieldCls}><Icon name="user" size={17} className="text-white/30 group-focus-within:text-[#8da7ff]"/><input className="h-11 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/20" placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)}/></span></label>)}
              </div>

              {[
                ['Username', 'username', 'admin', 'user', 'text', true],
                ['Email', 'email', 'amal@vividarts.lk', 'mail', 'email', true],
                ['Phone', 'phone', '+94 77 000 0000', 'phone', 'tel', false],
              ].map(([label, key, placeholder, icon, type, required]) => <label key={key} className="block"><span className={labelCls}>{label}{required && <span className="text-red-300"> *</span>}</span><span className={fieldCls}><Icon name={icon} size={17} className="text-white/30 group-focus-within:text-[#8da7ff]"/><input className="h-11 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/20" type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} required={required}/></span></label>)}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Password', 'password', showPassword, setShowPassword],
                  ['Confirm password', 'confirmPassword', showConfirmPassword, setShowConfirmPassword],
                ].map(([label, key, visible, setVisible]) => <label key={key} className="block"><span className={labelCls}>{label}<span className="text-red-300"> *</span></span><span className={fieldCls}><Icon name="lock" size={17} className="text-white/30 group-focus-within:text-[#8da7ff]"/><input className="h-11 min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-white/20" type={visible ? 'text' : 'password'} placeholder={key === 'password' ? 'Min 8 characters' : 'Repeat password'} value={form[key]} onChange={e => set(key, e.target.value)} required/><button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-white/30 cursor-pointer hover:bg-white/5 hover:text-white"><Icon name={visible ? 'eyeOff' : 'eye'} size={17}/></button></span></label>)}
              </div>

              <button className="group flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.36)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(91,63,168,.5)] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>{loading ? <span className="login-spinner"/> : <>Create admin account <Icon name="arrowRight" size={17} className="transition-transform group-hover:translate-x-1"/></>}</button>
            </form>

            <p className="mt-5 text-center text-xs text-white/40">Already have an account? <Link to="/admin/login" className="font-bold text-[#9e91ff] no-underline hover:text-[#c0b7ff] hover:underline">Sign in</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
