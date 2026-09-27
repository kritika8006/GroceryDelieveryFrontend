import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bike, Search, ShoppingCart, ChevronDown, Package, 
  MapPin, Shield, LogOut, User 
} from "lucide-react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const [user] = useState<{name: string, email: string, isAdmin: boolean} | null>({ 
    name: "John Doe", email: "john.doe@example.com", isAdmin: true 
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#F8FAFC] to-[#ECFDF5] sticky top-0 z-50 border-b border-white/40 backdrop-blur-[20px] bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-semibold text-zinc-900">
          <Bike className="text-green-700" size={24} /> Instacart
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link to="/" className="hover:text-green-700 transition">Home</Link>
          <Link to="/products" className="hover:text-green-700 transition">Products</Link>
          <Link to="/deals" className="hover:text-green-700 transition">Deals</Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for groceries..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-full text-sm text-zinc-800 focus:outline-none focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2 hover:bg-white/50 rounded-full transition"
          >
            <ShoppingCart size={22} className="text-zinc-900" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full size-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-green-900 text-white flex items-center justify-center text-sm font-bold">
                {user ? user.name.charAt(0) : <User size={16} />}
              </div>
              <ChevronDown size={16} className="text-zinc-900" />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-[20px] text-gray-800 rounded-xl shadow-xl border border-gray-100 py-3 z-50">
                {!user ? (
                  <div className="py-2">
                    <Link to='/login' className="flex items-center gap-4 px-5 py-2.5 hover:bg-orange-50 transition-colors text-gray-700"><User size={20} /> Sign In</Link>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to='/orders' className="flex items-center gap-4 px-5 py-2.5 hover:bg-orange-50 transition-colors text-gray-700"><Package size={20} /> My Orders</Link>
                      <Link to='/addresses' className="flex items-center gap-4 px-5 py-2.5 hover:bg-orange-50 transition-colors text-gray-700"><MapPin size={20} /> Addresses</Link>
                      {user.isAdmin && (
                        <Link to='/admin' className="flex items-center gap-4 px-5 py-2.5 hover:bg-orange-50 transition-colors text-orange-700"><Shield size={20} /> Admin Panel</Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <button onClick={handleLogout} className="flex w-full items-center gap-4 px-5 py-2.5 text-red-500 hover:bg-red-50 transition-colors"><LogOut size={20} /> Logout</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;