import { NavLink, useNavigate } from "react-router-dom"; // 1. Added useNavigate
import { LayoutDashboard, PlusCircle, Package, ShoppingBag, Truck, LogOut, Shield } from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate(); // 2. Initialized navigate

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/add-product", label: "Add Product", icon: PlusCircle },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/delivery", label: "Delivery Partners", icon: Truck },
  ];

  return (
    <div className="w-64 bg-white m-4 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 font-bold text-xl mb-10 text-[#1A2E22] px-2">
          <Shield size={24} /> Admin Panel
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} to={item.path} end={item.path === "/admin"}
              className={({ isActive }) => `flex items-center gap-3 p-4 rounded-2xl transition ${isActive ? "bg-[#1A2E22] text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* 3. Updated Exit button with onClick handler */}
      <button 
        onClick={() => navigate("/")} 
        className="flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition"
      >
        <LogOut size={20} /> Exit
      </button>
    </div>
  );
};

export default AdminSidebar;