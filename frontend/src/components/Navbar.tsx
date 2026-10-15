import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bike, Search, ShoppingCart, ChevronDown, Package, 
  MapPin, Shield, LogOut, User, Menu, X
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-app-canvas/90 sticky top-0 z-50 border-b border-app-border backdrop-blur-[20px]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 -ml-2 text-app-green"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-serif text-app-green">
          <Bike className="text-app-clay" size={24} /> Instacart
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-app-green/70">
          <Link to="/" className="hover:text-app-clay transition-colors">Home</Link>
          <Link to="/products" className="hover:text-app-clay transition-colors">Products</Link>
          <Link to="/deals" className="hover:text-app-clay transition-colors">Deals</Link>
        </div>

        {/* Search (desktop) */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for groceries..."
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-app-border rounded-full text-sm text-app-green focus:outline-none focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search icon (mobile only — opens the mobile menu which contains the search field) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden p-2 text-app-green"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2 hover:bg-white/50 rounded-full transition"
          >
            <ShoppingCart size={22} className="text-app-green" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-app-clay text-white text-[10px] rounded-full size-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 sm:gap-2">
              <div className="size-8 rounded-full bg-app-green text-white flex items-center justify-center text-sm font-bold">
                {user ? user.name.charAt(0) : <User size={16} />}
              </div>
              <ChevronDown size={16} className="hidden sm:block text-app-green" />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-[20px] text-app-green rounded-xl shadow-xl border border-app-border py-3 z-50">
                {!user ? (
                  <div className="py-2">
                    <Link to='/login' onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-5 py-2.5 hover:bg-app-canvas transition-colors"><User size={20} /> Sign In</Link>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-2 border-b border-app-border">
                      <p className="font-medium text-app-green">{user.name}</p>
                      <p className="text-sm text-app-text-light truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to='/orders' onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-5 py-2.5 hover:bg-app-canvas transition-colors"><Package size={20} /> My Orders</Link>
                      <Link to='/addresses' onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-5 py-2.5 hover:bg-app-canvas transition-colors"><MapPin size={20} /> Addresses</Link>
                      {user.isAdmin && (
                        <Link to='/admin' onClick={() => setUserMenuOpen(false)} className="flex items-center gap-4 px-5 py-2.5 hover:bg-app-canvas transition-colors text-app-clay"><Shield size={20} /> Admin Panel</Link>
                      )}
                    </div>
                    <div className="border-t border-app-border pt-2">
                      <button onClick={handleLogout} className="flex w-full items-center gap-4 px-5 py-2.5 text-red-500 hover:bg-red-50 transition-colors"><LogOut size={20} /> Logout</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown: nav links + search, shown below the bar */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-app-border bg-app-canvas px-4 py-4 space-y-4">
          <form onSubmit={handleSearch}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for groceries..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-app-border rounded-full text-sm text-app-green focus:outline-none focus:border-app-clay transition-colors"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1 text-sm font-medium text-app-green/80">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-white transition-colors">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-white transition-colors">Products</Link>
            <Link to="/deals" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 rounded-lg hover:bg-white transition-colors">Deals</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;