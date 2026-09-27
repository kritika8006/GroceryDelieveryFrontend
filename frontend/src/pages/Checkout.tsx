import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { dummyAddressData } from "../assets/assets";
import { ArrowLeft, MapPin, CreditCard, Check, Plus, X, Wallet } from "lucide-react";
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal } = useCart();
  const [step, setStep] = useState("address");
  const [addresses, setAddresses] = useState(dummyAddressData);
  const [selectedAddr, setSelectedAddr] = useState(dummyAddressData[0]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ label: "", fullName: "", address: "", city: "", state: "", zip: "", phone: "" });

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses([...addresses, { ...formData, _id: Date.now().toString(), isDefault: false, lat: 40.7, lng: -74.0 }]);
    setIsModalOpen(false);
    toast.success("Address added!");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-6"><ArrowLeft size={16}/> Back</button>
        <h1 className="text-2xl font-bold text-[#1A2E22] mb-6">Checkout</h1>

        <div className="flex gap-8 mb-8 border-b pb-4">
          {["address", "payment", "review"].map((s) => (
            <button key={s} onClick={() => setStep(s)} className={`capitalize font-bold ${step === s ? "text-[#1A2E22]" : "text-gray-400"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "address" && (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr._id} onClick={() => setSelectedAddr(addr)} 
                    className={`p-6 border rounded-2xl cursor-pointer ${selectedAddr._id === addr._id ? "border-[#1A2E22] bg-green-50" : "bg-white"}`}>
                    <p className="font-bold">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                ))}
                <button onClick={() => setIsModalOpen(true)} className="w-full p-6 border-2 border-dashed rounded-2xl text-gray-500 flex items-center justify-center gap-2">
                  <Plus size={18}/> Add New Address
                </button>
                <button onClick={() => setStep("payment")} className="w-full bg-[#1A2E22] text-white py-4 rounded-xl font-bold">Continue to Payment</button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white p-6 rounded-2xl border space-y-4">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === "card" ? "border-[#1A2E22] bg-green-50" : ""}`}>
                  <input type="radio" name="pay" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> 
                  <CreditCard className="text-gray-500" /> Credit/Debit Card
                </label>
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === "cash" ? "border-[#1A2E22] bg-green-50" : ""}`}>
                  <input type="radio" name="pay" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} /> 
                  <Wallet className="text-gray-500" /> Cash on Delivery
                </label>
                <button onClick={() => setStep("review")} className="w-full bg-[#1A2E22] text-white py-4 rounded-xl mt-4 font-bold">Review Order</button>
              </div>
            )}

            {step === "review" && (
              <div className="bg-white p-6 rounded-2xl border">
                <h2 className="font-bold mb-4">Review Your Order</h2>
                {items.map((item: any) => (
                  <div key={item.product._id} className="flex justify-between items-center py-4 border-b">
                    <div className="flex items-center gap-4">
                        <img src={item.product.image} className="w-16 h-16 object-cover rounded-lg" alt={item.product.name} />
                        <div><p className="font-semibold">{item.product.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                    </div>
                    <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <button onClick={() => navigate("/orders")} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold mt-6">Place Order — ${total.toFixed(2)}</button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border h-fit">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            {items.map((item: any) => (
                <div key={item.product._id} className="flex justify-between text-sm py-1">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddAddress} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-3">
            <div className="flex justify-between font-bold text-xl mb-4">Add Address <X onClick={() => setIsModalOpen(false)} className="cursor-pointer"/></div>
            <input required placeholder="Label (Home/Work)" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, label: e.target.value})}/>
            <input required placeholder="Full Name" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, fullName: e.target.value})}/>
            <input required placeholder="Address" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, address: e.target.value})}/>
            <input required placeholder="City" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, city: e.target.value})}/>
            <input required placeholder="Phone" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, phone: e.target.value})}/>
            <button className="w-full bg-[#1A2E22] text-white py-3 rounded-xl font-bold">Save Address</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Checkout;