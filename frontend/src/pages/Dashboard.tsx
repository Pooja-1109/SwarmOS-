import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getDashboard } from "../services/dashboardService";
import { createProject } from "../services/projectService";
import { useAuth } from "../context/AuthContext";
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
  X,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [category, setCategory] = useState("Web App");
  const [creating, setCreating] = useState(false);
  const [assemblingMsg, setAssemblingMsg] = useState("");

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = ideaPrompt.trim();
    if (!prompt) return;

    try {
      setCreating(true);
      setAssemblingMsg("SwarmOS is assembling your AI team...");

      const title = projectTitle.trim() || prompt.slice(0, 30) + "...";
      const newProj = await createProject({
        title,
        description: prompt,
        category,
        requirements: prompt,
      });

      setTimeout(() => {
        navigate(`/workspace?id=${newProj._id}`);
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create project:", err);
      alert(err.response?.data?.message || "Failed to create project.");
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-cyan-500 selection:text-black font-sans">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.name || "Developer"}</span> 👋
              </h1>
            </div>
            <p className="mt-1 text-xs text-zinc-400 font-medium">
              Your AI teams are ready to build. Manage software projects & multi-agent execution swarms.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-cyan-950 hover:brightness-110 transition"
          >
            <Plus size={18} />
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
              <Sparkles className="animate-spin" size={22} />
              Loading SwarmOS platform metrics...
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
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Projects</p>
                    <p className="text-3xl font-extrabold text-white mt-1.5">{dashboard.totalProjects || 0}</p>
                    <p className="text-[10px] text-cyan-400 mt-1 font-mono">Managed in SwarmOS</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <FolderKanban size={24} />
                  </div>
                </div>

                {/* Running Swarms */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Running Agents</p>
                    <p className="text-3xl font-extrabold text-yellow-400 mt-1.5">{dashboard.runningProjects || 0}</p>
                    <p className="text-[10px] text-yellow-400/80 mt-1 font-mono">Active multi-agent tasks</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    <Play size={24} />
                  </div>
                </div>

                {/* Completed */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Completed Projects</p>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1.5">{dashboard.completedProjects || 0}</p>
                    <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">100% agent completion</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                {/* Active AI Workforce */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Swarm Workforce</p>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1.5">8 Agents</p>
                    <p className="text-[10px] text-cyan-400/80 mt-1 font-mono">Planner to Deployment</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Bot size={24} />
                  </div>
                </div>
              </div>

              {/* Tasks Summary Bar */}
              <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ListTodo className="text-cyan-400" size={18} />
                    <span className="font-bold text-white">Overall Agent Task Completion</span>
                  </div>
                  <span className="font-mono text-zinc-400">
                    {dashboard.completedTasks || 0} / {dashboard.totalTasks || 0} Tasks Completed
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
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
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FolderKanban className="text-cyan-400" size={20} />
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
                        className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 hover:border-zinc-700 transition shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                              {project.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                              {project.category || "Web App"}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                project.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : project.status === "Running" || project.status === "Active"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 line-clamp-1">{project.description}</p>

                          <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
                            <span>Progress: <strong className="text-cyan-400">{project.progress || 0}%</strong></span>
                            <span>Phase: <strong className="text-zinc-300">{project.currentPhase || "Planning"}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/workspace?id=${project._id}`)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition shrink-0"
                        >
                          <Bot size={16} />
                          Open Workspace
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center space-y-3">
                      <FolderKanban className="mx-auto text-zinc-600" size={40} />
                      <p className="text-base font-bold text-zinc-300">No Active Projects</p>
                      <p className="text-xs text-zinc-500">Click "+ New Project" to start building with your AI swarm team.</p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        + New Project
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Activity Stream (1 col) */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ActivityIcon className="text-cyan-400" size={20} />
                    Live Agent Activity
                  </h2>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 max-h-[480px] overflow-y-auto">
                    {dashboard.recentActivities?.length > 0 ? (
                      dashboard.recentActivities.map((act: any) => (
                        <div key={act._id} className="border-b border-zinc-800/80 pb-3 last:border-0 last:pb-0 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                              🤖 {act.agentName || "Swarm Agent"}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-white">{act.action}</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{act.details}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-8">No recent activity logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>

      {/* ================= NEW PROJECT MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white">
                <Zap size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create New AI Project</h3>
                <p className="text-xs text-zinc-400">Describe your concept and let SwarmOS assemble your AI team</p>
              </div>
            </div>

            {creating ? (
              <div className="py-12 text-center space-y-4">
                <Sparkles size={36} className="animate-spin text-cyan-400 mx-auto" />
                <p className="text-lg font-bold text-white">{assemblingMsg}</p>
                <p className="text-xs text-zinc-400 font-mono">Initializing Planner, Architect & Code agents...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    What do you want to build? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={ideaPrompt}
                    onChange={(e) => setIdeaPrompt(e.target.value)}
                    placeholder="Build an attendance management system where students can mark attendance, teachers can manage classes, and administrators can view reports..."
                    required
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3.5 text-sm text-white outline-none focus:border-cyan-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Project Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Attendance System"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-white outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Web App">Web App</option>
                      <option value="AI Model">AI Model</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Pipeline">Data Pipeline</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
                  >
                    <Sparkles size={14} />
                    Start AI Team
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}