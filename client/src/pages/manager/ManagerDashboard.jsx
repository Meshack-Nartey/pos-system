import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Warehouse, Users, BarChart3,
  TrendingUp, ShoppingCart, DollarSign, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { getSummary, getDailySales, getWeeklySales } from '../../services/reportService';

const ManagerDashboard = () => {
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [weeklySales, setWeeklySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryData, dailyData, weeklyData] = await Promise.allSettled([
        getSummary(token),
        getDailySales(token),
        getWeeklySales(token)
      ]);
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
      if (dailyData.status === 'fulfilled') setDailySales(dailyData.value);
      if (weeklyData.status === 'fulfilled') setWeeklySales(weeklyData.value.map(d => ({
        day: new Date(d._id).toLocaleDateString('en-GH', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: Number(d.totalRevenue.toFixed(2)),
        transactions: d.totalTransactions
      })));
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const card = `rounded-xl shadow p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`;
  const label = `text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`;
  const value = `text-2xl font-bold ${isDark ? 'text-white' : 'text-[#E60000]'}`;
  const sub = `text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`;

  const summaryCards = summary ? [
    { label: 'Total Revenue', value: `GH₵ ${Number(summary.totalRevenue).toFixed(2)}`, sub: 'All time', icon: DollarSign, color: 'bg-[#FF0000]' },
    { label: 'Total Transactions', value: summary.totalTransactions, sub: 'All time', icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Total Products', value: summary.totalProducts, sub: 'In system', icon: Package, color: 'bg-yellow-500' },
  ] : [];

  const dailyCards = dailySales ? [
    { label: "Today's Revenue", value: `GH₵ ${Number(dailySales.totalRevenue).toFixed(2)}`, icon: TrendingUp, color: 'text-green-500' },
    { label: "Today's Transactions", value: dailySales.totalTransactions, icon: ShoppingCart, color: 'text-[#FF0000]' },
    { label: 'Items Sold Today', value: dailySales.totalItemsSold, icon: Package, color: 'text-yellow-500' },
  ] : [];

  const quickLinks = [
    { label: 'Manage Products', path: '/manager/products', icon: Package, color: 'bg-[#FF0000] hover:bg-[#E60000]' },
    { label: 'Manage Inventory', path: '/manager/inventory', icon: Warehouse, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Manage Customers', path: '/manager/customers', icon: Users, color: 'bg-yellow-500 hover:bg-yellow-600' },
    { label: 'View Reports', path: '/manager/reports', icon: BarChart3, color: 'bg-[#FF0000] hover:bg-[#E60000]' },
  ];

  return (
    <div className="p-6">

      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#E60000]'}`}>
          Welcome back, {user?.name}! 
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {new Date().toLocaleDateString('en-GH', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {summaryCards.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={card}>
                <div className="flex items-center justify-between mb-3">
                  <p className={label}>{item.label}</p>
                  <div className={`${item.color} p-2 rounded-lg`}>
                    <Icon size={16} className="text-white" />
                  </div>
                </div>
                <p className={value}>{item.value}</p>
                <p className={sub}>{item.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Today's Stats */}
      {dailySales && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {dailyCards.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`${card} border ${isDark ? 'border-slate-700' : 'border-green-100'}`}>
                <div className="flex items-center gap-3">
                  <Icon size={20} className={item.color} />
                  <div>
                    <p className={label}>{item.label}</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sales Charts */}
      {weeklySales.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`${card} p-5`}>
            <p className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Revenue — Last 7 Days
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={weeklySales}>
                <defs>
                  <linearGradient id="revenueGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v) => [`GH₵ ${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} fill="url(#revenueGradM)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={`${card} p-5`}>
            <p className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Transactions — Last 7 Days
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#6b7280' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v) => [v, 'Transactions']}
                />
                <Bar dataKey="transactions" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`${link.color} text-white rounded-xl p-4 text-left transition duration-200 shadow flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="text-sm font-semibold">{link.label}</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition duration-200" />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;
