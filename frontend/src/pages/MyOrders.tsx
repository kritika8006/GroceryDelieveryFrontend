import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, X, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import type { Order, Product } from "../types";

const TABS = ["All Orders", "Placed", "Out for Delivery", "Delivered"];

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Orders");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  const reorder = async (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderingId(order._id);

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
      const qty = Math.min(r.requestedQty, r.product.stock);
      addToCart(r.product, qty);
      added++;
    }

    setReorderingId(null);

    if (added > 0) toast.success(`Added ${added} item${added > 1 ? "s" : ""} to your cart`);
    if (skipped.length > 0) {
      toast.error(`Not available anymore: ${skipped.join(", ")}`);
    }
  };

  const cancelOrder = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Cancel this order?")) return;
    setCancellingId(id);
    try {
      const updated = await api.cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    api
      .getMyOrders()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders =
    activeTab === "All Orders" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-app-canvas py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-serif text-3xl text-app-green mb-8">My Orders</h1>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${tab === activeTab ? "bg-app-green text-white" : "bg-white border border-app-border text-app-text-light hover:border-app-clay"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-app-clay animate-spin mb-3" />
            <p className="text-app-text-light">Loading your orders...</p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="text-center py-20 text-app-text-light bg-white rounded-2xl border border-dashed border-app-border">
            No orders here yet.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <Link
                to={`/orders/${order._id}`}
                key={order._id}
                className="block bg-white p-6 rounded-2xl border border-app-border hover:border-app-clay/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-app-green">Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="text-sm text-app-text-light">{new Date(order.createdAt).toDateString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                    ${order.status === "Delivered" ? "bg-app-moss/10 text-app-moss" : "bg-app-gold/15 text-app-clay-dark"}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-app-text-light">
                  <span>{order.items.length} items</span>
                  <span className="font-serif text-app-green ml-auto">${order.total.toFixed(2)}</span>
                  <button
                    onClick={(e) => reorder(e, order)}
                    disabled={reorderingId === order._id}
                    className="flex items-center gap-1 text-app-moss hover:text-app-green transition-colors disabled:opacity-50"
                  >
                    {reorderingId === order._id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Reorder
                  </button>
                  {["Placed", "Confirmed"].includes(order.status) && (
                    <button
                      onClick={(e) => cancelOrder(e, order._id)}
                      disabled={cancellingId === order._id}
                      className="flex items-center gap-1 text-app-clay hover:text-app-clay-dark transition-colors disabled:opacity-50"
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;