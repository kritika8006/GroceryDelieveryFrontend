import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Order } from "../../types";

interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  outOfStock: number;
  recentOrders: Order[];
}

const statusStyle = (status: string) =>
  status === "Delivered" ? "bg-green-50 text-green-600"
  : status === "Cancelled" ? "bg-red-50 text-red-600"
  : "bg-orange-50 text-orange-600";

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Loading dashboard...</p>;

  const stats = [
    { label: "Total Orders", value: data.totalOrders },
    { label: "Total Users", value: data.totalUsers },
    { label: "Total Products", value: data.totalProducts },
    { label: "Out of Stock", value: data.outOfStock },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-[#1A2E22]">Dashboard</h1>
      <p className="text-gray-500 mb-8">Revenue (paid orders): <b>${data.totalRevenue.toFixed(2)}</b></p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <p className="text-gray-400 text-sm font-medium">{s.label}</p>
            <p className="text-3xl font-bold mt-1 text-[#1A2E22]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#1A2E22]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-orange-500 font-bold text-sm hover:underline">View All →</Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
               ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider">
                <th className="pb-4">Order ID</th><th className="pb-4">Customer</th><th className="pb-4">Items</th>
                <th className="pb-4">Total</th><th className="pb-4">Status</th><th className="pb-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentOrders.map((o) => {
                const u = typeof o.user === "object" ? o.user : null;
                return (
                  <tr key={o._id}>
                    <td className="py-4 font-medium text-gray-600">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4">
                      <p className="font-bold text-[#1A2E22]">{u?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{u?.email}</p>
                    </td>
                    <td className="py-4 text-gray-600">{o.items.length} items</td>
                    <td className="py-4 font-bold text-[#1A2E22]">${o.total.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="py-4 text-gray-500 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
                      </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;