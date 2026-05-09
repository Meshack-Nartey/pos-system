import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, UserCog, Eye, EyeOff, AlertTriangle, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const UserManagement = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const input = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800'
  }`;
  const label = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
  const th = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider`;
  const td = `px-4 py-3 text-sm`;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 3000); }
  };

  // ── Add User ──────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post(API_URL, addData, { headers: { Authorization: `Bearer ${token}` } });
      notify('success', 'User created successfully!');
      setShowAddModal(false);
      setAddData({ name: '', email: '', password: '', role: 'cashier' });
      setShowAddPassword(false);
      fetchUsers();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit User ─────────────────────────────────────────────
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowEditPassword(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.put(`${API_URL}/${editingUser._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      notify('success', 'User updated successfully!');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete User ───────────────────────────────────────────
  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/${deletingUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
      notify('success', 'User deleted successfully!');
      setShowDeleteModal(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = { admin: 'bg-rose-500 text-white', manager: 'bg-rose-500 text-white', cashier: 'bg-green-500 text-white' };
    return `px-2 py-1 rounded-lg text-xs font-semibold ${styles[role]}`;
  };

  const modalBg = `fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/30`;
  const modalBox = `w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-rose-600'}`}>User Management</h1>
        <button
          onClick={() => { setShowAddModal(true); setAddData({ name: '', email: '', password: '', role: 'cashier' }); }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Users Table */}
      <div className={`rounded-xl shadow p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={isDark ? 'bg-slate-700' : 'bg-rose-600'}>
                <tr>
                  {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                    <th key={h} className={`${th} ${isDark ? 'text-slate-300' : 'text-white'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u._id} className={`transition duration-150 ${
                    isDark
                      ? index % 2 === 0 ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 hover:bg-slate-700'
                      : index % 2 === 0 ? 'bg-white hover:bg-rose-50' : 'bg-gray-50 hover:bg-rose-50'
                  }`}>
                    <td className={`${td} font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <div className="flex items-center gap-2">
                        <div className="bg-rose-600 rounded-full p-1.5">
                          <UserCog size={12} className="text-white" />
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{u.email}</td>
                    <td className={td}><span className={getRoleBadge(u.role)}>{u.role}</span></td>
                    <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add User Modal ───────────────────────────────────── */}
      {showAddModal && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <Plus size={18} className="text-rose-600" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Add New User</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className={label}>Full Name *</label>
                <input type="text" value={addData.name} onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                  required placeholder="Enter full name" className={input} />
              </div>
              <div>
                <label className={label}>Email Address *</label>
                <input type="email" value={addData.email} onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                  required placeholder="Enter email address" className={input} />
              </div>
              <div>
                <label className={label}>Password *</label>
                <div className="relative">
                  <input type={showAddPassword ? 'text' : 'password'} value={addData.password}
                    onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                    required placeholder="Enter password" className={`${input} pr-10`} />
                  <button type="button" onClick={() => setShowAddPassword(!showAddPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={label}>Role *</label>
                <select value={addData.role} onChange={(e) => setAddData({ ...addData, role: e.target.value })} className={input}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ───────────────────────────────────── */}
      {showEditModal && editingUser && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <Pencil size={18} className="text-yellow-600" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Edit User</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{editingUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={label}>Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required placeholder="Enter full name" className={input} />
              </div>
              <div>
                <label className={label}>Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required placeholder="Enter email address" className={input} />
              </div>
              <div>
                <label className={label}>New Password <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>(leave blank to keep current)</span></label>
                <div className="relative">
                  <input type={showEditPassword ? 'text' : 'password'} value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password" className={`${input} pr-10`} />
                  <button type="button" onClick={() => setShowEditPassword(!showEditPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={label}>Role *</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={input}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {showDeleteModal && deletingUser && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <AlertTriangle size={18} className="text-rose-500" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete User</h2>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            {/* User preview */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="bg-rose-600 rounded-full p-2.5">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{deletingUser.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{deletingUser.email} · <span className="capitalize">{deletingUser.role}</span></p>
              </div>
            </div>

            <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              This action is <span className="font-semibold text-rose-500">permanent</span> and cannot be undone. Are you sure you want to delete this user?
            </p>

            <div className="flex gap-3">
              <button onClick={handleDeleteConfirm} disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                <Trash2 size={15} />
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
