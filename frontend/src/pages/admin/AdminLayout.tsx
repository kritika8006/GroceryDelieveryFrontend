import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import Navbar from "../../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-app-canvas">
      <Navbar />
           <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;