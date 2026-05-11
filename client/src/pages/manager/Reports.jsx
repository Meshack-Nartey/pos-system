import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Package, RefreshCw, BarChart2, Calendar } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import {
  getSummary, getDailySales, getWeeklySales, getProductPerformance
} from '../../services/reportService';
import SalesChart from '../../components/reports/SalesChart';
import ReportTable from '../../components/reports/ReportTable';

const Reports = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [summary, setSummary] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [weeklySales, setWeeklySales] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const card = `rounded-xl shadow p-5 ${isDark ? 'bg-slate-800' : 'bg-white'}`;

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const [summaryData, dailyData, weeklyData, productData] =
        await Promise.allSettled([
          getSummary(token), getDailySales(token),
          getWeeklySales(token), getProductPerformance(token)
        ]);
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
      if (dailyData.status === 'fulfilled') setDailySales(dailyData.value);
      if (weeklyData.status === 'fulfilled') setWeeklySales(weeklyData.value);
      if (productData.status === 'fulfilled') setProductPerformance(productData.value);
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading reports...</p>
        </div>
      </div>
    );
  }

  const summaryItems = summary ? [
    { label: 'Total Revenue',      value: `GH₵ ${Number(summary.totalRevenue).toFixed(2)}`, icon: TrendingUp,  color: 'bg-[#FF0000]' },
    { label: 'Total Transactions', value: summary.totalTransactions,                         icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Total Products',     value: summary.totalProducts,                             icon: Package,     color: 'bg-yellow-500' },
  ] : [];

  const dailyItems = dailySales ? [
    { label: "Today's Revenue",      value: `GH₵ ${Number(dailySales.totalRevenue).toFixed(2)}`, icon: TrendingUp,   color: 'text-[#FF0000]',   bg: isDark ? 'bg-[#FF0000]/10' : 'bg-[#FFF5F5]' },
    { label: "Today's Transactions", value: dailySales.totalTransactions,                         icon: ShoppingCart, color: 'text-green-500',  bg: isDark ? 'bg-green-500/10' : 'bg-green-50' },
    { label: 'Items Sold Today',     value: dailySales.totalItemsSold,                            icon: Package,      color: 'text-[#FF0000]', bg: isDark ? 'bg-[#FF0000]/10' : 'bg-[#FFF5F5]' },
  ] : [];

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#E60000]'}`}>Reports & Analytics</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Business performance overview</p>
        </div>
        <button
          onClick={fetchReports}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="bg-[#FFF0F0] border border-[#FF3333] text-[#CC0000] px-4 py-3 rounded-lg mb-4 text-sm">⚠️ {error}</div>}

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Overall Summary</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {summaryItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={card}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                    <div className={`${item.color} p-2 rounded-lg`}><Icon size={14} className="text-white" /></div>
                  </div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.value}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Today's Stats */}
      {dailySales && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Today's Performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {dailyItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`${card} flex items-center gap-4`}>
                  <div className={`${item.bg} p-3 rounded-xl`}><Icon size={22} className={item.color} /></div>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Weekly Chart */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Weekly Sales Trend</p>
      </div>
      <div className={`${card} mb-6`}>
        <SalesChart data={weeklySales} />
      </div>

      {/* Product Performance */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Performance Breakdown</p>
      </div>
      <div className={card}>
        <ReportTable
          title="Product Performance"
          headers={['#', 'Product', 'Qty Sold', 'Revenue']}
          rows={productPerformance.map((p, i) => [
            i + 1,
            p.productName,
            p.totalQuantitySold,
            `GH₵ ${Number(p.totalRevenue).toFixed(2)}`
          ])}
          emptyMessage="No product sales data available."
        />
      </div>

    </div>
  );
};

export default Reports;
