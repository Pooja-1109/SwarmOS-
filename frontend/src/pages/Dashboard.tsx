import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getDashboard } from "../services/dashboardService";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Play,
  Bot,
  ListTodo,
  ArrowRight,
  Plus,
  Activity as ActivityIcon,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              📊 Platform Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Overview of AI Swarm Agent activity, active projects, and system task metrics.
            </p>
          </div>

          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:brightness-110 transition"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-cyan-400 font-semibold">
              <Sparkles className="animate-spin" size={24} />
              Loading real-time metrics...
            </div>
          </div>
        ) : (
          dashboard && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Projects */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Projects</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{dashboard.totalProjects || 0}</p>
                    <p className="text-[11px] text-cyan-400 mt-1 font-medium">In MongoDB storage</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <FolderKanban size={26} />
                  </div>
                </div>

                {/* Active / Running */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Running Swarms</p>
                    <p className="text-3xl font-extrabold text-yellow-400 mt-2">{dashboard.runningProjects || 0}</p>
                    <p className="text-[11px] text-yellow-400/80 mt-1 font-medium">Active multi-agent work</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    <Play size={26} />
                  </div>
                </div>

                {/* Completed */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed Projects</p>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-2">{dashboard.completedProjects || 0}</p>
                    <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">100% Task completion</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={26} />
                  </div>
                </div>

                {/* Active AI Agents */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active AI Agents</p>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-2">{dashboard.activeAgentsCount || 9}</p>
                    <p className="text-[11px] text-cyan-400/80 mt-1 font-medium">Autonomous workforce</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Bot size={26} />
                  </div>
                </div>
              </div>

              {/* Tasks Quick Overview */}
              <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTodo className="text-cyan-400" size={20} />
                    <h2 className="text-lg font-bold">Tasks Completion Summary</h2>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400">
                    {dashboard.completedTasks || 0} / {dashboard.totalTasks || 0} Tasks Completed
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${dashboard.totalTasks ? Math.round((dashboard.completedTasks / dashboard.totalTasks) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FolderKanban className="text-cyan-400" size={22} />
                      Recent Projects
                    </h2>
                    <Link to="/projects" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>

                  {dashboard.recentProjects?.length > 0 ? (
                    dashboard.recentProjects.map((project: any) => (
                      <div
                        key={project._id}
                        className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 hover:border-zinc-700 transition shadow-lg flex items-center justify-between"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                              {project.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                              {project.category || "Web App"}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                project.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : project.status === "Running"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 mt-2 line-clamp-1">{project.description}</p>

                          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                            <span>Progress: <strong className="text-cyan-400">{project.progress || 0}%</strong></span>
                            <span>Priority: <strong className="text-white">{project.priority || "Medium"}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/workspace?id=${project._id}`)}
                          className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition"
                        >
                          <Bot size={16} />
                          Workspace
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
                      <FolderKanban className="mx-auto text-zinc-600 mb-3" size={40} />
                      <p className="text-lg font-bold text-zinc-300">No Projects Found</p>
                      <p className="text-xs text-zinc-500 mt-1">Create your first AI software engineering project to begin.</p>
                    </div>
                  )}
                </div>

                {/* Activity Log Feed (1 col) */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ActivityIcon className="text-cyan-400" size={22} />
                    Live Activity Stream
                  </h2>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 max-h-[500px] overflow-y-auto">
                    {dashboard.recentActivities?.length > 0 ? (
                      dashboard.recentActivities.map((act: any) => (
                        <div key={act._id} className="border-b border-zinc-800/80 pb-3.5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-cyan-400 flex items-center gap-1">
                              🤖 {act.agentName || "Agent"}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-white">{act.action}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{act.details}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-6">No recent activity logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}