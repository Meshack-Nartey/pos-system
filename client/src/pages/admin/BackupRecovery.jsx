import { useState } from 'react';
import { Download, Package, Users, ShoppingCart, UserCog, Info } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import axios from 'axios';

const BackupRecovery = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const card = `rounded-xl shadow p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`;

  const handleExportData = async (collection) => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const endpoints = {
        products: 'http://localhost:5000/api/products',
        customers: 'http://localhost:5000/api/customers',
        sales: 'http://localhost:5000/api/sales',
        users: 'http://localhost:5000/api/users'
      };

      const res = await axios.get(endpoints[collection], {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${collection}_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMessage(`${collection} data exported successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`Failed to export ${collection} data`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const backupItems = [
    {
      collection: 'products',
      label: 'Products',
      description: 'Export all product data including prices and stock levels',
      icon: Package,
      color: 'bg-rose-500'
    },
    {
      collection: 'customers',
      label: 'Customers',
      description: 'Export all customer records including loyalty points',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      collection: 'sales',
      label: 'Sales',
      description: 'Export all sales transactions and receipts',
      icon: ShoppingCart,
      color: 'bg-yellow-500'
    },
    {
      collection: 'users',
      label: 'Users',
      description: 'Export all system user accounts and roles',
      icon: UserCog,
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-rose-600'}`}>
          Backup & Recovery
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Export your data as JSON files for backup and recovery
        </p>
      </div>

      {message && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 p-3 rounded-lg mb-4 text-sm">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-500 bg-opacity-10 border border-rose-500 text-rose-500 p-3 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Info Box */}
     <div className={`rounded-xl p-4 mb-6 flex gap-3 ${
  isDark
    ? 'bg-rose-600 border border-rose-500'
    : 'bg-rose-50 border border-rose-200'
}`}>
  <Info size={18} className={`shrink-0 mt-0.5 ${isDark ? 'text-white' : 'text-rose-500'}`} />
  <div>
    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-rose-700'}`}>
      How Backup Works
    </p>
    <p className={`text-xs ${isDark ? 'text-rose-100' : 'text-rose-600'}`}>
      Clicking any export button below will download a JSON file of that collection
      to your computer. Store these files in a safe location. You can use them to
      restore data if needed.
    </p>
  </div>
</div>
      {/* Backup Cards */}
      <div className="grid grid-cols-2 gap-4">
        {backupItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.collection} className={card}>
              <div className="flex items-start gap-4">
                <div className={`${item.color} p-3 rounded-xl`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {item.label} Backup
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleExportData(item.collection)}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50"
              >
                <Download size={16} />
                Export {item.label}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default BackupRecovery;
