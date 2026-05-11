import { Pencil, Trash2, Star, History } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const CustomerTable = ({ customers, onEdit, onDelete, onUpdatePoints, onHistory }) => {
  const { isDark } = useTheme();

  const th = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider`;
  const td = `px-4 py-3 text-sm`;

  if (customers.length === 0) {
    return (
      <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        No customers found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className={isDark ? 'bg-slate-700' : 'bg-[#E60000]'}>
          <tr>
            {['Name', 'Phone', 'Email', 'Address', 'Loyalty Points', 'Actions'].map(h => (
              <th key={h} className={`${th} ${isDark ? 'text-slate-300' : 'text-white'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr
              key={customer._id}
              className={`transition duration-150 ${
                isDark
                  ? index % 2 === 0 ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-900 hover:bg-slate-700'
                  : index % 2 === 0 ? 'bg-white hover:bg-[#FFF5F5]' : 'bg-gray-50 hover:bg-[#FFF5F5]'
              }`}
            >
              <td className={`${td} font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {customer.name}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {customer.phone}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {customer.email || '—'}
              </td>
              <td className={`${td} ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {customer.address || '—'}
              </td>
              <td className={`${td}`}>
                <span className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold w-fit">
                  <Star size={10} />
                  {customer.loyaltyPoints} pts
                </span>
              </td>
              <td className={`${td}`}>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(customer)}
                    className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  {onUpdatePoints && (
                    <button
                      onClick={() => onUpdatePoints(customer)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                    >
                      <Star size={12} />
                      Points
                    </button>
                  )}
                  {onHistory && (
                    <button
                      onClick={() => onHistory(customer)}
                      className="flex items-center gap-1 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                    >
                      <History size={12} />
                      History
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(customer)}
                      className="flex items-center gap-1 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
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

export default CustomerTable;