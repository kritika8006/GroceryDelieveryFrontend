const AddProduct = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-2xl">
      <h2 className="text-xl font-bold mb-6 text-[#1A2E22]">Add New Product</h2>
      <form className="space-y-4">
        <input placeholder="Product Name" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A2E22]/20" />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Price" className="p-4 bg-gray-50 rounded-2xl outline-none" />
          <input type="number" placeholder="Stock" className="p-4 bg-gray-50 rounded-2xl outline-none" />
        </div>
        <textarea placeholder="Description" className="w-full p-4 bg-gray-50 rounded-2xl outline-none h-32" />
        <button className="w-full bg-[#1A2E22] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#1A2E22]/20">Save Product</button>
      </form>
    </div>
  );
};

export default AddProduct;