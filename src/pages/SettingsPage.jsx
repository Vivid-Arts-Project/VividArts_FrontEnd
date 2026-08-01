import { useState, useEffect, useCallback } from 'react';
import {
  getProfile, updateProfile, updateBusiness,
  updateNotifications, changePassword,
  getPricing, updatePriceRow,
} from '../api/adminApi';

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
    <div className="page-content" style={{ maxWidth: 760 }}>
      {/* Shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <div className="settings-tabs">
        {['profile', 'business', 'notifications', 'security', 'pricing'].map(t => (
          <button
            key={t}
            className={`settings-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ profile: 'Profile', business: 'Business', notifications: 'Notifications', security: 'Security', pricing: 'Pricing Config' }[t]}
          </button>
        ))}
      </div>

      {tab === 'profile'       && <ProfileTab       key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile}/>}
      {tab === 'business'      && <BusinessTab      key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile}/>}
      {tab === 'notifications' && <NotificationsTab key={admin?.updatedAt || admin?.id || 'loading'} admin={admin} loading={loading} onToast={onToast} onSaved={loadProfile}/>}
      {tab === 'security'      && <SecurityTab                                      onToast={onToast}/>}
      {tab === 'pricing'       && <PricingTab                                       onToast={onToast}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ admin, loading, onToast, onSaved }) {
  const [form, setForm] = useState(() => ({
    firstName: admin?.firstName || '',
    lastName:  admin?.lastName  || '',
    email:     admin?.email     || '',
    phone:     admin?.phone     || '',
  }));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      onToast('✓ Profile saved');
      onSaved(); // re-fetch so Sidebar name updates too
    } catch (e) {
      onToast('❌ ' + (e.response?.data?.error || 'Failed to save profile'));
    } finally { setSaving(false); }
  };

  const initials = admin
    ? `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase() || 'A'
    : 'A';

  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Profile Information</div></div>
      <div className="card-body">
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff', fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>
            {loading ? '?' : initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>
              {loading ? <Skeleton width={140}/> : `${admin?.firstName} ${admin?.lastName}`}
            </div>
            <div style={{ fontSize: 13, color: 'var(--va-text3)', marginTop: 4 }}>Artist & Administrator</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">First Name</label>
            {loading ? <Skeleton height={38}/> : <input className="field-input" value={form.firstName} onChange={e => set('firstName', e.target.value)}/>}
          </div>
          <div className="field">
            <label className="field-label">Last Name</label>
            {loading ? <Skeleton height={38}/> : <input className="field-input" value={form.lastName}  onChange={e => set('lastName',  e.target.value)}/>}
          </div>
        </div>
        <div className="field">
          <label className="field-label">Email Address</label>
          {loading ? <Skeleton height={38}/> : <input className="field-input" type="email" value={form.email} onChange={e => set('email', e.target.value)}/>}
        </div>
        <div className="field">
          <label className="field-label">Phone</label>
          {loading ? <Skeleton height={38}/> : <input className="field-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+94 77 000 0000"/>}
        </div>

        <button className="btn btn-fill" style={{ padding: '9px 20px' }} onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
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
          <span style={{ fontSize: 12, color: 'var(--va-text3)' }}>A3 · 1 subject · no frame · pickup · standard</span>
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
