import { ShoppingBagIcon, XIcon, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartSidebar = () => {
  const { items, updateQuantity, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  if (!isCartOpen) return null;

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header - Light Border */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            <h2 className="text-lg font-medium">Your Cart</h2>
            <span className="px-3 py-1 text-xs font-semibold bg-app-clay/10 text-app-clay rounded-full">
              {items.length} items
            </span>
          </div>
          <button onClick={() => setIsCartOpen(false)}><XIcon className="size-5" /></button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center text-gray-400">
            <ShoppingBagIcon className="size-16 mb-4 opacity-20" strokeWidth={1} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-4">
                <img src={item.product.image} className="size-16 object-cover rounded-xl border border-gray-100" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{currency}{item.product.price.toFixed(2)}</p>
                </div>
                
                {/* Improved Quantity Box */}
                <div className="flex items-center gap-3 border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="hover:text-app-clay">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="hover:text-app-clay">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.product._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer - Light Border */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between mb-2 text-gray-600"><span>Subtotal</span><span>{currency}{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between mb-4 text-gray-600"><span>Delivery Fee</span><span>{deliveryFee === 0 ? "Free" : `${currency}${deliveryFee}`}</span></div>
            <div className="flex justify-between font-bold text-lg mb-4 text-gray-800"><span>Total</span><span>{currency}{grandTotal.toFixed(2)}</span></div>
            <button 
      className="w-full bg-app-green text-white py-3.5 rounded-xl font-medium hover:bg-app-clay transition-colors" 
      onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}
    >
      Checkout
    </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;