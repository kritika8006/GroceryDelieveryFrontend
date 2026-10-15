import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only lets logged-in admins through. The backend enforces this too;
// this just keeps regular users from seeing the admin screens.
const AdminRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;