import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bike } from "lucide-react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginState) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* --- Left Side (Hero Section) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center overflow-hidden">
        <img
          src={assets.hero_bg}
          alt="Grocery Background"
          className="absolute inset-0 object-cover h-full w-full opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-app-green via-app-green/40 to-transparent" />
        <div className="relative text-center px-12 text-white z-10">
          <p className="text-app-gold text-sm font-medium mb-4 tracking-wide">Farm-fresh, organic, delivered today</p>
          <h2 className="font-serif text-4xl mb-4">Welcome back to Instacart</h2>
          <p className="text-lg text-white/75">Fresh groceries and organic produce, delivered to your doorstep.</p>
        </div>
      </div>

      {/* --- Right Side (Form Section) --- */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-app-canvas">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Bike className="size-8 text-app-clay" />
              <span className="font-serif text-2xl text-app-green">Instacart</span>
            </Link>

            <h1 className="font-serif text-2xl text-app-green mb-2">
              {isLoginState ? "Sign in to your account" : "Sign up for an account"}
            </h1>
            <p className="text-app-text-light">
              {isLoginState ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLoginState(!isLoginState)}
                className="text-app-clay ml-1 font-medium hover:text-app-clay-dark transition-colors"
              >
                {isLoginState ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginState && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
              required
            />
            {isLoginState && (
  <div className="text-right">
    <Link to="/forgot-password" className="text-sm text-app-text-light hover:text-app-clay transition-colors">
      Forgot password?
    </Link>
  </div>
)}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-green text-white p-3 rounded-lg font-medium hover:bg-app-clay transition-colors disabled:opacity-60"
            >
              {loading ? "Loading..." : isLoginState ? "Sign In" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;