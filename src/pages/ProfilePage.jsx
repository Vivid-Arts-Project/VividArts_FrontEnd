import { useEffect, useRef, useState } from 'react';
import OrderTracker from './OrderTracker';
import { clearCustomerSession, getCustomerToken, setCustomerUsername } from '../authSession';

function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      onNavigate('login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load profile');
        }

        setUser(data);
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setPhoneNumber(data.phone_number || '');
        setEmail(data.email || '');

        const ordersRes = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (error) {
        clearCustomerSession();
        setMessage(error.message || 'Please log in again.');
        onNavigate('login');
      }
    };

    fetchProfileData();
  }, [onNavigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const token = getCustomerToken();

    try {
      const response = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, username, phoneNumber, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setMessage(data.message || 'Profile updated successfully');
      setCustomerUsername(username);
      setUser((current) => current ? { ...current, full_name: fullName, username, phone_number: phoneNumber, email } : current);
      setIsEditing(false);
    } catch (error) {
      setMessage(error.message || 'Update failed');
    }
  };

  const reviewProof = async (order, action) => {
    const note = action === 'revision' ? window.prompt('Describe the changes you need:') : '';
    if (action === 'revision' && !note?.trim()) return;
    try {
      const response = await fetch(`/api/orders/${order.id}/proof-review`, { method: 'POST', headers: {
        'Content-Type': 'application/json', Authorization: `Bearer ${getCustomerToken()}`,
      }, body: JSON.stringify({ action, note }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Review failed');
      setOrders(current => current.map(item => item.id === order.id ? { ...item, status: data.status } : item));
      setMessage(data.message);
    } catch (error) { setMessage(error.message); }
  };

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading your profile...</p>;
  }

  const initials = (user.full_name || user.username || 'U').slice(0, 1).toUpperCase();

  const uploadImage = async (file) => {
    const token = getCustomerToken();
    if (!token) return setMessage('Not authenticated');

    const fd = new FormData();
    fd.append('profileImage', file);

    try {
      const res = await fetch('/api/customers/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      // refresh profile data in-place
      setUser(prev => ({ ...prev, profile_image_url: data.profile_image_url || prev.profile_image_url }));
      try { if (data.profile_image_url) localStorage.setItem('profile_image_url', data.profile_image_url); } catch { /* localStorage unavailable */ }
      setMessage('Profile photo updated successfully.');
      // update display name in localStorage if username changed elsewhere
    } catch (err) {
      setMessage(err.message || 'Upload failed');
    }
  };

  const onAvatarSelected = (ev) => { const f = ev.target.files?.[0]; if (f) uploadImage(f); };

  return (
    <div className="min-h-screen bg-[#090816] px-4 py-7 font-sans text-white sm:px-6">
      <main className="mx-auto max-w-6xl">
      <button type="button" onClick={() => onNavigate('landing')} className="mb-5 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-xs font-bold text-white/75 transition hover:bg-white/10">← Back to home</button>
      <section className="rounded-[28px] border border-white/[.12] bg-gradient-to-br from-[#151333] via-[#111025] to-[#12233d] p-6 shadow-[0_28px_80px_rgba(0,0,0,.4)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-[#a99bff] bg-gradient-to-br from-[#aa9dff] to-[#4db8f6] shadow-[0_0_0_6px_rgba(169,155,255,.12)] sm:mx-0">
            {user.profile_image_url ? <img src={user.profile_image_url} alt="avatar" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-white">{initials}</span>}
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="mb-1 text-xs font-bold uppercase tracking-[.17em] text-[#aa9dff]">Customer profile</p>
            <h1 className="truncate text-3xl font-bold tracking-[-.025em] sm:text-4xl">{user.full_name || user.username}</h1>
            <div className="mt-1 truncate text-sm text-white/55">@{user.username} · {user.email}</div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelected} />
            <button type="button" onClick={() => avatarInputRef.current?.click()} className="rounded-xl border border-white/15 bg-white/[.07] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-white/[.13]">Change photo</button>
            <button type="button" onClick={() => { setMessage(''); setIsEditing(true); }} className="rounded-xl bg-gradient-to-r from-[#2d91df] to-[#7762d8] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5">Edit profile</button>
          </div>
        </div>
        </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="rounded-[24px] border border-white/[.09] bg-white/[.045] p-5 shadow-xl shadow-black/10 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa9dff]">Account details</p>
            <h3 className="mt-1 text-2xl font-bold">{isEditing ? 'Edit your profile' : 'Personal details'}</h3>
            <form onSubmit={handleUpdate} className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/65">Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} required className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0a1b] px-4 text-sm text-white outline-none disabled:cursor-default disabled:text-white/65 focus:border-[#8c7cf0] focus:ring-4 focus:ring-[#7161d8]/15" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/65">Username</label>
                <input type="text" value={username} disabled required className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0a1b] px-4 text-sm text-white/65 outline-none disabled:cursor-default" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/65">Mobile number</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!isEditing} required className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0a1b] px-4 text-sm text-white outline-none disabled:cursor-default disabled:text-white/65 focus:border-[#8c7cf0] focus:ring-4 focus:ring-[#7161d8]/15" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/65">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} required className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0a1b] px-4 text-sm text-white outline-none disabled:cursor-default disabled:text-white/65 focus:border-[#8c7cf0] focus:ring-4 focus:ring-[#7161d8]/15" />
              </div>
              </div>
              {isEditing && <div className="mt-5 flex flex-wrap gap-2"><button type="submit" className="rounded-xl bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5">Save changes</button><button type="button" onClick={() => { setFullName(user.full_name || ''); setPhoneNumber(user.phone_number || ''); setEmail(user.email || ''); setIsEditing(false); }} className="rounded-xl border border-white/15 bg-white/[.05] px-5 py-3 text-sm font-bold text-white/80">Cancel</button></div>}
              {message && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">{message}</div>}
            </form>
          </div>

          <div className="mt-7">
            <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa9dff]">Commissions</p><h3 className="mt-1 text-2xl font-bold">My orders</h3></div><span className="text-sm font-semibold text-white/45">{orders.length} total</span></div>
            {orders.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[.03] px-6 py-12 text-center"><div className="text-3xl">✦</div><h4 className="mt-3 text-lg font-bold">No commissions yet</h4><p className="mt-1 text-sm text-white/50">Your commissioned portraits will appear here.</p><button type="button" onClick={() => onNavigate('commission')} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#17142d]">Start a commission</button></div>
            ) : (
              orders.map((order) => (
                <div key={order._id || order.id} className="mb-4 rounded-[22px] border border-white/[.09] bg-[#111025] p-5 shadow-lg shadow-black/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="text-xs font-bold uppercase tracking-[.14em] text-white/40">Portrait commission</p><strong className="mt-1 block text-lg">Order #{(order.id || order._id || '').slice(-8) || 'N/A'}</strong></div>
                    <span className="rounded-full bg-[#7868d8]/15 px-3 py-1.5 text-xs font-bold capitalize text-[#c2b9ff]">{String(order.status || 'in queue').replaceAll('_', ' ')}</span>
                  </div>
                  <OrderTracker currentStatus={order.status} />
                  {order.proofImagePath && <div className="mt-4">
                    <img src={order.proofImagePath} alt="Portrait proof" className="max-h-80 w-full rounded-xl border border-white/10 bg-[#0b0a1b] object-contain"/>
                    {order.status === 'waiting_for_feedback' && <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => reviewProof(order, 'approve')} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-[#062b1b]">Approve proof</button>
                      <button type="button" onClick={() => reviewProof(order, 'revision')} className="rounded-xl border border-white/15 bg-white/[.05] px-4 py-2.5 text-sm font-bold text-white">Request changes</button>
                    </div>}
                  </div>}
                </div>
              ))
            )}
          </div>
        </div>
        <aside>
          <div className="rounded-[24px] border border-white/[.09] bg-white/[.045] p-5">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa9dff]">Contact information</p>
            <p style={{ color: '#a9a6c4' }}>{user.full_name || '—'}</p>
            <p style={{ color: '#a9a6c4' }}>Phone: {user.phone_number || '—'}</p>
            <p style={{ color: '#a9a6c4' }}>Address: {user.address || '—'}</p>
          </div>
          <div className="mt-4 rounded-[24px] border border-[#7868d8]/20 bg-gradient-to-br from-[#322b67]/45 to-[#12253b]/45 p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#bfb5ff]">Your Vivid Arts account</p><p className="mt-3 text-sm leading-6 text-white/65">Keep your details current so we can contact you about proofs, revisions, and delivery.</p></div>
        </aside>
      </div>
      </main>
    </div>
  );
}

export default ProfilePage;
