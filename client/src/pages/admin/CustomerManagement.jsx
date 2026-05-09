import { useState, useEffect } from 'react';
import { Plus, Search, X, Star, Pencil, Trash2, AlertTriangle, User, History, ShoppingBag } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import {
  getAllCustomers, createCustomer, updateCustomer,
  deleteCustomer, updateLoyaltyPoints, searchCustomers,
  getCustomerPurchaseHistory
} from '../../services/customerService';
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerForm from '../../components/customers/CustomerForm';

const CustomerManagement = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Purchase history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Loyalty points modal
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [points, setPoints] = useState('');
  const [pointsLoading, setPointsLoading] = useState(false);

  const input = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800'
  }`;
  const label = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
  const modalBg = `fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30`;
  const modalBox = `w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`;

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers(token);
      setCustomers(data);
    } catch {
      notify('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 3000); }
  };

  // ── Add / Edit ────────────────────────────────────────────
  const openAddModal = () => { setEditingCustomer(null); setShowFormModal(true); };
  const openEditModal = (customer) => { setEditingCustomer(customer); setShowFormModal(true); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, formData, token);
        notify('success', 'Customer updated successfully!');
      } else {
        await createCustomer(formData, token);
        notify('success', 'Customer registered successfully!');
      }
      setShowFormModal(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const openDeleteModal = (customer) => { setDeletingCustomer(customer); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteCustomer(deletingCustomer._id, token);
      notify('success', 'Customer deleted successfully!');
      setShowDeleteModal(false);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch {
      notify('error', 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loyalty Points ────────────────────────────────────────
  const handleUpdatePoints = (customer) => { setSelectedCustomer(customer); setPoints(''); setShowPointsModal(true); };

  const handlePointsSubmit = async (e) => {
    e.preventDefault();
    setPointsLoading(true);
    try {
      await updateLoyaltyPoints(selectedCustomer._id, Number(points), token);
      notify('success', 'Loyalty points updated successfully!');
      setShowPointsModal(false);
      fetchCustomers();
    } catch {
      notify('error', 'Failed to update loyalty points');
    } finally {
      setPointsLoading(false);
    }
  };

  const openHistoryModal = async (customer) => {
    setHistoryCustomer(customer);
    setHistoryData(null);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const data = await getCustomerPurchaseHistory(customer._id, token);
      setHistoryData(data);
    } catch {
      notify('error', 'Failed to load purchase history');
      setShowHistoryModal(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Search ────────────────────────────────────────────────
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await searchCustomers(query, token);
        setCustomers(data);
      } catch {
        notify('error', 'Search failed');
      }
    } else {
      fetchCustomers();
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-rose-600'}`}>Customer Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
        >
          <Plus size={16} /> Register Customer
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Search */}
      <div className={`rounded-xl shadow p-4 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, phone or email..."
            className={`${input} pl-9`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading customers...</p>
          </div>
        ) : (
          <CustomerTable
            customers={customers}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onUpdatePoints={handleUpdatePoints}
            onHistory={openHistoryModal}
          />
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {showFormModal && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editingCustomer ? 'bg-yellow-100' : 'bg-rose-100'}`}>
                  {editingCustomer
                    ? <Pencil size={18} className="text-yellow-600" />
                    : <Plus size={18} className="text-rose-600" />
                  }
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {editingCustomer ? 'Edit Customer' : 'Register New Customer'}
                  </h2>
                  {editingCustomer && (
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {editingCustomer.phone}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setShowFormModal(false); setEditingCustomer(null); }}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            <CustomerForm
              onSubmit={handleSubmit}
              initialData={editingCustomer}
              onCancel={() => { setShowFormModal(false); setEditingCustomer(null); }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {showDeleteModal && deletingCustomer && (
        <div className={modalBg}>
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <AlertTriangle size={18} className="text-rose-500" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete Customer</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer preview */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="bg-rose-600 rounded-full p-2.5">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{deletingCustomer.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {deletingCustomer.phone}{deletingCustomer.email ? ` · ${deletingCustomer.email}` : ''}
                </p>
              </div>
            </div>

            <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              This action is <span className="font-semibold text-rose-500">permanent</span> and cannot be undone. Are you sure you want to delete this customer?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loyalty Points Modal ──────────────────────────────── */}
      {showPointsModal && selectedCustomer && (
        <div className={modalBg}>
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <Star size={18} className="text-yellow-500" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Update Loyalty Points</h2>
              </div>
              <button
                onClick={() => setShowPointsModal(false)}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="bg-rose-600 rounded-full p-2.5">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{selectedCustomer.name}</p>
                <p className="flex items-center gap-1 text-xs text-yellow-500 font-semibold mt-0.5">
                  <Star size={11} /> {selectedCustomer.loyaltyPoints} current points
                </p>
              </div>
            </div>

            <form onSubmit={handlePointsSubmit} className="space-y-4">
              <div>
                <label className={label}>Points to Add <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>(use negative to subtract)</span></label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                  placeholder="e.g. 50 or -10"
                  className={input}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={pointsLoading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pointsLoading ? 'Updating...' : 'Update Points'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Purchase History Modal ───────────────────────────── */}
      {showHistoryModal && historyCustomer && (
        <div className={modalBg}>
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <History size={18} className="text-rose-600" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Purchase History
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {historyCustomer.name} · {historyCustomer.phone}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-10">
                <div className="w-7 h-7 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading history...</p>
              </div>
            ) : historyData?.sales?.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag size={36} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>No purchases yet</p>
              </div>
            ) : historyData ? (
              <>
                {/* Summary */}
                <div className={`grid grid-cols-3 gap-3 mb-5`}>
                  {[
                    { label: 'Total Purchases', value: historyData.sales.length },
                    { label: 'Total Spent', value: `GH₵ ${Number(historyData.totalSpent).toFixed(2)}` },
                    { label: 'Loyalty Points', value: `${historyCustomer.loyaltyPoints} pts` },
                  ].map((s, i) => (
                    <div key={i} className={`rounded-xl p-3 text-center ${isDark ? 'bg-slate-700' : 'bg-rose-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</p>
                      <p className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-rose-700'}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Transaction list */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {historyData.sales.map((sale) => (
                    <div key={sale._id} className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={14} className="text-rose-500" />
                          <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                            {new Date(sale.createdAt).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {' · '}
                            {new Date(sale.createdAt).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-rose-500">GH₵ {Number(sale.grandTotal).toFixed(2)}</p>
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {sale.items.map(item => `${item.name} ×${item.quantity}`).join(', ')}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                          sale.paymentMethod === 'mobile_money'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {sale.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Cash'}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          by {sale.cashier?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <button onClick={() => setShowHistoryModal(false)}
              className="mt-5 w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-medium transition">
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManagement;
