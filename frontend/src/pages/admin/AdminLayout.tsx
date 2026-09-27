import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;