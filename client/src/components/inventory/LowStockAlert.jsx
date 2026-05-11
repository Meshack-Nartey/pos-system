import { AlertTriangle, AlertCircle } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const LowStockAlert = ({ items }) => {
  const { isDark } = useTheme();

  if (items.length === 0) return null;

  const outOfStock = items.filter(i => i.stockQuantity === 0);
  const lowStock   = items.filter(i => i.stockQuantity > 0);

  return (
    <div className="space-y-3 mb-6">

      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <div className={`border rounded-xl p-4 ${isDark ? 'bg-[#E60000] bg-opacity-40 border-[#CC0000]' : 'bg-[#FFF5F5] border-[#FFE5E5]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-[#FF0000]" />
            <h3 className="text-[#FF0000] font-semibold text-sm">
              Out of Stock — {outOfStock.length} item{outOfStock.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="space-y-2">
            {outOfStock.map((item) => (
              <div key={item._id} className={`flex justify-between items-center rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800' : 'bg-white border border-[#FFF0F0]'}`}>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.product?.name}</span>
                  <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.product?.category}</span>
                </div>
                <span className="text-xs bg-white text-[#E60000] border border-[#FFD6D6] px-2 py-0.5 rounded-full font-semibold">0 left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <div className={`border rounded-xl p-4 ${isDark ? 'bg-yellow-950 bg-opacity-30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-500" />
            <h3 className="text-yellow-600 font-semibold text-sm">
              Low Stock — {lowStock.length} item{lowStock.length > 1 ? 's'  : ''} running low
            </h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item._id} className={`flex justify-between items-center rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800' : 'bg-white border border-yellow-100'}`}>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.product?.name}</span>
                  <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.product?.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-semibold">{item.stockQuantity} left</span>
                  <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>(min: {item.lowStockThreshold})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LowStockAlert;
