import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import type { Order, DeliveryPartner } from "../../types";

const STATUSES = ["Placed", "Confirmed", "Packed", "Out for Delivery", "Delivered", "Cancelled"];

const PAGE_SIZE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAllOrders({ page: String(page), limit: String(PAGE_SIZE) }),
      api.getDeliveryPartners(),
    ])
      .then(([o, p]) => {
        setOrders(o.orders);
        setTotalPages(o.pages);
        setTotalOrders(o.total);
        setPartners(p);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const replace = (updated: Order) =>
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? { ...o, ...updated, user: o.user, deliveryPartner: partners.find((p) => p._id === (updated.deliveryPartner as unknown as string)) ?? updated.deliveryPartner } : o)));

  const update = async (id: string, body: object, msg: string) => {
    try {
      const updated = await api.updateOrderStatus(id, body);
      replace(updated);
      toast.success(msg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const setLocation = (o: Order) => {
    const raw = window.prompt("Rider location as: lat,lng  (e.g. 30.7333,76.7794)");
    if (!raw) return;
    const [lat, lng] = raw.split(",").map((n) => Number(n.trim()));
    if (Number.isNaN(lat) || Number.isNaN(lng)) return toast.error("Use the format: lat,lng");
    update(o._id, { liveLocation: { lat, lng } }, "Location updated");
  };

  const verifyOtp = async (o: Order) => {
    try {
      const updated = await api.verifyOtp(o._id, otpInput[o._id] || "");
      replace(updated);
      toast.success("OTP verified — order delivered");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "OTP check failed");
    }
  };

  if (loading) return <p className="text-app-text-light">Loading orders...</p>;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-serif text-app-green mb-6">Customer Orders ({totalOrders})</h2>
      {orders.length === 0 && <p className="text-app-text-light">No orders yet.</p>}

      <div className="space-y-4">
        {orders.map((o) => {
          const u = typeof o.user === "object" ? o.user : null;
          const partnerId = o.deliveryPartner && typeof o.deliveryPartner === "object" ? o.deliveryPartner._id : "";
          const closed = o.status === "Delivered" || o.status === "Cancelled";
          return (
            <div key={o._id} className="p-4 sm:p-5 bg-app-canvas rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                <div>
                  <p className="font-medium text-app-green">#{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-app-text-light">{u?.name} · {u?.email}</p>
                  <p className="text-xs text-app-text-light">
                    {o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                  <p className="text-xs text-app-text-light">
                    {o.shippingAddress?.address}, {o.shippingAddress?.city} · {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-app-green">${o.total.toFixed(2)}</p>
                  <p className="text-xs text-app-text-light">{o.paymentMethod} · {o.isPaid ? "Paid" : "Unpaid"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={o.status} disabled={closed}
                  onChange={(e) => update(o._id, { status: e.target.value, note: `Status set to ${e.target.value}` }, "Status updated")}
                  className="p-2 rounded-lg border border-app-border bg-white text-app-green disabled:opacity-60"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>

                <select
                  value={partnerId} disabled={closed}
                  onChange={(e) => e.target.value && update(o._id, { deliveryPartnerId: e.target.value }, "Partner assigned")}
                  className="p-2 rounded-lg border border-app-border bg-white text-app-green disabled:opacity-60"
                >
                  <option value="">Assign partner…</option>
                  {partners.filter((p) => p.isActive).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>

                {!closed && (
                  <Link to={`/rider/${o._id}`} className="px-3 py-2 rounded-lg bg-app-clay text-white text-sm font-medium hover:bg-app-clay-dark transition-colors">
                    Rider mode (live GPS)
                  </Link>
                )}

                <button disabled={closed} onClick={() => setLocation(o)} className="px-3 py-2 rounded-lg border border-app-border bg-white text-app-green text-sm disabled:opacity-60 hover:border-app-clay transition-colors">
                  Set location
                </button>

                {o.status === "Out for Delivery" && (
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Customer OTP" maxLength={6}
                      value={otpInput[o._id] || ""}
                      onChange={(e) => setOtpInput((p) => ({ ...p, [o._id]: e.target.value }))}
                      className="w-32 p-2 rounded-lg border border-app-border text-app-green outline-none focus:border-app-clay transition-colors"
                    />
                    <button onClick={() => verifyOtp(o)} className="px-3 py-2 rounded-lg bg-app-green text-white text-sm hover:bg-app-clay transition-colors">Confirm delivery</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-app-border">
          <p className="text-sm text-app-text-light">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-app-border text-app-green disabled:opacity-40 hover:border-app-clay transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-app-border text-app-green disabled:opacity-40 hover:border-app-clay transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;