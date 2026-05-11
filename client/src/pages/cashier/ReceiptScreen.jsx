import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Plus, ShoppingBag, Receipt, BarChart2, Package, Users } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const ReceiptScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const sale = state?.sale;

  if (!sale) {
    navigate('/cashier/pos');
    return null;
  }

  const handleNewSale = () => navigate('/cashier/pos');
  const handlePrint = () => window.print();

  const getPaymentLabel = (method) => {
    if (method === 'mobile_money') return 'Mobile Money';
    return 'Cash';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden print:bg-white print:block print:p-0 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-[#FF0000] to-slate-900'
        : 'bg-gradient-to-br from-white via-[#FFF8F8] to-[#FFF0F0]'
    }`}>

      {/* Decorative background icons — hidden when printing */}
      <div className="absolute inset-0 pointer-events-none print:hidden">
        <ShoppingBag size={120} className="absolute top-10 left-10 opacity-[0.05] text-white rotate-[-15deg]" />
        <Receipt    size={100} className="absolute top-1/4 right-16 opacity-[0.05] text-white rotate-[10deg]" />
        <BarChart2  size={90}  className="absolute bottom-20 left-20 opacity-[0.05] text-white rotate-[5deg]" />
        <Package    size={110} className="absolute bottom-10 right-10 opacity-[0.05] text-white rotate-[-10deg]" />
        <Users      size={80}  className="absolute top-1/2 left-1/3 opacity-[0.04] text-white rotate-[8deg]" />
        {/* Glowing blobs */}
        <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-[#FF0000]' : 'bg-[#FFF5F5]'}`} />
        <div className={`absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-[#FF0000]' : 'bg-[#FFF0F0]'}`} />
      </div>

      <div id="receipt-card" className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

        {/* Success Header */}
        <div className="bg-white border-b border-[#FFD6D6] p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-[#FFF5F5] rounded-full p-3">
              <ShoppingBag size={32} className="text-[#E60000]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#E60000]">Sale Complete!</h1>
          <p className="text-gray-500 text-sm mt-1">Official Receipt</p>
        </div>

        {/* Receipt Body */}
        <div className={`p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

          {/* Store Info */}
          <div className={`text-center pb-4 mb-4 border-b border-dashed ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShoppingBag size={18} className="text-[#FF0000]" />
              <h2 className={`brand-name text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>SwiftSale</h2>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {new Date(sale.createdAt).toLocaleString('en-GH', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          {/* Transaction Info */}
          <div className={`rounded-xl p-3 mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
            {[
              { label: 'Transaction ID', value: sale._id.slice(-8).toUpperCase() },
              { label: 'Cashier', value: sale.cashier?.name },
              { label: 'Payment Method', value: getPaymentLabel(sale.paymentMethod) },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</span>
                <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className={`pb-4 mb-4 border-b border-dashed ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Items Purchased
            </p>
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {item.quantity} x GH₵ {Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  GH₵ {Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className={`pb-4 mb-4 border-b border-dashed space-y-2 ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Subtotal</span>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                GH₵ {Number(sale.totalAmount).toFixed(2)}
              </span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-green-500">Discount</span>
                <span className="text-sm text-green-500">- GH₵ {Number(sale.discount).toFixed(2)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Tax</span>
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  + GH₵ {Number(sale.tax).toFixed(2)}
                </span>
              </div>
            )}
            <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
              <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Grand Total</span>
              <span className="text-base font-bold text-[#FF0000]">
                GH₵ {Number(sale.grandTotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Amount Paid</span>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                GH₵ {Number(sale.amountPaid).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-green-500">Change</span>
              <span className="text-sm font-semibold text-green-500">
                GH₵ {Number(sale.change).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mb-4">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              Thank you for your purchase!
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              Please come again 😊
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Printer size={16} />
              Print Receipt
            </button>
            <button
              onClick={handleNewSale}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-2.5 rounded-xl text-sm font-medium transition duration-200"
            >
              <Plus size={16} />
              New Sale
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};


export default ReceiptScreen;
