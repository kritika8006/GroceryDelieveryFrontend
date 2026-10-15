import { useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-app-canvas">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Bike className="size-8 text-app-clay" />
            <span className="font-serif text-2xl text-app-green">Instacart</span>
          </Link>
          <h1 className="font-serif text-2xl text-app-green mb-2">Reset your password</h1>
          <p className="text-app-text-light">
            Enter your account email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-white p-6 rounded-2xl border border-app-border text-center space-y-3">
            <Mail className="size-10 text-app-moss mx-auto" />
            <p className="text-app-green font-medium">Check for a reset link</p>
            <p className="text-sm text-app-text-light">
              If an account exists for <b>{email}</b>, a reset link has been sent. It expires in 1 hour.
            </p>
            <Link to="/login" className="inline-block text-app-clay font-medium hover:text-app-clay-dark transition-colors">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-green text-white p-3 rounded-lg font-medium hover:bg-app-clay transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <Link to="/login" className="block text-center text-sm text-app-text-light hover:text-app-green transition-colors">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;