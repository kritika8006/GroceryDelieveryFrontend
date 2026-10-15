import { Toaster } from 'react-hot-toast';
import { Routes, Route } from 'react-router-dom';

// Auth & Main Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppLayout from './pages/AppLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import SearchResults from './pages/SearchResults';
import FlashDeals from './pages/FlashDeals';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Addresses from './pages/Addresses';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RiderTracker from './pages/admin/RiderTracker';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import DeliveryPartners from './pages/admin/DeliveryPartners';

const App = () => {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000, 
          style: { 
            background: "#1B3022", 
            color: "#fff", 
            borderRadius: "12px", 
            fontSize: "14px" 
          } 
        }} 
      />
      
      <Routes>
        {/* Auth pages */}
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />

        {/* Admin Pages (Nested under AdminLayout) */}
        <Route element={<AdminRoute />}>
          <Route path="/rider/:id" element={<RiderTracker />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="delivery" element={<DeliveryPartners />} />
          </Route>
        </Route>

        {/* Main pages - With Navbar/Footer */}
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="deals" element={<FlashDeals />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;