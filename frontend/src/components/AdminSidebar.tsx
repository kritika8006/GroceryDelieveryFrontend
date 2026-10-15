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
    <div className="w-full md:w-64 md:shrink-0 bg-white m-4 rounded-3xl border border-app-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] p-4 md:p-6 flex flex-col md:justify-between">
      <div>
        <div className="flex items-center gap-3 font-serif text-xl mb-4 md:mb-10 text-app-green px-2">
          <Shield size={24} className="text-app-clay" /> Admin Panel
        </div>
        <div className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-visible pb-1">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} to={item.path} end={item.path === "/admin"}
              className={({ isActive }) => `flex items-center gap-3 p-3 md:p-4 rounded-2xl transition-colors whitespace-nowrap shrink-0 ${isActive ? "bg-app-green text-white" : "text-app-text-light hover:bg-app-canvas"}`}
            >
              <item.icon size={20} /> <span className="text-sm md:text-base">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* 3. Updated Exit button with onClick handler */}
      <button 
        onClick={() => navigate("/")} 
        className="hidden md:flex items-center gap-3 p-4 text-app-clay hover:bg-app-clay/5 rounded-2xl transition-colors"
      >
        <LogOut size={20} /> Exit
      </button>
    </div>
  );
};

export default AdminSidebar;