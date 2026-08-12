import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { Cpu, Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const data = await loginUser(formData);

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Login Error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-black">

      {/* Left Column: Branding Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-zinc-800/80 bg-zinc-900/40 p-12 flex-col justify-between">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-cyan-600/20 to-purple-600/20 blur-[130px] pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg">
            <Cpu size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SwarmOS</span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
            Autonomous Software Platform
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Manage your AI Agent Swarm from Anywhere.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Log in to monitor live project progress, inspect generated backend code & database schemas, or chat with your AI team via WhatsApp.
          </p>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-mono text-[11px]">
              <span>🤖 SWARM ORCHESTRATOR</span>
              <span>READY</span>
            </div>
            <p className="text-zinc-400 font-mono">"Planner, Requirements & Code agents active for your project..."</p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} SwarmOS. Built for Next-Gen Engineering.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo header for small screens */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-bold text-white">SwarmOS</span>
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
            <p className="text-xs text-zinc-400">Sign in to your SwarmOS AI developer workspace</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/60 border border-red-500/40 p-3.5 text-xs text-red-300 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-10 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950 hover:brightness-110 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-400">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Create an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}