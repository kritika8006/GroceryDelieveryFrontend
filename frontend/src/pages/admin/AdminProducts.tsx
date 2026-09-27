const AdminProducts = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold mb-6 text-[#1A2E22]">Product List</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <p className="font-bold">Organic Apples</p>
          </div>
          <p className="font-bold">$2.99</p>
          <button className="text-red-500 font-bold">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;