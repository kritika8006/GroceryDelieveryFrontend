import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Phone, MapPin, CheckCircle2, Package } from "lucide-react";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { dummyAdminDashboardData } from "../assets/assets";
import Loading from "../components/Loading";

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  deliveryOtp?: string;
  liveLocation?: { lat: number; lng: number };
  statusHistory: { status: string; timestamp: string }[];
  shippingAddress: { label: string; address: string; city: string; state: string; zip: string };
  deliveryPartner: { name: string; phone?: string };
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
}

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundOrder = dummyAdminDashboardData.recentOrders.find((o) => o._id === id);
    setOrder(foundOrder || null);
    setLoading(false);
  }, [id]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Order not found.</h2>
        <button onClick={() => navigate("/orders")} className="text-blue-600 underline">Return to Orders</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors">
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>

        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2E22]">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <span className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-medium">{order.status}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1A2E22] text-white p-6 rounded-2xl">
              <p className="text-sm opacity-80 mb-3">Delivery OTP</p>
              <div className="flex gap-2">
                {(order.deliveryOtp || "000000").split("").map((digit, i) => (
                  <span key={i} className="bg-white/10 w-12 h-14 flex items-center justify-center rounded-lg text-2xl font-bold">{digit}</span>
                ))}
              </div>
            </div>

            {order.liveLocation && (
              <div className="h-64 w-full rounded-2xl overflow-hidden border">
                <MapContainer center={[order.liveLocation.lat, order.liveLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[order.liveLocation.lat, order.liveLocation.lng]} />
                </MapContainer>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border">
              <h2 className="font-bold text-[#1A2E22] mb-6">Delivery Progress</h2>
              {order.statusHistory.map((step, i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-full ${i < order.statusHistory.length - 1 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      <CheckCircle2 size={20} />
                    </div>
                    {i < order.statusHistory.length - 1 && <div className="w-0.5 h-10 bg-gray-200 my-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2E22]">{step.status}</p>
                    <p className="text-xs text-gray-500">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.deliveryPartner && (
              <div className="bg-white p-4 rounded-2xl border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1A2E22] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {order.deliveryPartner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2E22]">{order.deliveryPartner.name}</p>
                    <p className="text-xs text-gray-500">Delivery Partner</p>
                  </div>
                </div>
                <Phone size={20} className="text-gray-400 cursor-pointer hover:text-[#1A2E22]" />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border">
              <h3 className="font-bold text-[#1A2E22] mb-4 flex items-center gap-2"><MapPin size={18}/> Delivery Address</h3>
              <p className="text-sm font-medium">{order.shippingAddress.label}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border">
              <h3 className="font-bold text-[#1A2E22] mb-4 flex items-center gap-2"><Package size={18}/> Items ({order.items.length})</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span>${order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 text-[#1A2E22]"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;