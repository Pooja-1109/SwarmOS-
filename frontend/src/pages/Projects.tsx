import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import AgentStatus from "../components/AgentStatus";
import { startAgents } from "../services/agentService";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../services/projectService";
import {
  Plus,
  Search,
  Filter,
  Play,
  Bot,
  Trash2,
  FolderKanban,
  X,
  Sparkles,
} from "lucide-react";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");

  // Create Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web App");
  const [priority, setPriority] = useState("Medium");
  const [requirements, setRequirements] = useState("");
  const [creating, setCreating] = useState(false);

  // Load projects
  useEffect(() => {
    loadProjects();
  }, [search, statusFilter, priorityFilter, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects({
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
      });
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Create project
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setCreating(true);
      const newProj = await createProject({
        title,
        description,
        category,
        priority,
        requirements: requirements || description,
      });

      if (newProj && newProj._id) {
        // Automatically start AI multi-agent swarm generation
        await startAgents(newProj._id).catch((err) => console.warn("Swarm trigger notice:", err));
      }

      setTitle("");
      setDescription("");
      setRequirements("");
      setShowModal(false);

      loadProjects();
      if (newProj && newProj._id) {
        navigate(`/workspace?id=${newProj._id}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  // Delete project
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks, files, and chat data will be removed.")) return;

    try {
      await deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error(error);
      alert("Unable to delete project.");
    }
  };

  // Run AI Swarm agents
  const handleRunAI = async (id: string) => {
    try {
      await startAgents(id);
      alert("🚀 Multi-Agent Swarm Started! Navigating to Workspace...");
      navigate(`/workspace?id=${id}`);
    } catch (error) {
      console.error(error);
      alert("Unable to start AI agents.");
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              📂 AI Projects
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your autonomous software engineering swarms and repositories.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:brightness-110 transition"
          >
            <Plus size={18} />
            Create New Project
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Filter size={14} /> Status:
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              Priority:
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              Sort By:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none"
              >
                <option value="createdAt">Newest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="progress">Progress (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="text-cyan-400" size={22} />
                  Initialize AI Project Swarm
                </h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Project Title *</label>
                  <input
                    required
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm outline-none focus:border-cyan-500"
                    placeholder="e.g. AI Resume Analyzer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm outline-none"
                    >
                      <option value="Web App">Web App</option>
                      <option value="AI Model">AI Model</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Pipeline">Data Pipeline</option>
                      <option value="E-Commerce">E-Commerce</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Project Overview *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm outline-none focus:border-cyan-500"
                    placeholder="Short summary of goals and stack..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Functional Requirements (Optional for Planner Agent)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm outline-none focus:border-cyan-500"
                    placeholder="1. User Auth\n2. Resume parsing\n3. Match scoring..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-800 text-xs font-semibold hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 text-xs font-semibold text-white hover:bg-cyan-500 transition"
                  >
                    {creating ? "Creating..." : "Initialize Swarm Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects List Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-cyan-400 font-semibold">
            Loading projects...
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl flex flex-col justify-between hover:border-zinc-700 transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          {project.category || "Web App"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          {project.priority || "Medium"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === "Completed"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : project.status === "Running"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                          : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-xs text-zinc-400">
                      <span>Overall Completion</span>
                      <span className="font-bold text-cyan-400">{project.progress || 0}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Agents Quick List */}
                  <div className="mt-6">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Multi-Agent Swarm Status
                    </p>
                    <AgentStatus agents={project.agents || []} />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunAI(project._id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                    >
                      <Play size={14} />
                      Run Swarm
                    </button>

                    <button
                      onClick={() => navigate(`/workspace?id=${project._id}`)}
                      className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-md shadow-cyan-900/20"
                    >
                      <Bot size={14} />
                      Open Workspace
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-2 rounded-xl bg-red-950/30 text-red-400 hover:bg-red-600 hover:text-white border border-red-800/30 transition"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <FolderKanban className="mx-auto text-zinc-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold">No Projects Found</h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              Create your first multi-agent project to start generating tasks, uploading docs, and running AI swarms.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-500 transition"
            >
              <Plus size={18} />
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
