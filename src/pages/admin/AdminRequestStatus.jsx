import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from '../../RouterComponents';
import { useNavigate } from '../../router';
import { startVisiblePolling } from '../../utils/polling';
import RoundBrandLogo from '../../components/RoundBrandLogo';
import Icon from '../../components/Icon';

export const ADMIN_REQUEST_TOKEN_KEY = 'vividarts.admin.request-token';

export default function AdminRequestStatus() {
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');
  const token = sessionStorage.getItem(ADMIN_REQUEST_TOKEN_KEY) || localStorage.getItem(ADMIN_REQUEST_TOKEN_KEY);

  const checkStatus = useCallback(async () => {
    if (!token) { setError('No administrator request was found on this device.'); return; }
    try {
      const response = await api.get(`/admin/registration-request-status/${encodeURIComponent(token)}`);
      setRequest(response.data); setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        sessionStorage.removeItem(ADMIN_REQUEST_TOKEN_KEY);
        localStorage.removeItem(ADMIN_REQUEST_TOKEN_KEY);
      }
      setError(err.response?.data?.error || 'Unable to check your request right now.');
    }
  }, [token]);

  useEffect(() => startVisiblePolling(checkStatus, 3_000), [checkStatus]);

  const approved = request?.status === 'approved';
  const rejected = request?.status === 'rejected';
  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090816] px-5 py-10 font-sans text-white"><div className="login-grid absolute inset-0 opacity-30"/><div className="login-orb login-orb-one"/><div className="login-orb login-orb-two"/><main className="login-card-enter relative z-10 w-full max-w-[540px] rounded-[28px] border border-white/[.12] bg-white/[.075] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl"><section className="rounded-[23px] border border-white/[.08] bg-[#111025]/95 px-7 py-9 text-center sm:px-11 sm:py-12"><RoundBrandLogo size={66}/><p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-[#9f91ff]">Administrator access</p>{error ? <><div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-400/10 text-red-300"><Icon name="alert" size={28}/></div><h1 className="mt-5 font-outfit text-2xl font-bold">Request status unavailable</h1><p className="mt-3 text-sm leading-6 text-white/50">{error}</p><Link to="/admin/login" className="mt-7 inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] px-6 text-sm font-bold text-white no-underline hover:bg-white/10">Return to sign in</Link></> : !request ? <><div className="mx-auto mt-7 h-9 w-9 animate-spin rounded-full border-2 border-[#9f91ff] border-t-transparent"/><h1 className="mt-6 font-outfit text-2xl font-bold">Checking your request…</h1></> : <><div className={`mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full border ${approved ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : rejected ? 'border-red-400/30 bg-red-400/10 text-red-300' : 'border-[#9f91ff]/30 bg-[#7566d8]/15 text-[#bcb3ff]'}`}><Icon name={approved ? 'completed' : rejected ? 'alert' : 'pending'} size={36}/></div><h1 className="mt-6 font-outfit text-3xl font-bold">{approved ? 'Access approved' : rejected ? 'Request not approved' : 'Waiting for admin approval'}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">{approved ? `Good news${request.firstName ? `, ${request.firstName}` : ''}! Your administrator account is ready. You can now sign in with the username and password you supplied.` : rejected ? `Your administrator access request was rejected.${request.decisionNote ? ` Reason: ${request.decisionNote}` : ''}` : `Your request for @${request.username} has been sent to the super administrator. You can leave this page and return later; approval is checked automatically.`}</p>{!approved && !rejected && <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-[11px] font-semibold text-white/45"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-300"/>Checking automatically every few seconds</div>}{approved && <button type="button" onClick={() => navigate('/admin/login', { replace: true })} className="group mt-8 inline-flex h-[50px] min-w-[210px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] px-6 text-sm font-bold text-white shadow-[0_14px_35px_rgba(91,63,168,.36)] transition hover:-translate-y-0.5">Sign in <Icon name="arrowRight" size={17} className="transition group-hover:translate-x-1"/></button>}{rejected && <Link to="/admin/register" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[.06] px-6 text-sm font-bold text-white no-underline hover:bg-white/10">Submit a new request</Link>}</>}</section></main></div>;
}
