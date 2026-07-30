import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-va-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-va-border px-9 py-10 w-full max-w-[420px] shadow-[0_4px_24px_rgba(91,63,168,0.08)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-10 h-10 rounded-[10px] bg-grad flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M3 16L6.5 4L10 10.5L13 6.5L17 16"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-outfit font-extrabold text-[17px] text-va-dark">Vivid Arts</div>
            <div className="text-[11px] font-semibold text-va-text3 tracking-wide uppercase mt-px">Admin Panel</div>
          </div>
        </div>

        <h1 className="font-outfit text-[22px] font-bold text-va-dark mb-1.5">Welcome back</h1>
        <p className="text-sm text-va-text3 mb-6">Sign in to your admin account</p>

        {error && (
          <div className="bg-[#FEF0F0] border border-red-300 rounded-lg px-3.5 py-2.5 text-[13px] text-va-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4">
            <label className="text-xs font-semibold text-va-text2 block mb-1.5">Username</label>
            <input
              className="w-full px-3 py-2.5 border border-va-border rounded-lg text-sm font-sans text-[#0D0D0D] bg-va-bg outline-none transition-colors box-border focus:border-va-blue focus:bg-white"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-va-text2 block mb-1.5">Password</label>
            <input
              className="w-full px-3 py-2.5 border border-va-border rounded-lg text-sm font-sans text-[#0D0D0D] bg-va-bg outline-none transition-colors box-border focus:border-va-blue focus:bg-white"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
          </div>
          <button
            className={`mt-2 p-3 border-none rounded-lg bg-grad text-white text-sm font-bold font-outfit cursor-pointer w-full disabled:cursor-default${loading ? ' opacity-70' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[13px] text-va-text3 mt-5">
          Don't have an account?{' '}
          <Link to="/admin/register" className="text-va-purple font-semibold no-underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
