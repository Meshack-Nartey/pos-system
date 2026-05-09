import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useTheme from '../../hooks/useTheme';

const SalesChart = ({ data }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
        No sales data available for this period.
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: item._id,
    Revenue: Number(item.totalRevenue.toFixed(2)),
    Transactions: item.totalTransactions
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f0f4f8'} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#6B7280' }}
            axisLine={{ stroke: isDark ? '#334155' : '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `GH₵${v}`}
          />
          <YAxis
            yAxisId="transactions"
            orientation="right"
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              name === 'Revenue' ? `GH₵ ${value}` : value, name
            ]}
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#fff',
              border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
              borderRadius: '10px',
              fontSize: '12px',
              color: isDark ? '#f1f5f9' : '#111827',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px', color: isDark ? '#94a3b8' : '#6B7280' }}
          />
          <Bar yAxisId="revenue" dataKey="Revenue" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={48} />
          <Line yAxisId="transactions" type="monotone" dataKey="Transactions" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
