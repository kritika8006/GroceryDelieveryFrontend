import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Phone, MapPin, CheckCircle2, Package, X, RotateCcw, Loader2 as Spinner } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { api, API_SOCKET_URL } from "../lib/api";
import { useCart } from "../context/CartContext";
import type { Order, Product } from "../types";
import Loading from "../components/Loading";

// Keeps the map centered on the rider as new positions arrive
const FollowMarker = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const { addToCart } = useCart();

  const reorder = async () => {
    if (!order) return;
    setReordering(true);

    const results = await Promise.all(
      order.items.map(async (item) => {
        try {
          const product: Product = await api.getProductById(item.product);
          return { product, requestedQty: item.quantity, name: item.name };
        } catch {
          return { product: null, requestedQty: item.quantity, name: item.name };
        }
      })
    );

    let added = 0;
    const skipped: string[] = [];
    for (const r of results) {
      if (!r.product || r.product.stock <= 0) {
        skipped.push(r.name);
        continue;
      }
      addToCart(r.product, Math.min(r.requestedQty, r.product.stock));
      added++;
    }

    setReordering(false);
    if (added > 0) toast.success(`Added ${added} item${added > 1 ? "s" : ""} to your cart`);
    if (skipped.length > 0) toast.error(`Not available anymore: ${skipped.join(", ")}`);
  };

  const cancelOrder = async () => {
    if (!id || !window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const updated = await api.cancelOrder(id);
      setOrder(updated);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // initial fetch
  useEffect(() => {
    if (!id) return;
    api
      .getOrderById(id)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  // live updates: join this order's room, apply pushed updates as they arrive
  useEffect(() => {
    if (!id) return;
    const socket: Socket = io(API_SOCKET_URL, { auth: { token: localStorage.getItem("token") } });
    socket.emit("joinOrder", id);
    socket.on("orderUpdated", (updated: Order) => {
      if (updated._id === id) setOrder(updated);
    });
    socket.on("locationUpdated", (msg: { orderId: string; liveLocation: Order["liveLocation"] }) => {
      if (msg.orderId === id) setOrder((prev) => (prev ? { ...prev, liveLocation: msg.liveLocation } : prev));
    });
    return () => {
      socket.disconnect();
    };
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

  const partnerName =
    order.deliveryPartner && typeof order.deliveryPartner === "object" ? order.deliveryPartner.name : null;

  return (
    <div className="min-h-screen bg-app-canvas py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors">
          <ArrowLeftIcon className="size-4" /> Back to Orders
        </button>

        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="font-serif text-2xl text-app-green">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-app-text-light">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-app-gold/15 text-app-clay-dark px-4 py-1 rounded-full text-sm font-medium">{order.status}</span>
            <button
              onClick={reorder}
              disabled={reordering}
              className="flex items-center gap-1 text-sm text-app-moss hover:text-app-green transition-colors disabled:opacity-50"
            >
              {reordering ? <Spinner size={14} className="animate-spin" /> : <RotateCcw size={14} />} Reorder
            </button>
            {["Placed", "Confirmed"].includes(order.status) && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="flex items-center gap-1 text-sm text-app-clay hover:text-app-clay-dark transition-colors disabled:opacity-50"
              >
                <X size={14} /> Cancel order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-app-green text-white p-6 rounded-2xl">
              <p className="text-sm opacity-70 mb-3">Delivery OTP</p>
              <div className="flex gap-2">
                {(order.deliveryOtp || "000000").split("").map((digit, i) => (
                  <span key={i} className="bg-white/10 w-12 h-14 flex items-center justify-center rounded-lg text-2xl font-bold">{digit}</span>
                ))}
              </div>
            </div>

            {order.liveLocation?.lat && order.liveLocation?.lng && (
              <div>
                <div className="h-64 w-full rounded-2xl overflow-hidden border">
                  <MapContainer center={[order.liveLocation.lat, order.liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[order.liveLocation.lat, order.liveLocation.lng]} />
                    <FollowMarker lat={order.liveLocation.lat} lng={order.liveLocation.lng} />
                  </MapContainer>
                </div>
                {order.liveLocation.updatedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Rider location updated {new Date(order.liveLocation.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-app-border">
              <h2 className="font-serif text-lg text-app-green mb-6">Delivery Progress</h2>
              {order.statusHistory.map((step, i) => (
                <div key={i} className="flex gap-4 mb-6">
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 rounded-full ${i < order.statusHistory.length - 1 ? "bg-app-moss/10 text-app-moss" : "bg-app-clay/10 text-app-clay"}`}>
                      <CheckCircle2 size={20} />
                    </div>
                    {i < order.statusHistory.length - 1 && <div className="w-0.5 h-10 bg-app-border my-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-app-green">{step.status}</p>
                    <p className="text-xs text-app-text-light">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>

            {partnerName && (
              <div className="bg-white p-4 rounded-2xl border border-app-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-app-green rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {partnerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-app-green">{partnerName}</p>
                    <p className="text-xs text-app-text-light">Delivery Partner</p>
                  </div>
                </div>
                <Phone size={20} className="text-app-text-light cursor-pointer hover:text-app-clay transition-colors" />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-app-border">
              <h3 className="font-medium text-app-green mb-4 flex items-center gap-2"><MapPin size={18} className="text-app-clay"/> Delivery Address</h3>
              <p className="text-sm font-medium text-app-green">{order.shippingAddress.label}</p>
              <p className="text-sm text-app-text-light">{order.shippingAddress.address}</p>
              <p className="text-sm text-app-text-light">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-app-border">
              <h3 className="font-medium text-app-green mb-4 flex items-center gap-2"><Package size={18} className="text-app-clay"/> Items ({order.items.length})</h3>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-3">
                  <span className="text-app-text-light">{item.name} <span className="text-xs">x{item.quantity}</span></span>
                  <span className="font-medium text-app-green">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-app-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-app-text-light"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-app-text-light"><span>Delivery</span><span>{order.deliveryFee === 0 ? "Free" : `$${order.deliveryFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-sm text-app-text-light"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-serif text-lg pt-2 text-app-green"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;