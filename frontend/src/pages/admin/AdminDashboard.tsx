const AdminDashboard = () => {
  const stats = [
    { label: "Total Orders", value: "1" },
    { label: "Total Users", value: "3" },
    { label: "Total Products", value: "27" },
    { label: "Out of Stock", value: "0" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-[#1A2E22]">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <p className="text-gray-400 text-sm font-medium">{s.label}</p>
            <p className="text-3xl font-bold mt-1 text-[#1A2E22]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-[#1A2E22]">Recent Orders</h2>
          <button className="text-orange-500 font-bold text-sm hover:underline">View All →</button>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider">
              <th className="pb-4">Order ID</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Items</th>
              <th className="pb-4">Total</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-4 font-medium text-gray-600">#D67DAC</td>
              <td className="py-4">
                <p className="font-bold text-[#1A2E22]">Admin</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </td>
              <td className="py-4 text-gray-600">2 items</td>
              <td className="py-4 font-bold text-[#1A2E22]">$248.40</td>
              <td className="py-4">
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  Delivered
                </span>
              </td>
              <td className="py-4 text-gray-500 text-sm">06/04/2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;