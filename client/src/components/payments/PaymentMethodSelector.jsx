const PaymentMethodSelector = ({ selected, onChange }) => {
  const methods = [
    {
      id: 'cash',
      label: 'Cash',
      emoji: '💵',
      description: 'Physical cash payment'
    },
    {
      id: 'mobile_money',
      label: 'Mobile Money',
      emoji: '📱',
      description: 'MTN, Vodafone, AirtelTigo'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {methods.map(method => (
        <button
          key={method.id}
          type="button"
          onClick={() => onChange(method.id)}
          className={`p-4 rounded-lg border-2 text-center transition duration-200 ${
            selected === method.id
              ? 'border-rose-800 bg-rose-50'
              : 'border-gray-200 bg-white hover:border-red-300'
          }`}
        >
          <p className="text-2xl mb-1">{method.emoji}</p>
          <p className={`text-sm font-semibold ${
            selected === method.id ? 'text-rose-800' : 'text-gray-700'
          }`}>
            {method.label}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {method.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;