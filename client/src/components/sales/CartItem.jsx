import { X, Plus, Minus } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {item.name}
        </p>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          GH₵ {Number(item.price).toFixed(2)} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1.5 mx-3">
        <button
          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition duration-200 ${
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Minus size={10} />
        </button>
        <span className={`text-sm font-semibold w-6 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition duration-200 ${
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Plus size={10} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right mr-3">
        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          GH₵ {Number(item.subtotal).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item._id)}
        className="text-rose-400 hover:text-rose-500 transition duration-200 p-1 rounded-lg hover:bg-rose-500 hover:bg-opacity-10"
      >
        <X size={14} />
      </button>

    </div>
  );
};

export default CartItem;