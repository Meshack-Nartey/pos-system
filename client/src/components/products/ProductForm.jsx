import { useState, useEffect } from 'react';
import useTheme from '../../hooks/useTheme';

const ProductForm = ({ onSubmit, initialData, onCancel }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '', category: '', price: '',
    quantity: '', barcode: '', supplier: '', description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price || '',
        quantity: initialData.quantity || '',
        barcode: initialData.barcode || '',
        supplier: initialData.supplier || '',
        description: initialData.description || ''
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

  const input = `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition duration-200 ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-800'
  }`;

  const label = `block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  const fields = [
    { name: 'name', label: 'Product Name *', type: 'text', placeholder: 'Enter product name', required: true },
    { name: 'category', label: 'Category *', type: 'text', placeholder: 'e.g. Drinks, Food', required: true },
    { name: 'price', label: 'Price (GH₵) *', type: 'number', placeholder: '0.00', required: true },
    { name: 'quantity', label: 'Quantity *', type: 'number', placeholder: '0', required: true },
    { name: 'barcode', label: 'Barcode', type: 'text', placeholder: 'Enter barcode', required: false },
    { name: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Enter supplier name', required: false },
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
              min={field.type === 'number' ? '0' : undefined}
              step={field.name === 'price' ? '0.01' : undefined}
              className={input}
            />
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <label className={label}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={3}
          className={input}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition duration-200 shadow"
        >
          {initialData ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition duration-200 ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;