import { Pencil, SlidersHorizontal } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const StockTable = ({ inventory, onUpdate, onAdjust }) => {
  const { isDark } = useTheme();

  const th = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider`;
  const td = `px-4 py-3 text-sm`;

  const getStockBadge = (item) => {
    if (item.stockQuantity === 0)
      return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-white text-[#E60000] border border-[#FFD6D6]">Out of Stock</span>;
    if (item.stockQuantity <= item.lowStockThreshold)
      return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-500 text-white">Low Stock</span>;
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white">In Stock</span>;
  };

  const getQtyBadge = (item) => {
    if (item.stockQuantity === 0)
      return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-white text-[#E60000] border border-[#FFD6D6]">0</span>;
    if (item.stockQuantity <= item.lowStockThreshold)
      return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-500 text-white">{item.stockQuantity}</span>;
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white">{item.stockQuantity}</span>;
  };

  if (inventory.length === 0) {
    return (
      <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        No inventory records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className={isDark ? 'bg-slate-700' : 'bg-white border-y border-[#FFD6D6]'}>
          <tr>
            {['Product', 'Category', 'Stock', 'Threshold', 'Supplier', 'Last Restocked', 'Status', 'Actions'].map(h => (
              <th key={h} className={`${th} ${isDark ? 'text-slate-300' : 'text-[#E60000]'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, index) => (
            <tr
              key={item._id}
              className={`transition duration-150 ${
                isDark
                  ? index % 2 === 0 ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 hover:bg-slate-700'
                  : index % 2 === 0 ? 'bg-white hover:bg-[#FFF5F5]' : 'bg-gray-50 hover:bg-[#FFF5F5]'
              }`}
            >
              <td className={`${td} font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.product?.name}</td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{item.product?.category}</td>
              <td className={td}>{getQtyBadge(item)}</td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{item.lowStockThreshold}</td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{item.supplier || '—'}</td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {new Date(item.lastRestocked).toLocaleDateString()}
              </td>
              <td className={td}>{getStockBadge(item)}</td>
              <td className={td}>
                <div className="flex gap-2">
                  {onUpdate && (
                    <button onClick={() => onUpdate(item)}
                      className="flex items-center gap-1 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200">
                      <Pencil size={12} /> Update
                    </button>
                  )}
                  {onAdjust && (
                    <button onClick={() => onAdjust(item)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200">
                      <SlidersHorizontal size={12} /> Adjust
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
