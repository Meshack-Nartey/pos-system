import { useState, useEffect } from 'react';
import { Plus, Search, X, Pencil } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import {
  getAllCustomers, createCustomer, updateCustomer, searchCustomers
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

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const input = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800'
  }`;
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
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#E60000]'}`}>Customer Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-4 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
        >
          <Plus size={16} /> Register Customer
        </button>
      </div>

      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">✅ {success}</div>}
      {error   && <div className="bg-[#FFF0F0] border border-[#FF3333] text-[#CC0000] px-4 py-3 rounded-lg mb-4 text-sm">⚠️ {error}</div>}

      {/* Search */}
      <div className={`rounded-xl shadow p-4 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input type="text" value={searchQuery} onChange={handleSearch}
            placeholder="Search by name, phone or email..." className={`${input} pl-9`} />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading customers...</p>
          </div>
        ) : (
          <CustomerTable customers={customers} onEdit={openEditModal} onDelete={null} onUpdatePoints={null} />
        )}
      </div>

      {/* Add / Edit Modal */}
      {showFormModal && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editingCustomer ? 'bg-yellow-100' : 'bg-[#FFF0F0]'}`}>
                  {editingCustomer ? <Pencil size={18} className="text-yellow-600" /> : <Plus size={18} className="text-[#E60000]" />}
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {editingCustomer ? 'Edit Customer' : 'Register New Customer'}
                  </h2>
                  {editingCustomer && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{editingCustomer.phone}</p>}
                </div>
              </div>
              <button onClick={() => { setShowFormModal(false); setEditingCustomer(null); }}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
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

    </div>
  );
};

export default CustomerManagement;
