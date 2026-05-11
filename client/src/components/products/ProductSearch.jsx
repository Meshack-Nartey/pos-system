import { useState } from 'react';

const ProductSearch = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, category or barcode..."
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF0000]"
      />
      <button
        type="submit"
        className="bg-white text-[#E60000] border border-[#FFD6D6] px-4 py-2 rounded text-sm font-medium hover:bg-[#CC0000] transition duration-200"
      >
        Search
      </button>
      <button
        type="button"
        onClick={handleClear}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition duration-200"
      >
        Clear
      </button>
    </form>
  );
};

export default ProductSearch;