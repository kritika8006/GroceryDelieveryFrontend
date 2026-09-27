import { useState } from "react";
import { Link } from "react-router-dom";
import { Bike } from "lucide-react";
import { assets } from "../assets/assets"; // Path check kar lein

const Login = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 1 second wait simulation
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* --- Left Side (Hero Section) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-900 relative items-center justify-center">
        <img
          src={assets.hero_bg}
          alt="Grocery Background"
          className="absolute inset-0 object-cover h-full w-full opacity-30"
        />
        <div className="relative text-center px-12 text-white z-10">
          <h2 className="text-4xl font-semibold mb-4">Welcome back to Instacart</h2>
          <p className="text-lg">Fresh groceries and organic produce, delivered to your doorstep.</p>
        </div>
      </div>

      {/* --- Right Side (Form Section) --- */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#F9F7F2]">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Bike className="size-8 text-green-700" />
              <span className="text-2xl font-semibold text-green-700">Instacart</span>
            </Link>

            <h1 className="text-2xl font-semibold text-green-700 mb-2">
              {isLoginState ? "Sign in to your account" : "Sign up for an account"}
            </h1>
            <p className="text-gray-600">
              {isLoginState ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLoginState(!isLoginState)}
                className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-colors"
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
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3022] text-white p-3 rounded-lg font-bold hover:bg-green-900 transition-all"
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