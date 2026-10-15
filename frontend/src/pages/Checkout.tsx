import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { ArrowLeft, MapPin, CreditCard, Plus, X, Wallet, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import { api } from "../lib/api";
import { stripePromise } from "../lib/stripe";
import type { Address } from "../types";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1F2B1E", // app-green
      "::placeholder": { color: "#6B6355" }, // app-text-light
    },
    invalid: { color: "#C1552C" }, // app-clay
  },
};

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({ label: "", address: "", city: "", state: "", zip: "" });

  useEffect(() => {
    api
      .getAddresses()
      .then((data: Address[]) => {
        setAddresses(data);
        setSelectedAddr(data.find((a) => a.isDefault) || data[0] || null);
      })
      .catch(() => setAddresses([]));
  }, []);

  const deliveryFee = cartTotal > 20 ? 0 : 40; // keep in sync with backend orderController.js
  const tax = Math.round(cartTotal * 0.05 * 100) / 100;
  const total = cartTotal + deliveryFee + tax;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.addAddress(formData);
      setAddresses(updated);
      setSelectedAddr(updated[updated.length - 1]);
      setIsModalOpen(false);
      toast.success("Address added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacing(true);
    try {
      let paymentIntentId: string | undefined;

      if (paymentMethod === "Card") {
        if (!stripe || !elements) {
          toast.error("Payment form is still loading — try again in a moment");
          return;
        }
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error("Card details not found — go back to the Payment step and re-enter your card.");
          return;
        }

        // 1. ask our backend to open a Stripe PaymentIntent for this exact total
        const { clientSecret } = await api.createPaymentIntent(total);

        // 2. confirm the card charge directly with Stripe (card details never touch our server)
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

        if (error) {
          toast.error(error.message || "Card payment failed");
          return;
        }
        if (paymentIntent?.status !== "succeeded") {
          toast.error("Payment was not completed");
          return;
        }
        paymentIntentId = paymentIntent.id;
      }

      // 3. only now create the order — the backend re-verifies the payment with Stripe itself
      const order = await api.createOrder({
        items: items.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
        shippingAddress: selectedAddr,
        paymentMethod,
        paymentIntentId,
      });
      clearCart();
      toast.success("Order placed!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-canvas py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors"><ArrowLeft size={16}/> Back</button>
        <h1 className="font-serif text-2xl text-app-green mb-6">Checkout</h1>

        <div className="flex gap-8 mb-8 border-b pb-4">
          {["address", "payment", "review"].map((s) => (
            <button key={s} onClick={() => setStep(s)} className={`capitalize font-medium transition-colors ${step === s ? "text-app-clay" : "text-app-text-light"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "address" && (
              <div className="space-y-4">
                {addresses.length === 0 && (
                  <p className="text-sm text-app-text-light">No saved addresses yet — add one below.</p>
                )}
                {addresses.map((addr) => (
                  <div key={addr._id} onClick={() => setSelectedAddr(addr)}
                    className={`p-6 border rounded-2xl cursor-pointer transition-colors ${selectedAddr?._id === addr._id ? "border-app-clay bg-app-clay/5" : "bg-white border-app-border"}`}>
                    <p className="font-semibold text-app-green">{addr.label}</p>
                    <p className="text-sm text-app-text-light">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                ))}
                <button onClick={() => setIsModalOpen(true)} className="w-full p-6 border-2 border-dashed border-app-border rounded-2xl text-app-text-light hover:border-app-clay hover:text-app-clay transition-colors flex items-center justify-center gap-2">
                  <Plus size={18}/> Add New Address
                </button>
                <button onClick={() => setStep("payment")} disabled={!selectedAddr} className="w-full bg-app-green text-white py-4 rounded-xl font-medium hover:bg-app-clay transition-colors disabled:opacity-50">Continue to Payment</button>
              </div>
            )}

            {/* Always mounted (never conditionally removed) so the CardElement — and the
                card details the user typed into it — survive moving on to the Review step.
                Unmounting it would wipe out Stripe's internal state and silently break
                payment, since elements.getElement(CardElement) would return null. */}
            <div className={`bg-white p-6 rounded-2xl border border-app-border space-y-4 ${step === "payment" ? "" : "hidden"}`}>
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "Card" ? "border-app-clay bg-app-clay/5" : "border-app-border"}`}>
                  <input type="radio" name="pay" checked={paymentMethod === "Card"} onChange={() => setPaymentMethod("Card")} />
                  <CreditCard className="text-app-text-light" /> <span className="text-app-green">Credit/Debit Card</span>
                </label>

                <div className={`ml-1 p-4 border border-app-border rounded-xl bg-app-canvas/40 ${paymentMethod === "Card" ? "" : "hidden"}`}>
                  <CardElement options={cardElementOptions} />
                  <p className="text-xs text-app-text-light mt-3">
                    Test mode — use card <span className="font-mono">4242 4242 4242 4242</span>, any future expiry, any CVC.
                  </p>
                </div>

                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "COD" ? "border-app-clay bg-app-clay/5" : "border-app-border"}`}>
                  <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                  <Wallet className="text-app-text-light" /> <span className="text-app-green">Cash on Delivery</span>
                </label>
                <button onClick={() => setStep("review")} className="w-full bg-app-green text-white py-4 rounded-xl mt-4 font-medium hover:bg-app-clay transition-colors">Review Order</button>
            </div>

            {step === "review" && (
              <div className="bg-white p-6 rounded-2xl border border-app-border">
                <h2 className="font-serif text-lg text-app-green mb-4">Review Your Order</h2>
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center py-4 border-b border-app-border">
                    <div className="flex items-center gap-4">
                        <img src={item.product.image} className="w-16 h-16 object-contain bg-app-canvas rounded-lg p-1" alt={item.product.name} />
                        <div><p className="font-medium text-app-green">{item.product.name}</p><p className="text-sm text-app-text-light">Qty: {item.quantity}</p></div>
                    </div>
                    <span className="font-serif text-app-green">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <p className="text-sm text-app-text-light mt-4">
                  Paying with: <span className="font-medium text-app-green">{paymentMethod === "Card" ? "Card" : "Cash on Delivery"}</span>
                </p>
                <button onClick={handlePlaceOrder} disabled={placing} className="w-full bg-app-clay hover:bg-app-clay-dark text-white py-4 rounded-xl font-medium mt-6 flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                  {placing && <Loader2 size={18} className="animate-spin" />}
                  {placing ? "Processing..." : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-app-border h-fit">
            <h2 className="font-serif text-lg text-app-green mb-4">Order Summary</h2>
            {items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm py-1 text-app-green/80">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <div className="border-t border-app-border mt-4 pt-4 space-y-2 text-app-green/80">
                <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-serif text-lg pt-2 text-app-green"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-app-green/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddAddress} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-3">
            <div className="flex justify-between items-center font-serif text-xl text-app-green mb-4">Add Address <X onClick={() => setIsModalOpen(false)} className="cursor-pointer text-app-text-light hover:text-app-green"/></div>
            <input required placeholder="Label (Home/Work)" className="w-full p-3 border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors" onChange={e => setFormData({...formData, label: e.target.value})}/>
            <input required placeholder="Address" className="w-full p-3 border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors" onChange={e => setFormData({...formData, address: e.target.value})}/>
            <input required placeholder="City" className="w-full p-3 border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors" onChange={e => setFormData({...formData, city: e.target.value})}/>
            <input required placeholder="State" className="w-full p-3 border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors" onChange={e => setFormData({...formData, state: e.target.value})}/>
            <input required placeholder="ZIP" className="w-full p-3 border border-app-border rounded-xl outline-none focus:border-app-clay transition-colors" onChange={e => setFormData({...formData, zip: e.target.value})}/>
            <button className="w-full bg-app-green hover:bg-app-clay text-white py-3 rounded-xl font-medium transition-colors"><MapPin size={16} className="inline mr-1"/>Save Address</button>
          </form>
        </div>
      )}
    </div>
  );
};

// CardElement/useStripe/useElements only work inside <Elements>, so the
// actual form lives in CheckoutForm and this just provides that context.
const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;