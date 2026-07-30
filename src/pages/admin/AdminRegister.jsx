import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRegister() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', email: '', phone: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

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

  const inputCls = "w-full px-3 py-2.5 border border-va-border rounded-lg text-sm font-sans text-[#0D0D0D] bg-va-bg outline-none box-border focus:border-va-blue focus:bg-white";
  const labelCls = "text-xs font-semibold text-va-text2 block mb-1.5";

  return (
    <div className="min-h-screen bg-va-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-va-border px-9 py-10 w-full max-w-[460px] shadow-[0_4px_24px_rgba(91,63,168,0.08)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-[10px] bg-grad flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M3 16L6.5 4L10 10.5L13 6.5L17 16"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-outfit font-extrabold text-[17px] text-va-dark">Vivid Arts</div>
            <div className="text-[11px] font-semibold text-va-text3 uppercase mt-px">Admin Panel</div>
          </div>
        </div>

        <h1 className="font-outfit text-xl font-bold text-va-dark mb-1">Create admin account</h1>
        <p className="text-sm text-va-text3 mb-5">Fill in your details to get started</p>

        {error && (
          <div className="bg-[#FEF0F0] border border-red-300 rounded-lg px-3.5 py-2.5 text-[13px] text-va-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="mb-3.5">
              <label className={labelCls}>First name</label>
              <input className={inputCls} placeholder="Amal" value={form.firstName} onChange={e => set('firstName', e.target.value)}/>
            </div>
            <div className="mb-3.5">
              <label className={labelCls}>Last name</label>
              <input className={inputCls} placeholder="Perera" value={form.lastName} onChange={e => set('lastName', e.target.value)}/>
            </div>
          </div>

          <div className="mb-3.5">
            <label className={labelCls}>Username <span className="text-va-danger">*</span></label>
            <input className={inputCls} placeholder="admin" value={form.username} onChange={e => set('username', e.target.value)} required/>
          </div>

          <div className="mb-3.5">
            <label className={labelCls}>Email <span className="text-va-danger">*</span></label>
            <input className={inputCls} type="email" placeholder="amal@vividarts.lk" value={form.email} onChange={e => set('email', e.target.value)} required/>
          </div>

          <div className="mb-3.5">
            <label className={labelCls}>Phone</label>
            <input className={inputCls} placeholder="+94 77 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)}/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="mb-3.5">
              <label className={labelCls}>Password <span className="text-va-danger">*</span></label>
              <input className={inputCls} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required/>
            </div>
            <div className="mb-3.5">
              <label className={labelCls}>Confirm password <span className="text-va-danger">*</span></label>
              <input className={inputCls} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required/>
            </div>
          </div>

          <button
            className={`mt-2 p-3 border-none rounded-lg bg-grad text-white text-sm font-bold font-outfit cursor-pointer w-full disabled:cursor-default${loading ? ' opacity-70' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-va-text3 mt-5">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-va-purple font-semibold no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
