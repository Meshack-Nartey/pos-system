import { Pencil, Trash2 } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const ProductTable = ({ products, onEdit, onDelete }) => {
  const { isDark } = useTheme();

  const th = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider`;
  const td = `px-4 py-3 text-sm`;

  if (products.length === 0) {
    return (
      <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className={isDark ? 'bg-slate-700' : 'bg-rose-600'}>
          <tr>
            {['Name', 'Category', 'Price (GH₵)', 'Quantity', 'Barcode', 'Supplier', 'Actions'].map(h => (
              <th key={h} className={`${th} ${isDark ? 'text-slate-300' : 'text-white'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product._id}
              className={`transition duration-150 ${
                isDark
                  ? index % 2 === 0 ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 hover:bg-slate-700'
                  : index % 2 === 0 ? 'bg-white hover:bg-rose-50' : 'bg-gray-50 hover:bg-rose-50'
              }`}
            >
              <td className={`${td} font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {product.name}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {product.category}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {Number(product.price).toFixed(2)}
              </td>
              <td className={`${td}`}>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  product.quantity <= 10
                    ? 'bg-rose-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {product.quantity}
                </span>
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {product.barcode || '—'}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {product.supplier || '—'}
              </td>
              <td className={`${td}`}>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product)}
                      className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                    >
                      <Trash2 size={12} />
                      Delete
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

export default ProductTable;