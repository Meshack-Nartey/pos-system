import { ShoppingCart, Trash2 } from 'lucide-react';
import useCart from '../../hooks/useCart';
import useTheme from '../../hooks/useTheme';
import CartItem from './CartItem';
import DiscountInput from './DiscountInput';

const Cart = ({ onCheckout }) => {
  const { cartItems, discount, tax, setDiscount, setTax, removeFromCart, updateQuantity, clearCart, getTotal, getGrandTotal } = useCart();
  const { isDark } = useTheme();

  const total = getTotal();
  const discountAmount = (total * discount) / 100;
  const taxAmount = (total * tax) / 100;
  const grandTotal = getGrandTotal();

  return (
    <div className={`rounded-xl shadow h-full flex flex-col ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

      {/* Cart Header */}
      <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-rose-500" />
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Cart ({cartItems.length})
          </h2>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-500 text-xs transition duration-200"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Cart is empty
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Click products to add them
            </p>
          </div>
        ) : (
          cartItems.map(item => (
            <CartItem
              key={item._id}
              item={item}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          ))
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>

          <DiscountInput
            discount={discount}
            tax={tax}
            onDiscountChange={setDiscount}
            onTaxChange={setTax}
          />

          {/* Totals */}
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Subtotal</span>
              <span className={isDark ? 'text-white' : 'text-gray-700'}>GH₵ {total.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Discount ({discount}%)</span>
                <span className="text-green-500">- GH₵ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Tax ({tax}%)</span>
                <span className={isDark ? 'text-white' : 'text-gray-700'}>+ GH₵ {taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between text-base font-bold pt-2 border-t ${isDark ? 'border-slate-700 text-white' : 'border-gray-100 text-gray-800'}`}>
              <span>Grand Total</span>
              <span className="text-rose-500">GH₵ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-medium mt-4 transition duration-200 shadow"
          >
            <ShoppingCart size={16} />
            Proceed to Payment
          </button>

        </div>
      )}

    </div>
  );
};

export default Cart;