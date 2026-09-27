import { Link } from "react-router-dom";
import { dummyDashboardOrdersData } from "../assets/assets";

const MyOrders = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#1A2E22] mb-8">My Orders</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          {["All Orders", "Placed", "Out for Delivery", "Delivered"].map((tab) => (
            <button 
              key={tab} 
              className={`px-4 py-2 rounded-full text-sm ${tab === "All Orders" ? "bg-[#1A2E22] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {dummyDashboardOrdersData.map((order) => (
            <Link 
              to={`/orders/${order._id}`} 
              key={order._id}
              className="block bg-white p-6 rounded-2xl border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[#1A2E22]">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{order.items.length} items</span>
                <span className="font-bold text-[#1A2E22] ml-auto">${order.total.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;