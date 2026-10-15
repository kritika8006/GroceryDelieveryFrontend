import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import type { DeliveryPartner } from "../../types";

const input = "p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20";
const empty = { name: "", email: "", phone: "", vehicleType: "bike" };

const DeliveryPartners = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDeliveryPartners().then(setPartners).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createDeliveryPartner(form);
      setPartners((p) => [created, ...p]);
      setForm(empty);
      toast.success("Partner added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add partner");
    }
  };

  const toggle = async (p: DeliveryPartner) => {
    try {
      const updated = await api.updateDeliveryPartner(p._id, { isActive: !p.isActive });
      setPartners((prev) => prev.map((x) => (x._id === p._id ? updated : x)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold mb-6 text-[#1A2E22]">Delivery Personnel</h2>

      <form onSubmit={add} className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <input required placeholder="Name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required placeholder="Phone" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select className={input} value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
          <option value="bike">Bike</option><option value="scooter">Scooter</option><option value="car">Car</option>
        </select>
        <button className="bg-[#1A2E22] text-white rounded-xl font-bold">Add partner</button>
      </form>

      {loading ? <p className="text-gray-500">Loading...</p> : partners.length === 0 ? (
        <p className="text-gray-500">No delivery partners yet — add one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.phone} · {p.vehicleType}</p>
              </div>
              <button onClick={() => toggle(p)} className={`font-bold ${p.isActive ? "text-green-600" : "text-gray-400"}`}>
                {p.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;