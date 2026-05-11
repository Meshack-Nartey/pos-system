import { useState, useEffect } from 'react';
import { X, Package, SlidersHorizontal, Pencil } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import {
  getAllInventory, getLowStockItems, updateStock, adjustStock
} from '../../services/inventoryService';
import StockTable from '../../components/inventory/StockTable';
import LowStockAlert from '../../components/inventory/LowStockAlert';

const InventoryManagement = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [updateData, setUpdateData] = useState({ stockQuantity: '', lowStockThreshold: '', supplier: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustData, setAdjustData] = useState({ adjustment: '', reason: '' });
  const [adjustLoading, setAdjustLoading] = useState(false);

  const input = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800'
  }`;
  const label = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
  const modalBg = `fixed inset-0 flex items-center justify-center z-50 px-4 backdrop-blur-sm bg-black/30`;
  const modalBox = `w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`;

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [allInventory, lowStock] = await Promise.all([
        getAllInventory(token), getLowStockItems(token)
      ]);
      setInventory(allInventory);
      setLowStockItems(lowStock);
    } catch {
      notify('error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
    else { setError(msg); setTimeout(() => setError(''), 3000); }
  };

  const handleUpdate = (item) => {
    setUpdatingItem(item);
    setUpdateData({ stockQuantity: item.stockQuantity, lowStockThreshold: item.lowStockThreshold, supplier: item.supplier || '' });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await updateStock(updatingItem._id, updateData, token);
      notify('success', 'Stock updated successfully!');
      setShowUpdateModal(false);
      fetchInventory();
    } catch {
      notify('error', 'Failed to update stock');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAdjust = (item) => {
    setAdjustingItem(item);
    setAdjustData({ adjustment: '', reason: '' });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustLoading(true);
    try {
      await adjustStock(adjustingItem._id, { adjustment: Number(adjustData.adjustment), reason: adjustData.reason }, token);
      notify('success', 'Stock adjusted successfully!');
      setShowAdjustModal(false);
      fetchInventory();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#E60000]'}`}>Inventory Management</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Track and manage stock levels</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-[#FFF0F0] border border-[#FF3333] text-[#CC0000] px-4 py-3 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Low Stock Alert */}
      <LowStockAlert items={lowStockItems} />

      {/* Inventory Table */}
      <div className={`rounded-xl shadow p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading inventory...</p>
          </div>
        ) : (
          <StockTable inventory={inventory} onUpdate={handleUpdate} onAdjust={handleAdjust} />
        )}
      </div>

      {/* ── Update Stock Modal ────────────────────────────────── */}
      {showUpdateModal && updatingItem && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFF0F0] p-2 rounded-xl">
                  <Pencil size={18} className="text-[#E60000]" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Update Stock</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{updatingItem.product?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowUpdateModal(false)}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Product preview */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="bg-[#E60000] rounded-full p-2.5">
                <Package size={16} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{updatingItem.product?.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {updatingItem.product?.category} · Current stock: <span className="font-semibold">{updatingItem.stockQuantity}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className={label}>Stock Quantity</label>
                <input type="number" value={updateData.stockQuantity}
                  onChange={(e) => setUpdateData({ ...updateData, stockQuantity: e.target.value })}
                  required min="0" className={input} />
              </div>
              <div>
                <label className={label}>Low Stock Threshold</label>
                <input type="number" value={updateData.lowStockThreshold}
                  onChange={(e) => setUpdateData({ ...updateData, lowStockThreshold: e.target.value })}
                  required min="0" className={input} />
              </div>
              <div>
                <label className={label}>Supplier</label>
                <input type="text" value={updateData.supplier}
                  onChange={(e) => setUpdateData({ ...updateData, supplier: e.target.value })}
                  placeholder="Enter supplier name" className={input} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={updateLoading}
                  className="flex-1 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {updateLoading ? 'Updating...' : 'Update Stock'}
                </button>
                <button type="button" onClick={() => setShowUpdateModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Adjust Stock Modal ────────────────────────────────── */}
      {showAdjustModal && adjustingItem && (
        <div className={modalBg}>
          <div className={modalBox}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-xl">
                  <SlidersHorizontal size={18} className="text-yellow-600" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Adjust Stock</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{adjustingItem.product?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAdjustModal(false)}
                className={`p-1 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Product preview */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className="bg-yellow-500 rounded-full p-2.5">
                <Package size={16} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{adjustingItem.product?.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {adjustingItem.product?.category} · Current stock: <span className="font-semibold">{adjustingItem.stockQuantity}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className={label}>Adjustment <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>(use negative to subtract)</span></label>
                <input type="number" value={adjustData.adjustment}
                  onChange={(e) => setAdjustData({ ...adjustData, adjustment: e.target.value })}
                  required placeholder="e.g. 20 or -5" className={input} />
              </div>
              <div>
                <label className={label}>Reason</label>
                <input type="text" value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Damaged goods, Restock" className={input} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={adjustLoading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {adjustLoading ? 'Adjusting...' : 'Adjust Stock'}
                </button>
                <button type="button" onClick={() => setShowAdjustModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryManagement;
