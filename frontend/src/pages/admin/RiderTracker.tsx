import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import type { Order } from "../../types";

const SEND_EVERY_MS = 5000;

// The "rider app": open this on the delivery person's phone. It reads the phone's
// real GPS and sends it to the backend, which pushes it to the customer's map.
const RiderTracker = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [sharing, setSharing] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);

  useEffect(() => {
    if (!id) return;
    api.getOrderById(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  const stop = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSharing(false);
  };

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const start = async () => {
    if (!id || !order) return;
    if (!("geolocation" in navigator)) return setError("This browser doesn't support location.");
    setError("");

    try {
      if (order.status !== "Out for Delivery") {
        const updated = await api.updateOrderStatus(id, { status: "Out for Delivery", note: "Rider picked up your order" });
        setOrder((o) => (o ? { ...o, status: updated.status } : o));
      }
    } catch (e) {
      return setError(e instanceof Error ? e.message : "Could not start delivery");
    }

    lastSent.current = 0;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setCoords({ lat, lng, accuracy });
        const now = Date.now();
        if (now - lastSent.current >= SEND_EVERY_MS) {
          lastSent.current = now;
          api.updateLocation(id, { lat, lng })
            .then(() => setSentAt(new Date()))
            .catch((e) => setError(e.message));
        }
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow it in the address bar, then press Start again."
            : "Could not get your location."
        );
        stop();
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
    setSharing(true);
  };

  const confirmDelivery = async () => {
    if (!id) return;
    try {
      const updated = await api.verifyOtp(id, otp);
      setOrder((o) => (o ? { ...o, status: updated.status } : o));
      stop();
      toast.success("Delivered!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "OTP check failed");
    }
  };

  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">{error || "Loading order..."}</div>;

  const done = order.status === "Delivered" || order.status === "Cancelled";

  return (
    <div className="min-h-screen bg-app-canvas p-4 flex justify-center">
      <div className="w-full max-w-md space-y-4">
        <Link to="/admin/orders" className="text-sm text-app-text-light hover:text-app-green transition-colors">← Back to admin orders</Link>

        <div className="bg-white p-5 rounded-2xl border border-app-border">
          <p className="text-xs text-app-text-light">Rider mode</p>
          <h1 className="font-serif text-xl text-app-green">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-app-text-light mt-1">
            {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.zip}
          </p>
          <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-app-gold/15 text-app-clay-dark">{order.status}</span>
        </div>

        {!window.isSecureContext && (
          <p className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl">
            Browsers only allow GPS on https or localhost. On a phone you'll need an https link (e.g. a tunnel) for this to work.
          </p>
        )}

        {error && <p className="text-sm bg-app-clay/5 border border-app-clay/30 text-app-clay-dark p-3 rounded-xl">{error}</p>}

        {!done && (
          <div className="bg-white p-5 rounded-2xl border border-app-border space-y-3">
            {!sharing ? (
              <button onClick={start} className="w-full bg-app-green text-white py-3 rounded-xl font-medium hover:bg-app-clay transition-colors">
                Start delivery &amp; share live location
              </button>
            ) : (
              <button onClick={stop} className="w-full bg-app-clay-dark text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">Stop sharing</button>
            )}

            {sharing && (
              <div className="text-sm text-app-text-light space-y-1">
                <p className="text-app-moss font-medium">● Sharing live location</p>
                {coords ? (
                  <>
                    <p>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} (±{Math.round(coords.accuracy)} m)</p>
                    <p>Last sent to customer: {sentAt ? sentAt.toLocaleTimeString() : "…"}</p>
                  </>
                ) : (
                  <p>Waiting for GPS…</p>
                )}
              </div>
            )}
          </div>
        )}

        {order.status === "Out for Delivery" && (
          <div className="bg-white p-5 rounded-2xl border border-app-border space-y-3">
            <p className="font-medium text-app-green">At the door? Ask the customer for their OTP</p>
            <input
              value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} inputMode="numeric"
              placeholder="6-digit OTP" className="w-full p-3 border border-app-border rounded-xl text-center tracking-widest text-lg outline-none focus:border-app-clay transition-colors"
            />
            <button onClick={confirmDelivery} className="w-full bg-app-clay text-white py-3 rounded-xl font-medium hover:bg-app-clay-dark transition-colors">Confirm delivery</button>
          </div>
        )}

        {done && <p className="text-center text-app-text-light">This order is {order.status.toLowerCase()}.</p>}
      </div>
    </div>
  );
};

export default RiderTracker;