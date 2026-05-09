import useTheme from '../../hooks/useTheme';

const DiscountInput = ({ discount, tax, onDiscountChange, onTaxChange }) => {
  const { isDark } = useTheme();

  const input = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-200 text-gray-800'
  }`;

  const label = `block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`;

  return (
    <div className={`border-t pt-3 mt-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={label}>Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
            min="0" max="100" placeholder="0"
            className={input}
          />
        </div>
        <div className="flex-1">
          <label className={label}>Tax (%)</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => onTaxChange(Number(e.target.value))}
            min="0" max="100" placeholder="0"
            className={input}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountInput;