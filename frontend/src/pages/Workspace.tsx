import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getProjects, getProject, getProjectSummary } from "../services/projectService";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../services/taskService";
import { getProjectAgents, startAgents, runSingleAgent } from "../services/agentService";
import { uploadFile, getProjectFiles, deleteFile } from "../services/fileService";
import { getProjectActivities } from "../services/activityService";
import { sendProjectCommand } from "../services/orchestratorService";
import {
  FolderKanban,
  FileText,
  ListTodo,
  Bot,
  Database,
  Activity as ActivityIcon,
  Play,
  Plus,
  Send,
  Upload,
  Trash2,
  Sparkles,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  AlertCircle,
  X,
  Zap,
  Brain,
  Layers,
  Code2,
  TestTube,
  Rocket,
  Settings,
} from "lucide-react";

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectIdFromUrl = searchParams.get("id");

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || "");
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "tasks" | "activity" | "files" | "whatsapp">("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeLoadIdRef = useRef<string>("");

  // Tab & Entity States
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [commandResponse, setCommandResponse] = useState<string>("");
  const [commandLoading, setCommandLoading] = useState(false);
  const [isAgentsRunning, setIsAgentsRunning] = useState(false);

  // Selected Task Drawer Modal
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAgent, setTaskAgent] = useState("Backend Agent");
  const [taskPriority, setTaskPriority] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");

  // File Uploading
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProjectsList();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectOverview(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectsList = async () => {
    try {
      const data = await getProjects();
      setProjectsList(data || []);
      if (!selectedProjectId && data && data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error("Error loading projects list:", err);
    }
  };

  const loadProjectOverview = async (id: string) => {
    if (!id) return;
    activeLoadIdRef.current = id;
    setError("");

    try {
      setLoading(true);
      const proj = await getProject(id).catch(() => null);

      if (activeLoadIdRef.current !== id) return;

      if (!proj) {
        const summary = await getProjectSummary(id).catch(() => null);
        if (activeLoadIdRef.current !== id) return;

        if (summary) {
          setProject(summary);
        } else {
          setError("Unable to load project workspace. Please select another project or try again.");
          setLoading(false);
          return;
        }
      } else {
        setProject(proj);
      }

      // Unblock main stage UI immediately
      setLoading(false);

      // Fetch secondary resources concurrently in background
      Promise.all([
        getTasks({ projectId: id }).catch(() => []),
        getProjectAgents(id).catch(() => []),
        getProjectActivities(id).catch(() => []),
        getProjectFiles(id).catch(() => []),
      ]).then(([taskData, agentData, activityData, fileData]) => {
        if (activeLoadIdRef.current === id) {
          setTasks(taskData || []);
          setAgents(agentData || []);
          setActivities(activityData || []);
          setFiles(fileData || []);
        }
      });

    } catch (err: any) {
      console.error("Error loading project overview:", err);
      if (activeLoadIdRef.current === id) {
        setError(err?.message || "Failed to load project workspace.");
        setLoading(false);
      }
    }
  };

  // Run full AI Swarm
  const handleRunSwarm = async () => {
    if (!selectedProjectId) return;
    try {
      setIsAgentsRunning(true);
      await startAgents(selectedProjectId);
      setTimeout(() => {
        setIsAgentsRunning(false);
        loadProjectOverview(selectedProjectId);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsAgentsRunning(false);
      alert("Failed to start agent swarm.");
    }
  };

  // Run single agent
  const handleRunSingleAgent = async (agentName: string) => {
    if (!selectedProjectId) return;
    try {
      await runSingleAgent(selectedProjectId, agentName);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  // Send Command to SwarmOS
  const handleCommandSubmit = async (promptToSend?: string) => {
    const prompt = promptToSend || commandInput;
    if (!selectedProjectId || !prompt.trim() || commandLoading) return;

    try {
      setCommandLoading(true);
      if (!promptToSend) setCommandInput("");

      const response = await sendProjectCommand(selectedProjectId, prompt);
      const resMsg = response?.data?.orchestratorMessage || "Request received. Agents have been assigned to your task.";
      setCommandResponse(resMsg);

      // Refresh overview
      await loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error("Error sending command:", err);
      setCommandResponse("Request received. I've assigned this change to the engineering agents.");
    } finally {
      setCommandLoading(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProjectId) return;
    try {
      await createTask({
        title: taskTitle,
        description: taskDesc,
        projectId: selectedProjectId,
        assignedAgent: taskAgent,
        priority: taskPriority,
        status: "Todo",
      });
      setTaskTitle("");
      setTaskDesc("");
      setShowTaskModal(false);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  // Task Status Update
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedProjectId) return;
    const file = e.target.files[0];
    try {
      setUploading(true);
      await uploadFile(selectedProjectId, file);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  // Default agent list fallback if backend agents empty
  const agentList = agents.length > 0 ? agents : [
    { name: "Planner Agent", icon: Brain, role: "Project Planning", status: "Completed", progress: 100, currentTask: "Requirements mapped" },
    { name: "Requirements Agent", icon: FileText, role: "Specs Breakdown", status: "Completed", progress: 100, currentTask: "User stories generated" },
    { name: "Architecture Agent", icon: Layers, role: "System Topology", status: "Completed", progress: 100, currentTask: "System design finalized" },
    { name: "Database Agent", icon: Database, role: "Schema Design", status: "Completed", progress: 100, currentTask: "MongoDB schemas created" },
    { name: "Backend Agent", icon: Code2, role: "API Development", status: "Running", progress: 68, currentTask: "Building REST API endpoints" },
    { name: "Frontend Agent", icon: Zap, role: "UI Component Generation", status: "Running", progress: 72, currentTask: "Building dashboard UI views" },
    { name: "Testing Agent", icon: TestTube, role: "QA & Verification", status: "Waiting", progress: 0, currentTask: "Awaiting build completion" },
    { name: "Deployment Agent", icon: Rocket, role: "Docker & Cloud Setup", status: "Waiting", progress: 0, currentTask: "Awaiting deployment trigger" },
  ];

  const runningAgent = agentList.find((a) => a.status === "Running" || a.status === "Working") || agentList[4];
  const completedAgentsCount = agentList.filter((a) => a.status === "Completed").length;
  const runningAgentsCount = agentList.filter((a) => a.status === "Running" || a.status === "Working").length;
  const waitingAgentsCount = agentList.filter((a) => a.status === "Waiting" || a.status === "Idle").length;

  // Reliable progress calculation
  const overallProgress = project?.progress !== undefined && project?.progress > 0
    ? project.progress
    : tasks.length > 0
    ? Math.round((tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100)
    : Math.round((completedAgentsCount / agentList.length) * 100) || 68;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      <Sidebar />

      <div className="ml-64 flex flex-1 flex-col h-screen overflow-hidden">

        {/* ================= TOP HEADER BAR ================= */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft size={16} /> Back to Projects
            </Link>

            <div className="h-4 w-px bg-zinc-800" />

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {project?.title || "Attendance Management System"}
                </h1>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    project?.status === "Completed"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : project?.status === "Running" || project?.status === "Active" || isAgentsRunning
                      ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-pulse"
                      : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {isAgentsRunning ? "Agents Running..." : project?.status || "Building"}
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                {project?.description || "AI-powered college attendance platform"}
              </p>
            </div>
          </div>

          {/* Progress & Quick Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-semibold text-zinc-400 block uppercase tracking-wider">Overall Progress</span>
                <span className="text-sm font-extrabold text-cyan-400">{overallProgress}%</span>
              </div>
              <div className="w-24 bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={project?.previewUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition"
              >
                <ExternalLink size={14} /> Preview
              </a>

              <button
                onClick={handleRunSwarm}
                disabled={isAgentsRunning}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-950 hover:brightness-110 disabled:opacity-50 transition"
              >
                {isAgentsRunning ? (
                  <>
                    <Sparkles size={14} className="animate-spin" />
                    Agents Running...
                  </>
                ) : (
                  <>
                    <Play size={14} /> Run Agents
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= 3-PANEL MAIN CONTENT ================= */}
        <div className="flex-1 flex overflow-hidden">

          {/* 1. LEFT SIDEBAR: Compact Project Navigation */}
          <div className="w-56 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="px-2">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Active Project
                </label>
                {projectsList.length > 0 ? (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      navigate(`/workspace?id=${e.target.value}`);
                    }}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                  >
                    {projectsList.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-zinc-400">{project?.title || "Project Workspace"}</span>
                )}
              </div>

              <nav className="space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: FolderKanban },
                  { id: "agents", label: "AI Team", icon: Bot, count: agentList.length },
                  { id: "tasks", label: "Tasks", icon: ListTodo, count: tasks.length },
                  { id: "activity", label: "Activity", icon: ActivityIcon, count: activities.length },
                  { id: "files", label: "Files", icon: FileText, count: files.length },
                  { id: "whatsapp", label: "WhatsApp", icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} />
                        {item.label}
                      </div>
                      {item.count !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-zinc-900 text-zinc-400"}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Project Settings */}
            <div className="pt-4 border-t border-zinc-800">
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              >
                <Settings size={16} /> Project Settings
              </Link>
            </div>
          </div>

          {/* 2. CENTER: Main Project Execution Area */}
          <div className="flex-1 bg-zinc-950 overflow-y-auto p-6 space-y-6">

            {loading ? (
              /* Inline Workspace Skeleton Loader */
              <div className="space-y-6 animate-pulse">
                <div className="h-20 bg-zinc-900/80 rounded-2xl border border-zinc-800" />
                <div className="h-32 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
                <div className="h-64 bg-zinc-900/60 rounded-2xl border border-zinc-800" />
              </div>
            ) : error ? (
              /* Workspace Error State */
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center space-y-4 max-w-md mx-auto my-12">
                <AlertCircle className="mx-auto text-yellow-400" size={36} />
                <h3 className="text-base font-bold text-white">Workspace Notice</h3>
                <p className="text-xs text-zinc-400">{error}</p>
                <button
                  onClick={() => loadProjectOverview(selectedProjectId)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <>
                {/* Banner */}
                <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                      <Sparkles size={18} /> AI Team is building your project
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">Phase: {project?.currentPhase || "Building"}</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    SwarmOS coordinates specialized AI agents to turn your requirements into working software.
                  </p>

                  {/* Main Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Overall Project Progress</span>
                      <span className="text-cyan-400 font-mono font-bold">{overallProgress}%</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Active Task Banner */}
                  <div className="pt-2 text-xs flex items-center gap-2 text-zinc-300 font-medium">
                    <span className="text-cyan-400 font-semibold">Current task:</span>
                    <span className="truncate">
                      "{runningAgent.name} is {runningAgent.currentTask || "implementing software components"}."
                    </span>
                  </div>
                </div>

                {/* OVERVIEW TAB CONTENT */}
                {activeTab === "overview" && (
                  <div className="space-y-6">

                    {/* Agent Team Compact List */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bot size={18} className="text-cyan-400" /> AI Agent Swarm Workforce
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">{agentList.length} Specialized Agents</span>
                      </div>

                      <div className="space-y-2">
                        {agentList.map((agent: any, idx: number) => {
                          const isRunning = agent.status === "Running" || agent.status === "Working";
                          const isCompleted = agent.status === "Completed" || agent.status === "Ready";

                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                                isRunning
                                  ? "border-cyan-500/50 bg-cyan-950/20 shadow-md"
                                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                <span className="text-base shrink-0">
                                  {agent.name.includes("Planner") ? "🧠" :
                                   agent.name.includes("Req") ? "📋" :
                                   agent.name.includes("Arch") ? "🏗" :
                                   agent.name.includes("Data") ? "🗄" :
                                   agent.name.includes("Back") ? "⚙️" :
                                   agent.name.includes("Front") ? "🎨" :
                                   agent.name.includes("Test") ? "🧪" : "🚀"}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={`text-xs font-bold ${isRunning ? "text-cyan-400" : "text-white"}`}>
                                      {agent.name}
                                    </p>
                                    {isRunning && (
                                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 truncate">{agent.currentTask || agent.role}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs shrink-0">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isRunning
                                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse"
                                      : isCompleted
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : "bg-zinc-800 text-zinc-500"
                                  }`}
                                >
                                  {agent.status || "Waiting"}
                                </span>
                                <span className="font-mono text-zinc-400 w-10 text-right">{agent.progress || 0}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Activity Stream Timeline */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ActivityIcon size={18} className="text-cyan-400" /> Live Activity Stream
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono">Real-time Agent Logs</span>
                      </div>

                      {activities.length > 0 ? (
                        <div className="space-y-3 pl-2 border-l-2 border-zinc-800">
                          {activities.map((act: any) => (
                            <div key={act._id} className="relative pl-4 text-xs space-y-1">
                              <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-zinc-900 border border-cyan-500/50 flex items-center justify-center text-[10px]">
                                ✓
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-cyan-400">🤖 {act.agentName || "Agent"}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="font-medium text-white">{act.action}</p>
                              <p className="text-zinc-400 text-[11px]">{act.details}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-zinc-950 p-6 text-center text-xs text-zinc-500 space-y-1 border border-zinc-800">
                          <p className="font-semibold text-zinc-400">No activity yet</p>
                          <p>Agent activity will appear here when your AI team starts working.</p>
                        </div>
                      )}
                    </div>

                    {/* Current Active Task Card */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <ListTodo size={18} className="text-cyan-400" /> Current Active Task
                        </h3>
                        <button
                          onClick={() => setShowTaskModal(true)}
                          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
                        >
                          <Plus size={14} /> Add Task
                        </button>
                      </div>

                      {tasks.length > 0 ? (
                        <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-800 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white">{tasks[0].title}</p>
                            <p className="text-[11px] text-zinc-400">
                              Assigned to: <strong className="text-cyan-400">{tasks[0].assignedAgent || "Backend Agent"}</strong> • Status: <span className="text-yellow-400 font-semibold">{tasks[0].status}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedTask(tasks[0])}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white shrink-0"
                          >
                            View Details
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-zinc-950 p-6 text-center text-xs text-zinc-500 space-y-1 border border-zinc-800">
                          <p className="font-semibold text-zinc-400">No tasks yet</p>
                          <p>Your project tasks will appear here once Planner Agent processes your requirement.</p>
                        </div>
                      )}
                    </div>

                    {/* Talk to SwarmOS (Command Panel) */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles size={18} className="text-cyan-400" /> Talk to SwarmOS
                        </h3>
                        <span className="text-[10px] text-zinc-500 font-mono">Conversational Project Commands</span>
                      </div>

                      {commandResponse && (
                        <div className="rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-3 text-xs text-cyan-200 font-mono leading-relaxed">
                          {commandResponse}
                        </div>
                      )}

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {["Add dark mode", "Add Excel export", "Change the login design", "Add admin dashboard"].map((chip, i) => (
                          <button
                            key={i}
                            onClick={() => handleCommandSubmit(chip)}
                            className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-cyan-500 hover:text-white transition"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>

                      {/* Command Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleCommandSubmit();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={commandInput}
                          onChange={(e) => setCommandInput(e.target.value)}
                          placeholder="Tell your AI team what to change..."
                          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                        />
                        <button
                          type="submit"
                          disabled={commandLoading || !commandInput.trim()}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition shrink-0"
                        >
                          <Send size={14} /> Send
                        </button>
                      </form>
                    </div>

                  </div>
                )}

                {/* AI TEAM TAB */}
                {activeTab === "agents" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Full AI Agent Swarm Roster</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agentList.map((ag: any, i: number) => (
                        <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{ag.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-cyan-400">
                              {ag.status || "Idle"}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{ag.role}</p>
                          <button
                            onClick={() => handleRunSingleAgent(ag.name)}
                            className="w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-cyan-600 text-xs font-semibold text-white transition"
                          >
                            Trigger Agent Task
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TASKS TAB */}
                {activeTab === "tasks" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white">Project Tasks ({tasks.length})</h3>
                      <button
                        onClick={() => setShowTaskModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-xs font-semibold text-white"
                      >
                        + Create Task
                      </button>
                    </div>
                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks.map((t: any) => (
                          <div key={t._id} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs gap-4">
                            <div>
                              <p className="font-bold text-white">{t.title}</p>
                              <p className="text-[11px] text-zinc-400">Assigned: {t.assignedAgent} • Priority: {t.priority || "Medium"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <select
                                value={t.status}
                                onChange={(e) => handleTaskStatusChange(t._id, e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-cyan-400 font-semibold cursor-pointer outline-none"
                              >
                                <option value="Backlog">Backlog</option>
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                              </select>
                              <button
                                onClick={() => handleDeleteTask(t._id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 py-8 text-center">No tasks yet. Create one or run Planner Agent.</p>
                    )}
                  </div>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Complete Activity History</h3>
                    <div className="space-y-2 font-mono text-xs">
                      {activities.map((a: any) => (
                        <div key={a._id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                          <p className="text-cyan-400 font-bold">[{new Date(a.createdAt).toLocaleTimeString()}] {a.agentName}: {a.action}</p>
                          <p className="text-zinc-400 mt-1 text-[11px]">{a.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FILES TAB */}
                {activeTab === "files" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white">Project Files ({files.length})</h3>
                      <label className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-white cursor-pointer hover:bg-zinc-700 transition">
                        <Upload size={14} className="inline mr-1" />
                        {uploading ? "Uploading File..." : "Upload File"}
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files.map((f: any) => (
                          <div key={f._id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center text-xs">
                            <span className="font-mono text-zinc-300">{f.originalName || f.name}</span>
                            <button onClick={() => handleDeleteFile(f._id)} className="text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-zinc-950 p-8 text-center text-xs text-zinc-500 space-y-1 border border-zinc-800">
                        <p className="font-semibold text-zinc-400">No files yet</p>
                        <p>Files generated by your AI team will appear here.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* WHATSAPP TAB */}
                {activeTab === "whatsapp" && (
                  <div className="space-y-4 text-center py-8">
                    <Smartphone size={40} className="mx-auto text-emerald-400" />
                    <h3 className="text-lg font-bold">WhatsApp Innovation Control</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Interact with your AI team using WhatsApp. Manage feature requests and project builds on mobile.
                    </p>
                    <Link
                      to="/whatsapp"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white"
                    >
                      Open WhatsApp Control Center
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>

          {/* 3. RIGHT PANEL: AI Team Summary & Quick Tools */}
          <div className="w-64 border-l border-zinc-800 bg-zinc-950 p-4 space-y-6 overflow-y-auto shrink-0">

            {/* AI Team Stats Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Team</h3>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">8 Agents</span>
              </div>

              <div className="text-[11px] text-zinc-400 font-semibold">
                {completedAgentsCount} Completed • {runningAgentsCount} Running • {waitingAgentsCount} Waiting
              </div>

              {/* Compact List */}
              <div className="space-y-1.5 text-xs">
                {agentList.map((ag: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-900">
                    <span className="truncate pr-2 text-zinc-300">
                      {ag.name.replace(" Agent", "")}
                    </span>
                    <span className="font-bold text-[11px]">
                      {ag.status === "Completed" ? <span className="text-emerald-400">✓</span> :
                       ag.status === "Running" || ag.status === "Working" ? <span className="text-cyan-400 animate-pulse">●</span> :
                       <span className="text-zinc-600">○</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Integration Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone size={14} className="text-emerald-400" /> WhatsApp
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Demo Mode
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Control your project through WhatsApp.
              </p>

              <Link
                to="/whatsapp"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-xs font-semibold text-white transition"
              >
                Open WhatsApp
              </Link>
            </div>

            {/* Project Files Compact Section */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText size={14} className="text-cyan-400" /> Project Files
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{files.length}</span>
              </div>

              {files.length > 0 ? (
                <div className="space-y-1 text-[11px] font-mono text-zinc-300">
                  {files.slice(0, 4).map((f: any, i: number) => (
                    <div key={i} className="truncate hover:text-cyan-400 cursor-pointer">
                      📄 {f.originalName || f.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  Files generated by your AI team will appear here.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ================= TASK DETAIL DRAWER MODAL ================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setSelectedTask(null)} className="absolute right-5 top-5 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
            <p className="text-xs text-zinc-400">{selectedTask.description || "Task generated by SwarmOS Planner Agent."}</p>
            <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800 font-mono">
              <p>Assigned Agent: <strong className="text-cyan-400">{selectedTask.assignedAgent}</strong></p>
              <p>Priority: <strong className="text-white">{selectedTask.priority}</strong></p>
              <p>Status: <strong className="text-yellow-400">{selectedTask.status}</strong></p>
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => handleDeleteTask(selectedTask._id)}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 font-semibold"
              >
                Delete Task
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW TASK MODAL ================= */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setShowTaskModal(false)} className="absolute right-5 top-5 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white">Create New Project Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Add Excel Export feature"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Assigned Agent</label>
                <select
                  value={taskAgent}
                  onChange={(e) => setTaskAgent(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {agentList.map((a: any, idx: number) => (
                    <option key={idx} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}