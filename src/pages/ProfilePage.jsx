import { useEffect, useRef, useState } from 'react';
import { clearCustomerSession, getCustomerToken, setCustomerUsername } from '../authSession';
import RoundBrandLogo from '../components/RoundBrandLogo';
import Icon from '../components/Icon';

function ProfilePage({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
          credentials: 'same-origin',
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
      } catch (error) {
        clearCustomerSession();
        setMessageType('error');
        setMessage(error.message || 'Please log in again.');
        onNavigate('login');
      }
    };

    fetchProfileData();
  }, [onNavigate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ fullName, username, phoneNumber, email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setMessage(data.message || 'Profile details updated successfully');
      setMessageType('success');
      setCustomerUsername(username);
      setUser((current) => current ? { ...current, full_name: fullName, username, phone_number: phoneNumber, email } : current);
      setIsEditing(false);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Update failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (file) => {
    const token = getCustomerToken();
    if (!token) {
      setMessageType('error');
      setMessage('Not authenticated');
      return;
    }

    setIsUploading(true);
    const fd = new FormData();
    fd.append('profileImage', file);

    try {
      const res = await fetch('/api/customers/profile/avatar', {
        method: 'POST',
        credentials: 'same-origin',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUser(prev => ({ ...prev, profile_image_url: data.profile_image_url || prev.profile_image_url }));
      try {
        if (data.profile_image_url) localStorage.setItem('profile_image_url', data.profile_image_url);
      } catch {
        /* localStorage unavailable */
      }
      setMessageType('success');
      setMessage('Profile photo updated successfully.');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onAvatarSelected = (ev) => {
    const f = ev.target.files?.[0];
    if (f) uploadImage(f);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090816] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent"/>
          <p className="text-sm font-medium text-white/60">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initials = (user.full_name || user.username || 'U').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#090816] font-sans text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0b1f]/90 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 border-none bg-transparent text-white cursor-pointer"
          >
            <RoundBrandLogo size={46}/>
            <span className="text-left hidden sm:block">
              <strong className="block font-outfit text-base font-extrabold tracking-[.08em] text-white">VIVID ARTS</strong>
              <span className="block text-[10px] font-semibold tracking-[.2em] text-white/50">MY ACCOUNT</span>
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 py-2.5 text-xs font-bold text-white/90 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
            >
              <Icon name="orders" size={16} className="text-[#a99bff]"/>
              <span>My Orders</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="group inline-flex items-center rounded-xl border border-[#a99bff]/45 bg-gradient-to-r from-[#318fe2] to-[#7354d6] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(79,91,215,.35)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#45a3ef] hover:to-[#8868e7]"
            >
              <Icon name="arrowLeft" size={15} className="mr-1.5 transition-transform duration-300 group-hover:-translate-x-1"/>
              <span>Back to home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Profile Hero Header Card */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/[.12] bg-gradient-to-br from-[#18153b] via-[#121128] to-[#11233f] p-6 shadow-[0_24px_70px_rgba(0,0,0,.45)] sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#6d5bff]/20 blur-[90px]"/>
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#2b8fe0]/15 blur-[90px]"/>

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* Avatar with Upload button */}
            <div className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-[#a99bff]/60 bg-gradient-to-br from-[#aa9dff] to-[#4db8f6] shadow-[0_0_0_6px_rgba(169,155,255,.14)] sm:h-32 sm:w-32">
              {user.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile avatar" className="h-full w-full object-cover"/>
              ) : (
                <span className="flex h-full w-full items-center justify-center font-outfit text-4xl font-extrabold text-white">
                  {initials}
                </span>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Change profile picture"
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 cursor-pointer"
              >
                <Icon name="camera" size={22} className="text-white"/>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white">Change</span>
              </button>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelected}/>

            {/* Profile Summary */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#c4b5fd]">
                  <Icon name="sparkle" size={12}/> Vivid Arts Member
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-300">
                  <Icon name="completed" size={12}/> Verified
                </span>
              </div>

              <h1 className="font-outfit text-2xl font-extrabold tracking-[-.02em] sm:text-3xl lg:text-4xl text-white">
                {user.full_name || user.username}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60 sm:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="user" size={14} className="text-[#a99bff]"/> @{user.username}
                </span>
                <span className="h-3 w-px bg-white/20"/>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="mail" size={14} className="text-[#a99bff]"/> {user.email}
                </span>
                {user.phone_number && (
                  <>
                    <span className="h-3 w-px bg-white/20"/>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="phone" size={14} className="text-[#a99bff]"/> {user.phone_number}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex justify-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  setIsEditing(prev => !prev);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                  isEditing
                    ? 'border border-white/20 bg-white/10'
                    : 'bg-gradient-to-r from-[#2d91df] via-[#6d5bff] to-[#8b5cf6] shadow-[0_8px_24px_rgba(109,91,255,.35)]'
                }`}
              >
                <Icon name="pencil" size={15}/> {isEditing ? 'Cancel editing' : 'Edit profile'}
              </button>
            </div>
          </div>
        </section>

        {/* Status Message Notification */}
        {message && (
          <div
            className={`mt-6 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-medium transition ${
              messageType === 'error'
                ? 'border-red-400/35 bg-red-500/15 text-red-200'
                : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
            }`}
          >
            <Icon name={messageType === 'error' ? 'alert' : 'completed'} size={18}/>
            <span>{message}</span>
          </div>
        )}

        {/* Main Content 2-Column Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left Column: Account Details Form */}
          <div className="rounded-[26px] border border-white/[.1] bg-white/[.04] p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <h2 className="font-outfit text-xl font-bold text-white">Personal Information</h2>
                <p className="mt-1 text-xs text-white/50">Manage your profile details and studio contact info.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isEditing ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30' : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {isEditing ? 'Editing Mode' : 'Read Only'}
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/70">Full name</label>
                  <div className={`flex items-center gap-3 rounded-xl border px-4 transition ${
                    isEditing
                      ? 'border-[#7b8cff] bg-[#0c0a1f] focus-within:ring-4 focus-within:ring-[#7b8cff]/20'
                      : 'border-white/10 bg-white/[.03]'
                  }`}>
                    <Icon name="user" size={17} className={isEditing ? 'text-[#a99bff]' : 'text-white/30'}/>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      required
                      placeholder="Your full name"
                      className="h-12 w-full border-none bg-transparent text-sm text-white outline-none disabled:cursor-default disabled:text-white/80"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-white/70">Username</label>
                    <span className="text-[10px] text-white/40">Permanent ID</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.02] px-4">
                    <span className="text-sm font-bold text-white/30">@</span>
                    <input
                      type="text"
                      value={username}
                      disabled
                      className="h-12 w-full border-none bg-transparent text-sm text-white/60 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold text-white/70">Email address</label>
                    <span className="text-[10px] font-semibold text-emerald-400">Verified</span>
                  </div>
                  <div className={`flex items-center gap-3 rounded-xl border px-4 transition ${
                    isEditing
                      ? 'border-[#7b8cff] bg-[#0c0a1f] focus-within:ring-4 focus-within:ring-[#7b8cff]/20'
                      : 'border-white/10 bg-white/[.03]'
                  }`}>
                    <Icon name="mail" size={17} className={isEditing ? 'text-[#a99bff]' : 'text-white/30'}/>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      required
                      placeholder="your.email@example.com"
                      className="h-12 w-full border-none bg-transparent text-sm text-white outline-none disabled:cursor-default disabled:text-white/80"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-white/70">Phone number</label>
                  <div className={`flex items-center gap-3 rounded-xl border px-4 transition ${
                    isEditing
                      ? 'border-[#7b8cff] bg-[#0c0a1f] focus-within:ring-4 focus-within:ring-[#7b8cff]/20'
                      : 'border-white/10 bg-white/[.03]'
                  }`}>
                    <Icon name="phone" size={17} className={isEditing ? 'text-[#a99bff]' : 'text-white/30'}/>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={!isEditing}
                      required
                      placeholder="Your phone number"
                      className="h-12 w-full border-none bg-transparent text-sm text-white outline-none disabled:cursor-default disabled:text-white/80"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              {isEditing ? (
                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2b8fe0] via-[#7161d8] to-[#7b4fc8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                    ) : (
                      <Icon name="completed" size={16}/>
                    )}
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFullName(user.full_name || '');
                      setPhoneNumber(user.phone_number || '');
                      setEmail(user.email || '');
                      setIsEditing(false);
                    }}
                    className="rounded-xl border border-white/15 bg-white/[.06] px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/40">
                  Click <strong>Edit profile</strong> above to modify your contact details.
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Shortcuts & Studio Support */}
          <aside className="space-y-5">
            {/* Quick Actions Hub */}
            <div className="rounded-[26px] border border-white/[.1] bg-white/[.04] p-6 shadow-xl backdrop-blur-xl">
              <h3 className="font-outfit text-base font-bold text-white">Studio Quick Links</h3>
              <p className="mt-1 text-xs text-white/45">Manage your artworks and orders</p>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('orders')}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[.04] p-3.5 text-left transition hover:border-[#8e7ce5]/50 hover:bg-white/[.08]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/20 text-[#a99bff]">
                      <Icon name="orders" size={18}/>
                    </span>
                    <div>
                      <strong className="block text-xs text-white group-hover:text-[#bca8ff]">My Orders & Proofs</strong>
                      <span className="text-[11px] text-white/40">Track progress & revisions</span>
                    </div>
                  </div>
                  <Icon name="arrowRight" size={14} className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white"/>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('commission')}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[.04] p-3.5 text-left transition hover:border-[#8e7ce5]/50 hover:bg-white/[.08]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2b8fe0]/20 text-[#71b7ff]">
                      <Icon name="pencil" size={18}/>
                    </span>
                    <div>
                      <strong className="block text-xs text-white group-hover:text-[#bca8ff]">New Commission</strong>
                      <span className="text-[11px] text-white/40">Order a handcrafted portrait</span>
                    </div>
                  </div>
                  <Icon name="arrowRight" size={14} className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white"/>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('reviews')}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[.04] p-3.5 text-left transition hover:border-[#8e7ce5]/50 hover:bg-white/[.08]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                      <Icon name="rating" size={18}/>
                    </span>
                    <div>
                      <strong className="block text-xs text-white group-hover:text-[#bca8ff]">Customer Stories</strong>
                      <span className="text-[11px] text-white/40">Read & share feedback</span>
                    </div>
                  </div>
                  <Icon name="arrowRight" size={14} className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white"/>
                </button>
              </div>
            </div>

            {/* Account Privacy & Security Card */}
            <div className="rounded-[26px] border border-[#7868d8]/20 bg-gradient-to-br from-[#2b2457]/40 via-[#161433]/40 to-[#102035]/40 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#bfb5ff]">
                  <Icon name="lock" size={16}/>
                </span>
                <h4 className="font-outfit text-sm font-bold text-white">Private & Secure</h4>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                Your reference photos, artwork proofs, and invoices are private and securely linked to your account.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
