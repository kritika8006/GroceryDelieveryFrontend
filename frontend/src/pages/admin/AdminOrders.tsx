const AdminOrders = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold mb-6 text-[#1A2E22]">Customer Orders</h2>
      <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
        <div><p className="font-bold">#D67DAC</p><p className="text-sm text-gray-500">John Doe</p></div>
        <p className="font-bold">$248.40</p>
        <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full font-medium">Delivered</span>
      </div>
    </div>
  );
};

export default AdminOrders;