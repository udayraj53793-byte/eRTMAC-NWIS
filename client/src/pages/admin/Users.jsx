import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingState } from '../../components/States';
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ENGINEER', department: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    api.get('/users').then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'ENGINEER', department: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role, department: form.department };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editUser._id}`, payload);
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      loadUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await api.patch(`/users/${user._id}/status`, { status: newStatus });
    loadUsers();
  };

  if (loading) return <LoadingState />;

  const roleColors = { ADMIN: 'bg-purple-100 text-purple-700', MANAGER: 'bg-teal-100 text-teal-700', ENGINEER: 'bg-blue-100 text-blue-700' };

  return (
    <div className="min-w-0 space-y-6 rounded-2xl bg-[#f4f6f7] p-3 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl border border-[#d8e1e5] bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#c79b24]" />
        <div className="flex flex-col gap-4 pl-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a6b12]">Administration / access control</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#173f5f] sm:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">{users.length} users total · Manage identity, role and access status</p>
          </div>
          <button onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173f5f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#102f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add User
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,39,56,0.06)]" aria-label="User directory">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-base font-semibold text-[#173f5f]">Directory</h2><p className="text-xs text-slate-500">Account details and administrative actions</p></div>
          <span className="rounded-full bg-[#edf2f4] px-3 py-1 text-xs font-semibold text-[#526574]">{users.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="bg-[#edf2f4] text-[#526574] text-xs">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Email</th>
            <th className="text-left px-4 py-3 font-medium">Role</th>
            <th className="text-left px-4 py-3 font-medium">Department</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Last Login</th>
            <th className="text-left px-4 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t border-slate-100 transition-colors hover:bg-[#f7f8f5]">
                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{user.email}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role] || 'bg-slate-100'}`}>{user.role}</span></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{user.department || '—'}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium ${user.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>{user.status}</span></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#edf2f4] hover:text-[#173f5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]"><Edit2 className="h-4 w-4" aria-hidden="true" /></button>
                    <button type="button" onClick={() => toggleStatus(user)} aria-label={`${user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${user.name}`} className={`rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] ${user.status === 'ACTIVE' ? 'text-emerald-600 hover:bg-red-50 hover:text-red-600' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                      {user.status === 'ACTIVE' ? <ToggleRight className="h-5 w-5" aria-hidden="true" /> : <ToggleLeft className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No users found.</p>}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102f47]/55 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="user-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6b12]">Account details</p>
              <h3 id="user-dialog-title" className="text-xl font-semibold text-[#173f5f]">{editUser ? 'Edit User' : 'Create User'}</h3>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-100 text-sm text-red-600 rounded-lg">{error}</div>}
            <div className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Password', key: 'password', type: 'password', placeholder: editUser ? 'Leave blank to keep current' : 'Required' },
                { label: 'Department', key: 'department', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label htmlFor={`user-${f.key}`} className="mb-1 block text-xs font-semibold text-[#526574]">{f.label}</label>
                  <input id={`user-${f.key}`} type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24] focus-visible:ring-offset-1" />
                </div>
              ))}
              <div>
                <label htmlFor="user-role" className="mb-1 block text-xs font-semibold text-[#526574]">Role</label>
                <select id="user-role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
                  <option value="ENGINEER">ENGINEER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => setShowModal(false)} className="min-h-11 flex-1 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} className="min-h-11 flex-1 rounded-xl bg-[#173f5f] py-2 text-sm font-semibold text-white hover:bg-[#102f47] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79b24]">
                {saving ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
