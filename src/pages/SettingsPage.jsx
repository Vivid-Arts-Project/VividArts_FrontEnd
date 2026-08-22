import { useState, useEffect, useCallback } from 'react';
import {
  getProfile, updateProfile, updateBusiness,
  updateNotifications, changePassword, uploadAdminProfileImage,
  getPricing, updatePriceRow,
  getAdminRegistrationRequests, decideAdminRegistrationRequest,
  getAdministrators, setAdministratorStatus, removeAdministrator,
  getSiteSettings, updateSiteSettings,
} from '../api/adminApi';
import { useAuth } from '../context/useAuth';
import Icon from '../components/Icon';

// ── Small reusable loading skeleton ──────────────────────────────────────────
function Skeleton({ width = '100%', height = 14 }) {
  return (
    <div style={{
      width, height, borderRadius: 4,
      background: 'linear-gradient(90deg,var(--va-bg2) 25%,var(--va-border) 50%,var(--va-bg2) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }}/>
  );
}

// ── Category label map ────────────────────────────────────────────────────────
const CAT_LABELS = {
  BASE_PRICE:    '📐 Base Prices',
  SUBJECT_ADDON: '👤 Subject Add-ons',
  FRAME:         '🖼 Frame Options',
  SERVICE:       '🚚 Service Fees',
};

// ══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage({ onToast }) {
  const [tab, setTab] = useState('profile');
  const { updateAdmin } = useAuth();

  // ── Shared admin data loaded once ─────────────────────────────────────────
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setAdmin(res.data);
    } catch {
      onToast('❌ Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    let ignore = false;

    getProfile()
      .then(res => { if (!ignore) setAdmin(res.data); })
      .catch(() => { if (!ignore) onToast('âŒ Failed to load profile'); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [onToast]);

  return (
    <div className="page-content" style={{ maxWidth: 1180 }}>
      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <div className="settings-tabs">
        {['profile', 'business', 'notifications', 'security', ...(admin?.isSuperAdmin ? ['pricing', 'adminRequests', 'availability'] : [])].map(t => (
          <button
            key={t}
            className={`settings-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ profile: 'Profile', business: 'Business', notifications: 'Notifications', security: 'Security', pricing: 'Pricing Config', adminRequests: 'Admin Management', availability: 'Site Availability' }[t]}
          </button>
        ))}
      </div>

      {tab === 'profile'       && <ProfileTab       key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile} updateAdmin={updateAdmin}/>}
      {tab === 'business'      && <BusinessTab      key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile}/>}
      {tab === 'notifications' && <NotificationsTab key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile}/>}
      {tab === 'security'      && <SecurityTab                                      onToast={onToast}/>}
      {tab === 'pricing'       && admin?.isSuperAdmin && <PricingTab onToast={onToast}/>}
      {tab === 'adminRequests' && admin?.isSuperAdmin && <AdminRequestsTab onToast={onToast}/>}
      {tab === 'availability'  && admin?.isSuperAdmin && <SiteAvailabilityTab onToast={onToast}/>}
    </div>
  );
}

function AdminRequestsTab({ onToast }) {
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [busy, setBusy] = useState('');
  const load = useCallback(() => Promise.all([getAdminRegistrationRequests(), getAdministrators()]).then(([requestResponse, adminResponse]) => { setRequests(requestResponse.data); setAdmins(adminResponse.data); }).catch(() => onToast('Failed to load administrator management')), [onToast]);
  useEffect(() => { load(); }, [load]);
  const decide = async (request, decision) => {
    const note = decision === 'rejected' ? window.prompt('Optional rejection reason:', '') || '' : '';
    setBusy(request.id);
    try { await decideAdminRegistrationRequest(request.id, decision, note); await load(); onToast(`Administrator request ${decision}`); }
    catch (error) { onToast(error.response?.data?.error || 'Unable to update request'); }
    finally { setBusy(''); }
  };
  const setStatus = async (admin, isActive) => {
    setBusy(admin.id);
    try { await setAdministratorStatus(admin.id, isActive); await load(); onToast(`Administrator ${isActive ? 'activated' : 'deactivated'}`); }
    catch (error) { onToast(error.response?.data?.error || 'Unable to update administrator'); }
    finally { setBusy(''); }
  };
  const remove = async admin => {
    if (!window.confirm(`Permanently remove administrator ${admin.username}?`)) return;
    setBusy(admin.id);
    try { await removeAdministrator(admin.id); await load(); onToast('Administrator removed'); }
    catch (error) { onToast(error.response?.data?.error || 'Unable to remove administrator'); }
    finally { setBusy(''); }
  };
  return <div className="space-y-5"><div className="card"><div className="card-head"><div className="card-title">Administrator accounts</div></div><div className="card-body space-y-3">
    {admins.map(admin => <div key={admin.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-va-border p-4"><div><strong>{admin.firstName || admin.username} {admin.lastName || ''}</strong><div className="text-xs text-va-text3">{admin.username} · {admin.email}</div></div><div className="flex items-center gap-2"><span className="rounded bg-va-bg2 px-2 py-1 text-xs font-semibold">{admin.isSuperAdmin ? 'Super admin' : admin.isActive ? 'Active' : 'Inactive'}</span>{!admin.isSuperAdmin && <><button disabled={busy === admin.id} className="btn btn-ghost btn-sm" onClick={() => setStatus(admin, !admin.isActive)}>{admin.isActive ? 'Deactivate' : 'Activate'}</button><button disabled={busy === admin.id} className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(admin)}>Remove</button></>}</div></div>)}
  </div></div><div className="card"><div className="card-head"><div className="card-title">Pending access requests</div></div><div className="card-body space-y-3">
    {requests.map(request => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-va-border p-4"><div><strong>{request.firstName || request.username} {request.lastName || ''}</strong><div className="text-xs text-va-text3">{request.username} · {request.email} · requested {new Date(request.createdAt).toLocaleString()}</div>{request.decisionNote && <div className="mt-1 text-xs text-va-text3">Note: {request.decisionNote}</div>}</div><div className="flex items-center gap-2"><span className="rounded bg-va-bg2 px-2 py-1 text-xs font-semibold capitalize">{request.status}</span>{request.status === 'pending' && <><button disabled={busy === request.id} className="btn btn-fill btn-sm" onClick={() => decide(request, 'approved')}>Approve</button><button disabled={busy === request.id} className="btn btn-ghost btn-sm" onClick={() => decide(request, 'rejected')}>Reject</button></>}</div></div>)}
    {!requests.length && <div className="py-8 text-center text-sm text-va-text3">No administrator requests.</div>}
  </div></div></div>;
}

function SiteAvailabilityTab({ onToast }) {
  const [settings, setSettings] = useState({ developmentMode: false, maintenanceMessage: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => { getSiteSettings().then(response => setSettings(response.data)).catch(() => onToast('Failed to load site availability')); }, [onToast]);
  const save = async () => {
    setSaving(true);
    try { const response = await updateSiteSettings(settings); setSettings(response.data.settings); onToast('Site availability updated'); }
    catch (error) { onToast(error.response?.data?.error || 'Unable to update site availability'); }
    finally { setSaving(false); }
  };
  return <div className="card"><div className="card-head"><div className="card-title">Customer site availability</div></div><div className="card-body">
    <div className="flex items-center justify-between border-b border-va-border pb-4"><div><strong className="text-sm">On development</strong><p className="mt-1 text-xs text-va-text3">Blocks customer pages and APIs while keeping the admin workspace and PayHere callback available.</p></div><label className="toggle-switch"><input type="checkbox" checked={!!settings.developmentMode} onChange={event => setSettings(current => ({ ...current, developmentMode: event.target.checked }))}/><span className="toggle-slider"/></label></div>
    <label className="mt-4 block"><span className="field-label">Customer message</span><textarea className="field-input min-h-24" maxLength={300} value={settings.maintenanceMessage || ''} onChange={event => setSettings(current => ({ ...current, maintenanceMessage: event.target.value }))}/></label>
    <button className="btn btn-fill" disabled={saving || !settings.maintenanceMessage?.trim()} onClick={save}>{saving ? 'Saving…' : 'Save availability'}</button>
  </div></div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ admin, loading, onToast, onSaved, updateAdmin }) {
  const [form, setForm] = useState(() => ({
    firstName: admin?.firstName || '',
    lastName:  admin?.lastName  || '',
    email:     admin?.email     || '',
    phone:     admin?.phone     || '',
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateProfile(form);
      updateAdmin(response.data.admin);
      onToast('✓ Profile saved');
      onSaved(); // re-fetch so Sidebar name updates too
    } catch (e) {
      onToast('❌ ' + (e.response?.data?.error || 'Failed to save profile'));
    } finally { setSaving(false); }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return onToast('❌ Select a JPG, PNG, or WebP image');
    if (file.size > 5 * 1024 * 1024) return onToast('❌ Profile photo must be 5 MB or smaller');

    setUploadingPhoto(true);
    try {
      const response = await uploadAdminProfileImage(file);
      updateAdmin(response.data.admin);
      onToast('✓ Profile photo updated');
      onSaved();
    } catch (error) {
      onToast('❌ ' + (error.response?.data?.error || 'Failed to upload profile photo'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const initials = admin
    ? `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase() || 'A'
    : 'A';
  const displayName = `${admin?.firstName || ''} ${admin?.lastName || ''}`.trim() || 'Administrator';
  const inputClass = 'h-12 w-full rounded-xl border border-[#dddaf2] bg-[#fafaff] px-4 text-sm text-[#211f36] outline-none transition-all duration-200 placeholder:text-[#aaa6c0] hover:border-[#c6c0eb] focus:border-[#7968dc] focus:bg-white focus:ring-4 focus:ring-[#7968dc]/10';

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#dcd8f2] bg-white shadow-[0_22px_60px_rgba(65,53,138,.10)]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#191535] via-[#403586] to-[#268fdd] px-5 py-7 text-white sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[.06]"/>
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-[#7f6ce7]/25 blur-3xl"/>
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative w-fit shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[30px] border-4 border-white bg-gradient-to-br from-[#4aa5e8] to-[#8061d8] font-outfit text-3xl font-extrabold text-white shadow-[0_18px_45px_rgba(9,8,30,.36)]">
              {admin?.profileImageUrl
                ? <img src={admin.profileImageUrl} alt="Admin profile" className="h-full w-full object-cover"/>
                : loading ? '?' : initials}
            </div>
            <label className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-[#7963dc] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#6650ca] ${uploadingPhoto ? 'cursor-wait opacity-70' : 'cursor-pointer'}`} title={admin?.profileImageUrl ? 'Change profile photo' : 'Add profile photo'}>
              <Icon name={uploadingPhoto ? 'pending' : 'camera'} size={19}/>
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploadingPhoto || loading} onChange={handlePhotoUpload}/>
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#ddd8ff] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.9)]"/> Admin profile
            </div>
            <h2 className="truncate font-outfit text-2xl font-extrabold tracking-[-.02em] sm:text-3xl">
              {loading ? <Skeleton width={180} height={28}/> : displayName}
            </h2>
            <p className="mt-1 text-sm font-medium text-white/65">Artist & Administrator</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/75"><Icon name="mail" size={14}/>{admin?.email || 'Email not added'}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/75"><Icon name="phone" size={14}/>{admin?.phone || 'Phone not added'}</span>
            </div>
            {uploadingPhoto && <p className="mt-3 text-[11px] text-white/55">Uploading your new photo… JPG, PNG or WebP · Maximum 5 MB</p>}
          </div>
        </div>
      </section>

      <section className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#7968dc]">Account details</p>
            <h3 className="mt-1 font-outfit text-xl font-bold text-[#211f36]">Personal information</h3>
          </div>
          <p className="text-xs text-[#8d89a6]">Keep your administrator contact details current.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#393650]">First name</label>
            {loading ? <Skeleton height={48}/> : <input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)}/>} 
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-[#393650]">Last name</label>
            {loading ? <Skeleton height={48}/> : <input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)}/>} 
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#393650]">Email address</label>
            {loading ? <Skeleton height={48}/> : <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)}/>} 
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-[#393650]">Phone number</label>
            {loading ? <Skeleton height={48}/> : <input className={inputClass} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 77 000 0000"/>}
          </div>
        </div>

        <div className="mt-7 flex justify-end border-t border-[#eeecf7] pt-5">
          <button className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#338fdf] via-[#675ed4] to-[#7546b9] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(91,63,168,.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(91,63,168,.34)] disabled:cursor-wait disabled:opacity-60" onClick={handleSave} disabled={saving || loading}>
            <Icon name={saving ? 'pending' : 'completed'} size={17}/>{saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUSINESS TAB
// ══════════════════════════════════════════════════════════════════════════════
function BusinessTab({ admin, loading, onToast, onSaved }) {
  const [form, setForm] = useState(() => ({
    businessName:    admin?.businessName    || '',
    businessEmail:   admin?.businessEmail   || '',
    businessAddress: admin?.businessAddress || '',
  }));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusiness(form);
      onToast('✓ Business settings saved');
      onSaved();
    } catch (e) {
      onToast('❌ ' + (e.response?.data?.error || 'Failed to save'));
    } finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Business Details</div></div>
      <div className="card-body">
        <div className="field">
          <label className="field-label">Business Name</label>
          {loading ? <Skeleton height={38}/> : <input className="field-input" value={form.businessName} onChange={e => set('businessName', e.target.value)}/>}
        </div>
        <div className="field">
          <label className="field-label">Business Email</label>
          {loading ? <Skeleton height={38}/> : <input className="field-input" type="email" value={form.businessEmail} onChange={e => set('businessEmail', e.target.value)}/>}
        </div>
        <div className="field">
          <label className="field-label">Studio Address / Pickup Location</label>
          {loading ? <Skeleton height={70}/> : <textarea className="field-textarea" value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)} placeholder="e.g. 45/B Dewala Road, Matara, Sri Lanka"/>}
          <div className="field-hint">This address is sent automatically to customers who choose pickup delivery when their order is marked Shipped.</div>
        </div>
        <button className="btn btn-fill" style={{ padding: '9px 20px' }} onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save business settings'}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS TAB
// ══════════════════════════════════════════════════════════════════════════════
function NotificationsTab({ admin, loading, onToast, onSaved }) {
  const [prefs, setPrefs] = useState(() => admin?.notifPreferences || ({
    newOrder: true, revisionRequested: true,
    proofApproved: true, paymentReceived: true, deadlineReminders: false,
  }));
  const [saving, setSaving] = useState(false);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await updateNotifications(updated);
      onToast('✓ Notification preferences saved');
        onSaved();
    } catch {
      onToast('❌ Failed to save preferences');
      setPrefs(prefs); // revert on failure
    } finally { setSaving(false); }
  };

  const ITEMS = [
    { key: 'newOrder',          label: 'New order placed',     sub: 'Email when a client submits and pays for a commission'       },
    { key: 'revisionRequested', label: 'Revision requested',   sub: 'Email when a client requests changes to an uploaded proof'   },
    { key: 'proofApproved',     label: 'Proof approved',       sub: 'Email when a client approves the watermarked proof'          },
    { key: 'paymentReceived',   label: 'Payment received',     sub: 'Email when PayHere or Stripe confirms a payment'             },
    { key: 'deadlineReminders', label: 'Deadline reminders',   sub: "Email 2 days before any order's urgent deadline"            },
  ];

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Email Notification Preferences</div></div>
      <div className="card-body">
        {ITEMS.map(item => (
          <div key={item.key} className="toggle">
            <div className="toggle-info">
              <div className="toggle-label">{item.label}</div>
              <div className="toggle-sub">{item.sub}</div>
            </div>
            {loading
              ? <Skeleton width={40} height={22}/>
              : (
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!prefs[item.key]}
                    onChange={() => toggle(item.key)}
                    disabled={saving}
                  />
                  <span className="toggle-slider"/>
                </label>
              )
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECURITY TAB
// ══════════════════════════════════════════════════════════════════════════════
function SecurityTab({ onToast }) {
  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      return onToast('❌ New passwords do not match');
    }
    if (form.newPassword.length < 8) {
      return onToast('❌ New password must be at least 8 characters');
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      onToast('✓ Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      onToast('❌ ' + (e.response?.data?.error || 'Failed to update password'));
    } finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Change Password</div></div>
      <div className="card-body">
        <div className="field"><label className="field-label">Current Password</label><input className="field-input" type="password" placeholder="Enter current password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)}/></div>
        <div className="field"><label className="field-label">New Password</label><input className="field-input" type="password" placeholder="Minimum 8 characters" value={form.newPassword} onChange={e => set('newPassword', e.target.value)}/></div>
        <div className="field"><label className="field-label">Confirm New Password</label><input className="field-input" type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}/></div>
        <button className="btn btn-fill" style={{ padding: '9px 20px' }} onClick={handleSave} disabled={saving}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRICING CONFIG TAB
// ══════════════════════════════════════════════════════════════════════════════
function PricingTab({ onToast }) {
  const [rows, setRows]       = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { [rowId]: newPrice }
  const [saving, setSaving]   = useState(null);

  const loadPricing = useCallback(async () => {
    try {
      const res = await getPricing();
      setRows(res.data.rows);
      setPreview(res.data.preview);
    } catch { onToast('❌ Failed to load pricing config'); }
    finally { setLoading(false); }
  }, [onToast]);

  useEffect(() => {
    let ignore = false;

    getPricing()
      .then(res => {
        if (ignore) return;
        setRows(res.data.rows);
        setPreview(res.data.preview);
      })
      .catch(() => { if (!ignore) onToast('âŒ Failed to load pricing config'); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [onToast]);

  const handlePriceChange = (id, val) => {
    setEditing(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = async (row) => {
    const newPrice = editing[row.id];
    if (newPrice === undefined || newPrice === '') return;
    if (isNaN(parseFloat(newPrice))) return onToast('❌ Enter a valid number');

    setSaving(row.id);
    try {
      await updatePriceRow(row.id, { price: parseFloat(newPrice) });
      onToast(`✓ ${row.description} updated to Rs. ${newPrice}`);
      setEditing(prev => { const n = { ...prev }; delete n[row.id]; return n; });
      loadPricing(); // refresh preview
    } catch (e) {
      onToast('❌ ' + (e.response?.data?.error || 'Failed to update price'));
    } finally { setSaving(null); }
  };

  const handleToggle = async (row) => {
    try {
      await updatePriceRow(row.id, { isActive: !row.isActive });
      onToast(`✓ ${row.description} ${row.isActive ? 'disabled' : 'enabled'}`);
      loadPricing();
    } catch { onToast('❌ Failed to toggle'); }
  };

  // Group rows by category for display
  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = [];
    acc[row.category].push(row);
    return acc;
  }, {});

  return (
    <div>
      {/* Live preview card */}
      <div className="card mb-16">
        <div className="card-head">
          <div className="card-title">💰 Live Price Preview</div>
          <span style={{ fontSize: 12, color: 'var(--va-text3)' }}>A3 · 1 subject · no frame · delivery · standard</span>
        </div>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          {loading || !preview ? (
            <Skeleton width={160} height={20}/>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              {preview.breakdown.map((b, i) => (
                <div key={i} style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--va-text3)' }}>{b.label}: </span>
                  <strong>Rs. {b.amount.toLocaleString()}</strong>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: 'var(--va-purple)' }}>
                Total: Rs. {preview.total.toLocaleString()}
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--va-text3)', marginTop: 8 }}>
            This preview updates automatically when you save a price change.
          </div>
        </div>
      </div>

      {/* Price table grouped by category */}
      {loading ? (
        <div className="card"><div className="card-body"><Skeleton height={200}/></div></div>
      ) : (
        Object.entries(grouped).map(([cat, catRows]) => (
          <div key={cat} className="card mb-16">
            <div className="card-head">
              <div className="card-title">{CAT_LABELS[cat] || cat}</div>
              <span style={{ fontSize: 12, color: 'var(--va-text3)' }}>{catRows.length} items</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Key</th>
                  <th>Current Price (Rs.)</th>
                  <th>New Price</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {catRows.map(row => (
                  <tr key={row.id} style={{ opacity: row.isActive ? 1 : 0.45 }}>
                    <td style={{ fontWeight: 500 }}>{row.description}</td>
                    <td>
                      <code style={{ fontSize: 11, background: 'var(--va-bg2)', padding: '2px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono',monospace" }}>
                        {row.itemKey}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--va-purple)' }}>
                        Rs. {parseFloat(row.price).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="field-input"
                        style={{ width: 100, padding: '5px 8px', fontSize: 13, marginBottom: 0 }}
                        placeholder={row.price}
                        value={editing[row.id] ?? ''}
                        onChange={e => handlePriceChange(row.id, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSave(row)}
                      />
                    </td>
                    <td>
                      <label className="toggle-switch" style={{ margin: 0 }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={() => handleToggle(row)}/>
                        <span className="toggle-slider"/>
                      </label>
                    </td>
                    <td>
                      <button
                        className="btn btn-fill btn-sm"
                        onClick={() => handleSave(row)}
                        disabled={saving === row.id || editing[row.id] === undefined || editing[row.id] === ''}
                      >
                        {saving === row.id ? '…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <div className="alert alert-info">
        💡 Price changes take effect immediately for all new orders. Existing orders keep the price they were created with.
      </div>
    </div>
  );
}
