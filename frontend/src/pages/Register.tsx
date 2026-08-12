import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { Cpu, Eye, EyeOff, Sparkles, ArrowRight, User, Mail, Lock, Phone, MessageSquare } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "UAE" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+81", country: "JP" },
  { code: "+65", country: "SG" },
];

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanedDigits = phone.replace(/\D/g, "");
    if (!cleanedDigits || cleanedDigits.length < 7 || cleanedDigits.length > 15) {
      setError("Please enter a valid phone number (7 to 15 digits).");
      return;
    }

    const fullWhatsAppNumber = `${countryCode}${cleanedDigits}`;

    try {
      setLoading(true);
      await registerUser({
        ...formData,
        whatsappNumber: fullWhatsAppNumber,
        whatsappOptIn,
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-black">

      {/* Left Column: Branding Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-zinc-800/80 bg-zinc-900/40 p-12 flex-col justify-between">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-cyan-600/20 to-emerald-600/20 blur-[130px] pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg">
            <Cpu size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SwarmOS</span>
        </Link>

        <div className="relative z-10 space-y-6 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 w-fit">
            <MessageSquare size={14} /> WhatsApp Integrated AI Swarm
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Deploy an Autonomous AI Engineering Team.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Create an account to turn natural language prompts into full-stack applications with real-time WhatsApp updates and mobile management.
          </p>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Full-Stack Agent Orchestration (Planner, Code, DB, QA)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>WhatsApp Pocket Control (Mock & Real Webhooks supported)</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} SwarmOS. Built for Hackathon Excellence.
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">

          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-bold text-white">SwarmOS</span>
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
            <p className="text-xs text-zinc-400">Join SwarmOS to deploy your AI development team</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/60 border border-red-500/40 p-3.5 text-xs text-red-300 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-zinc-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="text"
                  name="name"
                  placeholder="Alex Mercer"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-zinc-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-zinc-300">
                Password <span className="text-red-400">*</span>
              </label>
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

            {/* Phone Number */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-zinc-300">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-3 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.country})
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Permission Checkbox */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="whatsappOptIn"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="whatsappOptIn" className="text-xs text-zinc-300 cursor-pointer leading-snug">
                  I want to receive SwarmOS project updates and notifications through WhatsApp.
                </label>
              </div>
              <p className="text-[10px] text-zinc-500 pl-7">
                You can change this preference later in settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950 hover:brightness-110 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          <p className="text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}