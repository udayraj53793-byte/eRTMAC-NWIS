import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Building, Shield, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pwSection, setPwSection] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const roleColor = { ENGINEER: 'bg-blue-100 text-blue-800', MANAGER: 'bg-emerald-100 text-emerald-800', ADMIN: 'bg-amber-100 text-amber-900' };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put(`/users/${user._id}`, { name, department });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully.' });
        if (setUser) setUser(prev => ({ ...prev, name, department }));
        setEditing(false);
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPw || !newPw) { setPwMsg({ type: 'error', text: 'Please fill both fields.' }); return; }
    if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    setSaving(true);
    setPwMsg(null);
    try {
      await api.put(`/users/${user._id}`, { currentPassword: oldPw, newPassword: newPw });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setOldPw(''); setNewPw(''); setPwSection(false);
    } catch (e) {
      setPwMsg({ type: 'error', text: e.response?.data?.message || 'Password change failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-workspace mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <User className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-700">Account settings</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your personal and security details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      {/* Profile card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="profile-identity flex items-center gap-5 border-b border-slate-100 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold text-slate-900 shadow-sm">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-slate-800">{user.name}</div>
            <div className="mt-0.5 truncate text-sm text-slate-500">{user.email}</div>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${roleColor[user.role] || 'bg-slate-100'}`}>{user.role}</span>
          </div>
        </div>

        {msg && (
          <div role="status" className={`mx-6 mt-5 flex items-center gap-2 rounded-xl p-3 text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-6 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name</label>
            {editing
              ? <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              : <div className="flex items-center gap-2 text-sm text-slate-700"><User size={15} className="text-slate-400" /> {user.name}</div>
            }
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
            <div className="flex items-center gap-2 text-sm text-slate-500"><Mail size={15} className="text-slate-400" /> {user.email}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Department</label>
            {editing
              ? <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              : <div className="flex items-center gap-2 text-sm text-slate-700"><Building size={15} className="text-slate-400" /> {user.department || '—'}</div>
            }
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Role</label>
            <div className="flex items-center gap-2 text-sm text-slate-700"><Shield size={15} className="text-slate-400" /> {user.role}</div>
          </div>
          {user.lastLogin && (
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Last Login</label>
              <div className="flex items-center gap-2 text-sm text-slate-700"><Clock size={15} className="text-slate-400" /> {new Date(user.lastLogin).toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-4">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setName(user.name); setDepartment(user.department || ''); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Edit Profile</button>
          )}
        </div>
      </section>

      {/* Password change */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700">Security</p>
            <h3 className="mt-1 text-base font-bold text-slate-800">Password</h3>
            <p className="mt-1 text-xs text-slate-500">Update your account credentials</p>
          </div>
          <button onClick={() => setPwSection(p => !p)} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">{pwSection ? 'Cancel' : 'Change'}</button>
        </div>

        {pwSection && (
          <div className="space-y-3">
            {pwMsg && (
              <div role="status" className={`flex items-center gap-2 rounded-xl p-3 text-sm ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {pwMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {pwMsg.text}
              </div>
            )}
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Current password" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" aria-label={showOld ? 'Hide current password' : 'Show current password'} onClick={() => setShowOld(p => !p)} className="absolute right-2.5 top-2.5 text-slate-400">{showOld ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 8 chars)" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" aria-label={showNew ? 'Hide new password' : 'Show new password'} onClick={() => setShowNew(p => !p)} className="absolute right-2.5 top-2.5 text-slate-400">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <button onClick={handlePasswordChange} disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}
      </section>
      </div>

      {/* Demo notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        🔒 This is a demonstration environment. Credentials are for demo purposes only.
        Demo accounts: <code>engineer@ertmac.demo</code>, <code>manager@ertmac.demo</code>, <code>admin@ertmac.demo</code> — password: <code>Demo@2024</code>
      </div>
    </div>
  );
};

export default Profile;
