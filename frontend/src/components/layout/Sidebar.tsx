import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Workspace",
      icon: Bot,
      path: "/workspace",
    },
    {
      name: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            SwarmOS
          </span>
        </Link>

        <p className="mt-1 text-xs text-zinc-400 font-medium">
          Multi-Agent AI Platform
        </p>

        {user && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-zinc-900 border border-zinc-800 p-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-white truncate">{user.name || "User"}</p>
              <p className="text-[10px] text-cyan-400 truncate">{user.email || ""}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 p-4">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}