import { useState, useEffect } from 'react';
import useTheme from '../../hooks/useTheme';

const CustomerForm = ({ onSubmit, initialData, onCancel }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const input = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-800'
  }`;

  const label = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  const fields = [
    { name: 'name', label: 'Full Name *', type: 'text', placeholder: 'Enter full name', required: true },
    { name: 'phone', label: 'Phone Number *', type: 'text', placeholder: 'e.g. 0244123456', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter email address', required: false },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Enter address', required: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className={label}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder}
              className={input}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-6 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
        >
          {initialData ? 'Update Customer' : 'Register Customer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition duration-200 ${
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;