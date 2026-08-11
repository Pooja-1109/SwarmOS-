import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/authService";
import { User, Mail, Shield, CheckCircle, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "AI Engineer & Software Developer");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await getProfile();
      if (data) {
        setName(data.name || "");
        setBio(data.bio || "AI Engineer & Software Developer");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const res = await updateProfile({
        name,
        bio,
        password: password ? password : undefined,
      });

      if (res.user) {
        login(localStorage.getItem("token") || "", res.user);
        setSuccess("Profile updated successfully!");
        setPassword("");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="mb-8 text-4xl font-bold text-cyan-400">👤 User Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-cyan-600/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-3xl font-bold mb-4">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>

            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-zinc-400 text-sm mt-1">{email}</p>

            <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Shield size={14} />
              {user?.role || "Developer"} Mode
            </div>

            <p className="mt-6 text-zinc-300 text-sm leading-relaxed">{bio}</p>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 py-3 font-semibold hover:bg-red-600 hover:text-white transition"
            >
              <LogOut size={18} />
              Logout Account
            </button>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile Details</h2>

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 p-3 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Bio & Specialization</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-cyan-500"
                  placeholder="Describe your role and expertise..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
