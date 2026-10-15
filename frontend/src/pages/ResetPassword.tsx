import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bike } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      toast.success("Password reset — please sign in");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
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
          <h1 className="font-serif text-2xl text-app-green mb-2">Set a new password</h1>
          <p className="text-app-text-light">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={6}
            className="w-full p-3 border border-app-border rounded-lg outline-none focus:border-app-clay transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-app-green text-white p-3 rounded-lg font-medium hover:bg-app-clay transition-colors disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;