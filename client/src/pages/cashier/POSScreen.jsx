import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, X, CreditCard, Smartphone, Banknote, LogOut, AlertTriangle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import useCart from '../../hooks/useCart';
import Cart from '../../components/sales/Cart';
import { getAllProducts, searchProducts, getProductByBarcode } from '../../services/productService';
import { createSale } from '../../services/salesService';
import { initiateMobileMoney, submitMobileMoneyOtp, verifyMobileMoneyPayment } from '../../services/paymentService';

const POSScreen = () => {
  const { token, user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { cartItems, discount, tax, clearCart, addToCart, getGrandTotal } = useCart();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileNetwork, setMobileNetwork] = useState('mtn');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null); // { type: 'success'|'error', message }
  const barcodeBuffer = useRef('');
  const barcodeTimer = useRef(null);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [momoReference, setMomoReference] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  // Barcode scanner listener — scanners fire keystrokes very fast then send Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        const barcode = barcodeBuffer.current.trim();
        barcodeBuffer.current = '';
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        if (barcode.length >= 3) handleBarcodeScan(barcode);
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        // Clear buffer if no new character arrives within 100ms (human typing is slower)
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [token, cartItems]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(token);
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      const product = await getProductByBarcode(barcode, token);
      if (product.quantity === 0) {
        setScanFeedback({ type: 'error', message: `"${product.name}" is out of stock` });
      } else {
        addToCart(product);
        setScanFeedback({ type: 'success', message: `"${product.name}" added to cart` });
      }
    } catch {
      setScanFeedback({ type: 'error', message: `No product found for barcode: ${barcode}` });
    }
    setTimeout(() => setScanFeedback(null), 3000);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await searchProducts(query, token);
        setProducts(data);
      } catch (err) {
        setError('Search failed');
      }
    } else {
      fetchProducts();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Cart is empty!');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setAmountPaid('');
    setPaymentMethod('cash');
    setMobilePhone('');
    setMobileNetwork('mtn');
    setAwaitingConfirmation(false);
    setAwaitingOtp(false);
    setOtp('');
    setMomoReference('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const saleData = {
        items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity })),
        discount, tax, paymentMethod, amountPaid: Number(amountPaid)
      };
      const result = await createSale(saleData, token);
      clearCart();
      setShowPaymentModal(false);
      navigate('/cashier/receipt', { state: { sale: result.sale } });
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed. Try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const startPolling = (reference) => {
    pollRef.current = setInterval(async () => {
      try {
        const { status } = await verifyMobileMoneyPayment(reference, token);
        if (status === 'success') {
          clearInterval(pollRef.current);
          const saleData = {
            items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity })),
            discount, tax, paymentMethod: 'mobile_money', amountPaid: grandTotal,
          };
          const result = await createSale(saleData, token);
          clearCart();
          setShowPaymentModal(false);
          navigate('/cashier/receipt', { state: { sale: result.sale } });
        } else if (status === 'failed' || status === 'abandoned' || status === 'reversed') {
          clearInterval(pollRef.current);
          setAwaitingConfirmation(false);
          setAwaitingOtp(false);
          setError(
            status === 'abandoned'
              ? 'Customer did not complete the payment. Please try again.'
              : 'Payment was declined. Please try again.'
          );
          setTimeout(() => setError(''), 5000);
        }
      } catch {
        // keep polling on transient network errors
      }
    }, 3000);
  };

  const handleMobileMoneySubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { reference, status } = await initiateMobileMoney(
        { phone: mobilePhone, network: mobileNetwork, amount: grandTotal },
        token
      );
      setMomoReference(reference);
      if (status === 'send_otp') {
        setAwaitingOtp(true);
      } else {
        setAwaitingConfirmation(true);
        startPolling(reference);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send payment request. Try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setSubmittingOtp(true);
    try {
      const { status } = await submitMobileMoneyOtp({ otp, reference: momoReference }, token);
      if (status === 'success') {
        // already done, create sale
        const saleData = {
          items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity })),
          discount, tax, paymentMethod: 'mobile_money', amountPaid: grandTotal,
        };
        const result = await createSale(saleData, token);
        clearCart();
        setShowPaymentModal(false);
        navigate('/cashier/receipt', { state: { sale: result.sale } });
      } else {
        // OTP accepted, now wait for final confirmation
        setAwaitingOtp(false);
        setAwaitingConfirmation(true);
        startPolling(momoReference);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmittingOtp(false);
    }
  };

  const handleCancelMobilePayment = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setAwaitingConfirmation(false);
    setAwaitingOtp(false);
    setOtp('');
    setMomoReference('');
  };

  const handleClosePaymentModal = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setAwaitingConfirmation(false);
    setAwaitingOtp(false);
    setOtp('');
    setMomoReference('');
    setShowPaymentModal(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const grandTotal = getGrandTotal();
  const change = Number(amountPaid) - grandTotal;

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
  ];

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>

      {/* Header */}
      <div className="bg-white text-[#E60000] border-b border-[#FFD6D6] px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <ShoppingCart size={22} />
          <div>
            <h1 className="brand-name text-xl">SwiftSale</h1>
            <p className="text-xs text-gray-500">{user?.name} — Cashier</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-GH', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </p>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] text-sm px-3 py-1.5 rounded-lg transition duration-200"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#FFF0F0] border-b border-[#FF3333] text-[#CC0000] px-6 py-2 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Barcode Scan Feedback */}
      {scanFeedback && (
        <div className={`px-6 py-2 text-sm font-medium border-b flex items-center gap-2 ${
          scanFeedback.type === 'success'
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-[#FFF0F0] border-[#FF3333] text-[#CC0000]'
        }`}>
          {scanFeedback.type === 'success' ? '✅' : '❌'} {scanFeedback.message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">

        {/* Left — Product Search & Grid */}
        <div className="flex-1 flex flex-col">

          {/* Search Bar */}
          <div className="mb-4 relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search products by name, category or barcode..."
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 shadow ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {products.map(product => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className={`rounded-xl p-4 text-left transition duration-200 shadow relative overflow-hidden ${
                      product.quantity === 0
                        ? `cursor-not-allowed ${isDark ? 'bg-slate-800' : 'bg-white'}`
                        : `${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-[#FFF5F5]'} hover:shadow-md`
                    }`}
                  >
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10">
                        <span className="bg-white text-[#E60000] border border-[#FFD6D6] text-xs font-bold px-2 py-1 rounded-md">Out of Stock</span>
                      </div>
                    )}
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {product.name}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {product.category}
                    </p>
                    <p className="text-[#FF0000] font-bold mt-2 text-sm">
                      GH₵ {Number(product.price).toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${
                      product.quantity === 0 ? 'text-[#FF0000]' : product.quantity <= 10 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {product.quantity === 0 ? 'Out of stock' : `Stock: ${product.quantity}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Cart */}
        <div className="w-80">
          <Cart onCheckout={handleCheckout} />
        </div>

      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFF0F0] p-2 rounded-xl">
                  <CreditCard size={18} className="text-[#E60000]" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Payment</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
                </div>
              </div>
              <button onClick={handleClosePaymentModal}
                className={`p-1 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Grand Total */}
            <div className={`rounded-xl p-4 mb-4 text-center ${isDark ? 'bg-slate-700' : 'bg-[#FFF5F5]'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Grand Total</p>
              <p className="text-3xl font-bold text-[#FF0000] mt-1">
                GH₵ {grandTotal.toFixed(2)}
              </p>
            </div>

            {/* Error inside modal */}
            {error && (
              <div className="mb-4 bg-[#FFF0F0] border border-[#FFD6D6] text-[#CC0000] text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {awaitingOtp ? (
              /* ── OTP entry screen ── */
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center py-2">
                  <div className="bg-[#FFF0F0] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={22} className="text-[#E60000]" />
                  </div>
                  <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Enter OTP
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    A code was sent to <span className="font-medium text-[#FF0000]">{mobilePhone}</span>. Enter it below to confirm payment.
                  </p>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter OTP code"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-center tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingOtp}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-3 rounded-xl font-medium text-sm transition duration-200 disabled:opacity-50"
                  >
                    {submittingOtp ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    {submittingOtp ? 'Verifying...' : 'Confirm Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelMobilePayment}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition duration-200 ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : awaitingConfirmation ? (
              /* ── Waiting for customer to approve on their phone ── */
              <div className="space-y-5 text-center">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative w-16 h-16">
                    <div className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-slate-600' : 'border-[#FFF0F0]'}`}></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#FF0000] border-t-transparent animate-spin"></div>
                    <Smartphone size={24} className="absolute inset-0 m-auto text-[#FF0000]" />
                  </div>
                  <div>
                    <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Waiting for customer...
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Prompt sent to <span className="font-medium text-[#FF0000]">{mobilePhone}</span>
                    </p>
                  </div>
                  <p className={`text-xs px-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Ask the customer to check their phone and approve the payment of{' '}
                    <span className="font-semibold text-[#FF0000]">GH₵ {grandTotal.toFixed(2)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelMobilePayment}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition duration-200 ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel Payment
                </button>
              </div>
            ) : (
              <form
                onSubmit={paymentMethod === 'mobile_money' ? handleMobileMoneySubmit : handlePaymentSubmit}
                className="space-y-4"
              >
                {/* Payment Method selector */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-medium transition duration-200 ${
                            paymentMethod === method.id
                              ? 'border-[#E60000] bg-white text-[#E60000] border border-[#FFD6D6]'
                              : `${isDark ? 'border-slate-600 text-slate-300 hover:border-[#FF0000]' : 'border-gray-200 text-gray-600 hover:border-[#FF3333]'}`
                          }`}
                        >
                          <Icon size={20} />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paymentMethod === 'mobile_money' ? (
                  /* ── Mobile Money fields ── */
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Mobile Network
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'mtn', label: 'MTN' },
                          { id: 'vod', label: 'Vodafone' },
                          { id: 'tgo', label: 'AirtelTigo' },
                        ].map(net => (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setMobileNetwork(net.id)}
                            className={`py-2 rounded-xl border-2 text-xs font-medium transition duration-200 ${
                              mobileNetwork === net.id
                                ? 'border-[#E60000] bg-white text-[#E60000] border border-[#FFD6D6]'
                                : `${isDark ? 'border-slate-600 text-slate-300 hover:border-[#FF0000]' : 'border-gray-200 text-gray-600 hover:border-[#FF3333]'}`
                            }`}
                          >
                            {net.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Customer Phone Number
                      </label>
                      <input
                        type="tel"
                        value={mobilePhone}
                        onChange={(e) => setMobilePhone(e.target.value)}
                        required
                        placeholder="e.g. 0241234567"
                        pattern="[0-9]{10}"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
                          isDark
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  /* ── Cash / Card fields ── */
                  <>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Amount Paid (GH₵)
                      </label>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        required
                        min={grandTotal}
                        step="0.01"
                        placeholder="0.00"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] transition duration-200 ${
                          isDark
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      />
                    </div>
                    {amountPaid && Number(amountPaid) >= grandTotal && (
                      <div className={`rounded-xl p-3 flex justify-between items-center ${
                        isDark ? 'bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30' : 'bg-green-50 border border-green-200'
                      }`}>
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Change</span>
                        <span className="text-lg font-bold text-green-500">GH₵ {change.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-3 rounded-xl font-medium text-sm transition duration-200 disabled:opacity-50"
                  >
                    {processing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : paymentMethod === 'mobile_money' ? (
                      <Smartphone size={16} />
                    ) : (
                      <CreditCard size={16} />
                    )}
                    {processing
                      ? 'Processing...'
                      : paymentMethod === 'mobile_money'
                      ? 'Send to Customer'
                      : 'Complete Sale'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClosePaymentModal}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition duration-200 ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF0000] rounded-full p-2">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Confirm Logout
                </h2>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Are you sure you want to log out? Your current cart will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-2.5 rounded-xl text-sm font-medium transition duration-200"
              >
                <LogOut size={16} />
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default POSScreen;
