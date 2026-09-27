const DeliveryPartners = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold mb-6 text-[#1A2E22]">Delivery Personnel</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
          <p className="font-bold">Alex Driver</p>
          <span className="text-green-600 font-bold">Active</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartners;