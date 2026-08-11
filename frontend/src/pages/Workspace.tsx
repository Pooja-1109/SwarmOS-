import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { getProjects, getProject, getProjectSummary, updateProject } from "../services/projectService";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../services/taskService";
import { getProjectAgents, startAgents, runSingleAgent } from "../services/agentService";
import { uploadFile, getProjectFiles, deleteFile } from "../services/fileService";
import { sendChatMessage } from "../services/chatService";
import { getProjectAnalytics } from "../services/analyticsService";
import { getProjectActivities } from "../services/activityService";
import { sendProjectCommand, getProjectMemory, getProjectDecisions } from "../services/orchestratorService";
import { getRequirementTrace, getProjectQualityGate, runSelfHeal } from "../services/engineeringService";
import { runSecurityScan, getSecurityReport, runProjectTests, getProjectTestRuns } from "../services/securityService";
import { generateProjectResearch, getProjectResearch, createProjectVisualization, getProjectVisualizations, createProjectDocument, getProjectDocuments } from "../services/researchService";
import { getProjectChannels, upsertProjectChannel, syncProjectChannels, sendChannelProjectCommand, sendWhatsAppWebhook, sendVoiceWebhook } from "../services/channelService";
import {
  FolderKanban,
  FileText,
  ListTodo,
  Bot,
  Database,
  BarChart3,
  Activity as ActivityIcon,
  Play,
  Plus,
  Send,
  Upload,
  Trash2,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Shield,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectIdFromUrl = searchParams.get("id");

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || "");
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "requirements" | "kanban" | "agents" | "knowledge" | "analytics" | "activity" | "decisions" | "engineering" | "security" | "research" | "documentation" | "channels">("overview");

  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [requirementsText, setRequirementsText] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [commandResult, setCommandResult] = useState<any>(null);
  const [projectMemory, setProjectMemory] = useState<any[]>([]);
  const [projectDecisions, setProjectDecisions] = useState<any[]>([]);
  const [requirementTrace, setRequirementTrace] = useState<any[]>([]);
  const [qualityGate, setQualityGate] = useState<any>({});
  const [securityReport, setSecurityReport] = useState<any[]>([]);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [researchItems, setResearchItems] = useState<any[]>([]);
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const [documentArtifacts, setDocumentArtifacts] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelCommandInput, setChannelCommandInput] = useState("");
  const [channelCommandType, setChannelCommandType] = useState("whatsapp");

  // RAG Chat Panel
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // New Task Form Modal
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
    } else if (projectsList.length > 0) {
      setSelectedProjectId(projectsList[0]._id);
    }
  }, [selectedProjectId, projectsList]);

  const loadProjectsList = async () => {
    try {
      const data = await getProjects();
      setProjectsList(data);
      if (!selectedProjectId && data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch (err) {
      console.error("Error loading projects list:", err);
    }
  };

  const loadProjectOverview = async (id: string) => {
    try {
      setLoading(true);
      const [proj, summary, activityData, taskData, agentData] = await Promise.all([
        getProject(id).catch(() => null),
        getProjectSummary(id).catch(() => null),
        getProjectActivities(id).catch(() => []),
        getTasks({ projectId: id }).catch(() => []),
        getProjectAgents(id).catch(() => []),
      ]);

      const projectData = proj || summary || { title: "Project", description: "", requirements: "" };
      setProject(projectData);
      setRequirementsText(projectData.requirements || projectData.description || "");
      setActivities(activityData || []);
      setTasks(taskData || []);
      setAgents(agentData || []);
    } catch (err) {
      console.error("Error loading project overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTabData = async (id: string, tab: string) => {
    if (!id || !tab) return;

    try {
      if (tab === "requirements") {
        const proj = await getProject(id).catch(() => null);
        setRequirementsText(proj?.requirements || proj?.description || "");
        return;
      }

      if (tab === "kanban") {
        const taskData = await getTasks({ projectId: id }).catch(() => []);
        setTasks(taskData);
        return;
      }

      if (tab === "agents") {
        const agentData = await getProjectAgents(id).catch(() => []);
        setAgents(agentData);
        return;
      }

      if (tab === "knowledge") {
        const fileData = await getProjectFiles(id).catch(() => []);
        setFiles(fileData);
        return;
      }

      if (tab === "analytics") {
        const analyticsData = await getProjectAnalytics(id).catch(() => null);
        setAnalytics(analyticsData);
        return;
      }

      if (tab === "activity") {
        const activityData = await getProjectActivities(id).catch(() => []);
        setActivities(activityData);
        return;
      }

      if (tab === "decisions") {
        const [memoryData, decisionData] = await Promise.all([
          getProjectMemory(id).catch(() => ({ data: [] })),
          getProjectDecisions(id).catch(() => ({ data: [] })),
        ]);
        setProjectMemory(memoryData?.data || []);
        setProjectDecisions(decisionData?.data || []);
        return;
      }

      if (tab === "engineering") {
        const [traceData, qualityData] = await Promise.all([
          getRequirementTrace(id).catch(() => ({ data: [] })),
          getProjectQualityGate(id).catch(() => ({ data: {} })),
        ]);
        setRequirementTrace(traceData?.data || []);
        setQualityGate(qualityData?.data || {});
        return;
      }

      if (tab === "security") {
        const [secData, testData] = await Promise.all([
          getSecurityReport(id).catch(() => ({ data: [] })),
          getProjectTestRuns(id).catch(() => ({ data: [] })),
        ]);
        setSecurityReport(secData?.data || []);
        setTestRuns(testData?.data || []);
        return;
      }

      if (tab === "research") {
        const [researchData, visualData] = await Promise.all([
          getProjectResearch(id).catch(() => ({ data: [] })),
          getProjectVisualizations(id).catch(() => ({ data: [] })),
        ]);
        setResearchItems(researchData?.data || []);
        setVisualizations(visualData?.data || []);
        return;
      }

      if (tab === "documentation") {
        const docData = await getProjectDocuments(id).catch(() => ({ data: [] }));
        setDocumentArtifacts(docData?.data || []);
        return;
      }

      if (tab === "channels") {
        const channelData = await getProjectChannels(id).catch(() => ({ data: [] }));
        setChannels(channelData?.data || []);
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    }
  };

  // Run full AI Swarm
  const handleRunSwarm = async () => {
    if (!selectedProjectId) return;
    try {
      await startAgents(selectedProjectId);
      alert("🚀 Multi-Agent Swarm Started!");
      loadProjectOverview(selectedProjectId);
      if (activeTab === "kanban") loadProjectTabData(selectedProjectId, "kanban");
    } catch (err) {
      console.error(err);
      alert("Failed to start swarm.");
    }
  };

  // Run single agent
  const handleRunSingleAgent = async (agentName: string) => {
    if (!selectedProjectId) return;
    try {
      await runSingleAgent(selectedProjectId, agentName);
      loadProjectOverview(selectedProjectId);
      if (activeTab === "agents") loadProjectTabData(selectedProjectId, "agents");
    } catch (err) {
      console.error(err);
    }
  };

  // Save Requirements
  const handleSaveRequirements = async () => {
    if (!selectedProjectId) return;
    try {
      await updateProject(selectedProjectId, { requirements: requirementsText });
      alert("Requirements saved! Click 'Run Swarm' to parse tasks via Planner Agent.");
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
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
      loadProjectTabData(selectedProjectId, "kanban");
    } catch (err) {
      console.error(err);
    }
  };

  // Task Status Update (Kanban Drag/Click)
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadProjectOverview(selectedProjectId);
      loadProjectTabData(selectedProjectId, "kanban");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadProjectOverview(selectedProjectId);
      loadProjectTabData(selectedProjectId, "kanban");
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
      if (activeTab === "knowledge") loadProjectTabData(selectedProjectId, "knowledge");
    } catch (err) {
      console.error(err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      loadProjectOverview(selectedProjectId);
      if (activeTab === "knowledge") loadProjectTabData(selectedProjectId, "knowledge");
    } catch (err) {
      console.error(err);
    }
  };

  // Send RAG Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim() || !selectedProjectId || sendingMsg) return;

    try {
      setSendingMsg(true);
      if (!textToSend) setChatInput("");

      // Optimistic append user message
      setMessages((prev) => [...prev, { sender: "user", text: query, createdAt: new Date() }]);

      const res = await sendChatMessage(selectedProjectId, query);
      setMessages((prev) => [...prev.filter((m) => m._id || m.sender !== "user"), res]);
      loadProjectOverview(selectedProjectId);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Quick assistant prompt handler
  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedProjectId || !commandInput.trim()) return;

    try {
      const response = await sendProjectCommand(selectedProjectId, commandInput);
      setCommandResult(response.data || null);
      setCommandInput("");
      await loadProjectOverview(selectedProjectId);
      if (activeTab === "kanban") await loadProjectTabData(selectedProjectId, "kanban");
    } catch (err) {
      console.error(err);
      setCommandResult({ orchestratorMessage: "SwarmOS could not process that command right now." });
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Sidebar />

      {/* Main Workspace Layout (Left Sidebar + Main Stage + Right AI Assistant Drawer) */}
      <div className="ml-64 flex flex-1 overflow-hidden">
        {/* Workspace Left Navigation Bar */}
        <div className="w-64 border-r border-zinc-800/80 bg-zinc-900/90 flex flex-col justify-between shrink-0">
          <div>
            {/* Project Selector */}
            <div className="p-4 border-b border-zinc-800">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Select Active Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  navigate(`/workspace?id=${e.target.value}`);
                }}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-semibold"
              >
                {projectsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Tabs */}
            <nav className="p-3 space-y-1">
              {[
                { id: "overview", label: "Project Overview", icon: FolderKanban },
                { id: "requirements", label: "Requirements Spec", icon: FileText },
                { id: "kanban", label: "Kanban Task Board", icon: ListTodo, count: tasks.length },
                { id: "agents", label: "AI Swarm Agents", icon: Bot, count: agents.length },
                { id: "knowledge", label: "Knowledge Base (RAG)", icon: Database, count: files.length },
                { id: "analytics", label: "Project Analytics", icon: BarChart3 },
                { id: "activity", label: "Activity Stream", icon: ActivityIcon },
                { id: "decisions", label: "Architecture Decisions", icon: Shield },
                { id: "engineering", label: "Engineering Intelligence", icon: BrainCircuit },
                { id: "security", label: "Security & Testing", icon: Shield },
                { id: "research", label: "Research & Vision", icon: Database },
                { id: "documentation", label: "Documentation", icon: FileText },
                { id: "channels", label: "Channels", icon: ArrowRight },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      {tab.label}
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleRunSwarm}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:brightness-110 transition"
            >
              <Play size={16} />
              Run Swarm Engine
            </button>
          </div>
        </div>

        {/* Main Stage View */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold">
                <Sparkles className="animate-spin" size={24} />
                Loading Workspace...
              </div>
            </div>
          ) : project ? (
            <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
              {/* Top Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      {project.category || "Web App"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      {project.priority || "Medium"} Priority
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        project.status === "Completed"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : project.status === "Running"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold animate-pulse"
                          : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h1 className="text-3xl font-extrabold text-white">{project.title}</h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
                </div>

                {/* Progress bar info */}
                <div className="w-full md:w-64 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-zinc-400">Swarm Progress</span>
                    <span className="text-cyan-400 font-bold">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* TAB CONTENT STAGE */}

              {/* 1. OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                      <p className="text-xs text-zinc-400 uppercase font-semibold">Total Tasks</p>
                      <p className="text-3xl font-bold mt-1">{tasks.length}</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                      <p className="text-xs text-zinc-400 uppercase font-semibold">Tasks Completed</p>
                      <p className="text-3xl font-bold text-emerald-400 mt-1">
                        {tasks.filter((t) => t.status === "Completed").length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                      <p className="text-xs text-zinc-400 uppercase font-semibold">Knowledge Base Files</p>
                      <p className="text-3xl font-bold text-cyan-400 mt-1">{files.length}</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
                      <p className="text-xs text-zinc-400 uppercase font-semibold">Swarm AI Agents</p>
                      <p className="text-3xl font-bold text-purple-400 mt-1">{agents.length || 9}</p>
                    </div>
                  </div>

                  {/* Active Agents Summary & High Priority Tasks */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Agents */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Bot className="text-cyan-400" size={20} />
                        Active Swarm Agents Status
                      </h2>
                      <div className="space-y-3">
                        {agents.slice(0, 5).map((a: any) => (
                          <div key={a.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                            <div>
                              <p className="font-bold text-white">{a.name}</p>
                              <p className="text-zinc-400 text-[11px] mt-0.5">{a.currentTask}</p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                a.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : a.status === "Working"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 animate-pulse"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pending Tasks */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <ListTodo className="text-cyan-400" size={20} />
                        Current Priority Tasks
                      </h2>
                      <div className="space-y-3">
                        {tasks.filter((t) => t.status !== "Completed").slice(0, 5).map((t: any) => (
                          <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                            <div>
                              <p className="font-bold text-white">{t.title}</p>
                              <p className="text-zinc-500 text-[10px] mt-0.5">Assigned: {t.assignedAgent}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              {t.status}
                            </span>
                          </div>
                        ))}
                        {tasks.filter((t) => t.status !== "Completed").length === 0 && (
                          <p className="text-xs text-zinc-500 py-4 text-center">No pending tasks. Run Swarm to generate tasks!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. REQUIREMENTS SPEC TAB */}
              {activeTab === "requirements" && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Project Functional Requirements</h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Define project specification. The Planner Agent uses these requirements to auto-generate tasks.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveRequirements}
                        className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold hover:bg-cyan-500 transition"
                      >
                        Save Requirements
                      </button>

                      <button
                        onClick={handleRunSwarm}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        Planner Agent Task Gen
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-sm text-cyan-300 font-mono leading-relaxed outline-none focus:border-cyan-500"
                    placeholder="Enter full specification here..."
                  />
                </div>
              )}

              {/* 3. KANBAN TASK BOARD TAB */}
              {activeTab === "kanban" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <ListTodo className="text-cyan-400" size={20} />
                      Kanban Task Board
                    </h2>

                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold hover:bg-cyan-500 transition"
                    >
                      <Plus size={16} />
                      Add Custom Task
                    </button>
                  </div>

                  {/* Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {["Backlog", "Todo", "In Progress", "Review", "Completed"].map((statusCol) => {
                      const colTasks = tasks.filter((t) => t.status === statusCol);
                      return (
                        <div key={statusCol} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-col min-h-[400px]">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                            <h3 className="text-xs font-extrabold uppercase text-zinc-300 tracking-wider">
                              {statusCol}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 font-bold text-cyan-400">
                              {colTasks.length}
                            </span>
                          </div>

                          <div className="space-y-3 flex-1">
                            {colTasks.map((t) => (
                              <div
                                key={t._id}
                                className="group rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 hover:border-cyan-500/50 transition shadow-md flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h4 className="text-xs font-bold text-white">{t.title}</h4>
                                    <button
                                      onClick={() => handleDeleteTask(t._id)}
                                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 line-clamp-2">{t.description}</p>
                                </div>

                                <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px]">
                                  <span className="text-cyan-400 font-medium">🤖 {t.assignedAgent}</span>
                                  <select
                                    value={t.status}
                                    onChange={(e) => handleTaskStatusChange(t._id, e.target.value)}
                                    className="bg-zinc-900 text-zinc-300 border border-zinc-800 rounded px-1.5 py-0.5 outline-none text-[10px]"
                                  >
                                    <option value="Backlog">Backlog</option>
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. AI SWARM AGENTS TAB */}
              {activeTab === "agents" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Autonomous AI Swarm Workforce</h2>
                      <p className="text-xs text-zinc-400 mt-1">Dedicated specialized AI agents orchestrating execution.</p>
                    </div>

                    <button
                      onClick={handleRunSwarm}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-2"
                    >
                      <Play size={16} />
                      Start Swarm Execution
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {agents.map((agent: any) => (
                      <div key={agent.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold text-white">{agent.name}</h3>
                            <p className="text-xs text-zinc-400">{agent.role}</p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              agent.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : agent.status === "Working"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 animate-pulse"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {agent.status}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Current Activity</p>
                          <p className="text-zinc-300 mt-0.5 line-clamp-2">{agent.currentTask}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-zinc-400">
                            <span>Agent Progress</span>
                            <span className="font-bold text-cyan-400">{agent.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${agent.progress || 0}%` }} />
                          </div>
                        </div>

                        <button
                          onClick={() => handleRunSingleAgent(agent.name)}
                          className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-cyan-600 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw size={12} />
                          Trigger Agent Cycle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. KNOWLEDGE BASE (RAG & FILES) TAB */}
              {activeTab === "knowledge" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Database className="text-cyan-400" size={20} />
                        RAG Knowledge Base & Document Store
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Upload technical specs, PDFs, TXT, or markdown. The AI Chat uses these for RAG context answers!
                      </p>
                    </div>

                    <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold transition text-white">
                      <Upload size={16} />
                      {uploading ? "Indexing..." : "Upload Document"}
                      <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.md,.json,.js,.ts" />
                    </label>
                  </div>

                  {/* Documents Table */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="p-4">File Name</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Size</th>
                          <th className="p-4">Uploaded</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {files.map((f) => (
                          <tr key={f._id} className="hover:bg-zinc-800/50 transition">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                              <FileText className="text-cyan-400" size={16} />
                              {f.fileName}
                            </td>
                            <td className="p-4 text-zinc-400">{f.fileType}</td>
                            <td className="p-4 text-zinc-400">{(f.fileSize / 1024).toFixed(1)} KB</td>
                            <td className="p-4 text-zinc-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleDeleteFile(f._id)} className="text-zinc-500 hover:text-red-400">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {files.length === 0 && (
                      <p className="p-8 text-center text-xs text-zinc-500">No knowledge base documents uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 6. ANALYTICS TAB */}
              {activeTab === "analytics" && analytics && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="text-cyan-400" size={20} />
                    Project Workload & Status Analytics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
                      <h3 className="text-sm font-bold text-zinc-300">Task Status Distribution</h3>
                      {Object.entries(analytics.statusCounts || {}).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-zinc-400">{k}</span>
                          <span className="font-bold text-white">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
                      <h3 className="text-sm font-bold text-zinc-300">Priority Breakdown</h3>
                      {Object.entries(analytics.priorityCounts || {}).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-zinc-400">{k}</span>
                          <span className="font-bold text-white">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
                      <h3 className="text-sm font-bold text-zinc-300">Agent Workload Distribution</h3>
                      {Object.entries(analytics.agentWorkload || {}).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-zinc-400">{k}</span>
                          <span className="font-bold text-cyan-400">{v} tasks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. ACTIVITY STREAM TAB */}
              {activeTab === "activity" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ActivityIcon className="text-cyan-400" size={20} />
                    Project Multi-Agent Activity Log
                  </h2>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                    {activities.map((act) => (
                      <div key={act._id} className="flex items-start gap-4 border-b border-zinc-800/80 pb-4 last:border-0">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          <Bot size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{act.agentName}</span>
                            <span className="text-xs text-zinc-500">
                              {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-cyan-400 mt-0.5">{act.action}</p>
                          <p className="text-xs text-zinc-400 mt-1">{act.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "decisions" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="text-cyan-400" size={20} />
                    Architecture Decisions & Project Memory
                  </h2>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <h3 className="text-base font-bold text-white">Decision Log</h3>
                      {projectDecisions.length === 0 ? (
                        <p className="text-xs text-zinc-500">No architecture decisions logged yet for this project.</p>
                      ) : (
                        projectDecisions.map((decision: any) => (
                          <div key={decision._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-white">{decision.question}</p>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Decision</span>
                            </div>
                            <div className="text-xs text-zinc-400">
                              <p><span className="font-semibold text-zinc-300">Options:</span> {decision.options?.join(" • ") || "No options recorded"}</p>
                            </div>
                            <div className="space-y-2 text-xs text-zinc-300">
                              {decision.agentOpinions?.map((op: any, idx: number) => (
                                <div key={`${op.agentName}-${idx}`} className="rounded-xl border border-zinc-800 bg-zinc-900 p-2">
                                  <p className="font-bold text-cyan-400">{op.agentName}</p>
                                  <p className="text-zinc-300">{op.opinion}</p>
                                  <p className="text-zinc-500 mt-1">Reason: {op.reason}</p>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                              <p className="font-bold">Final Decision: {decision.finalDecision || "Pending"}</p>
                              <p className="mt-1 text-emerald-200/90">Reason: {decision.reason || "No reason recorded yet."}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <h3 className="text-base font-bold text-white">Project Memory</h3>
                      {projectMemory.length === 0 ? (
                        <p className="text-xs text-zinc-500">No project memory entries recorded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {projectMemory.map((entry: any) => (
                            <div key={entry._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-cyan-400">{entry.intent || entry.memoryType || "Memory"}</span>
                                <span className="text-[10px] text-zinc-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-2 text-zinc-200 font-medium">{entry.title || "Project Memory Entry"}</p>
                              <p className="mt-1 text-zinc-400 whitespace-pre-wrap">{entry.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "engineering" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BrainCircuit className="text-cyan-400" size={20} />
                    Engineering Intelligence
                  </h2>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Swarm Score</p>
                      <p className="mt-3 text-4xl font-black text-white">{project.swarmScore || qualityGate.overall || 0}</p>
                      <p className="mt-2 text-xs text-zinc-400">/ 100</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Quality Gate</p>
                      <div className="text-xs text-zinc-300 space-y-2">
                        <p>Architecture: {qualityGate.architecture ?? 94}%</p>
                        <p>Code Quality: {qualityGate.codeQuality ?? 89}%</p>
                        <p>Testing: {qualityGate.testing ?? 96}%</p>
                        <p>Security: {qualityGate.security ?? 84}%</p>
                        <p>Documentation: {qualityGate.documentation ?? 91}%</p>
                        <p>Performance: {qualityGate.performance ?? 88}%</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Self-healing</p>
                      <button
                        onClick={() => runSelfHeal(selectedProjectId, "Authentication flow failed").then(() => {
                          loadProjectOverview(selectedProjectId);
                          if (activeTab === "engineering") loadProjectTabData(selectedProjectId, "engineering");
                        }).catch(console.error)}
                        className="mt-4 w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black"
                      >
                        Run Repair Check
                      </button>
                      <p className="mt-3 text-xs text-zinc-400">Status: {project.selfHealing?.status || "idle"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <h3 className="text-base font-bold text-white">Requirement Traceability</h3>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800">
                      <table className="w-full text-left text-xs text-zinc-300">
                        <thead className="bg-zinc-950 text-zinc-400 uppercase">
                          <tr>
                            <th className="p-3">Requirement</th>
                            <th className="p-3">Implementation</th>
                            <th className="p-3">Tests</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {requirementTrace.map((item: any) => (
                            <tr key={item._id} className="bg-zinc-900/80">
                              <td className="p-3 font-semibold text-white">{item.code} {item.title}</td>
                              <td className="p-3 text-zinc-400">{item.implementation || "Pending implementation"}</td>
                              <td className="p-3 text-zinc-400">{item.tests || "No tests yet"}</td>
                              <td className="p-3 text-cyan-400">{item.status || "⏳"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="text-cyan-400" size={20} />
                    Security & Testing
                  </h2>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white">Security Scan</h3>
                        <button
                          onClick={() => runSecurityScan(selectedProjectId).then(() => {
                            loadProjectOverview(selectedProjectId);
                            if (activeTab === "security") loadProjectTabData(selectedProjectId, "security");
                          }).catch(console.error)}
                          className="rounded-xl bg-red-500 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                        >
                          Run Security Scan
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-400">Critical</p>
                          <p className="text-2xl font-bold text-red-400">{securityReport.filter((item: any) => item.severity === "Critical").length}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-400">High</p>
                          <p className="text-2xl font-bold text-orange-400">{securityReport.filter((item: any) => item.severity === "High").length}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-400">Medium</p>
                          <p className="text-2xl font-bold text-yellow-400">{securityReport.filter((item: any) => item.severity === "Medium").length}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-400">Low</p>
                          <p className="text-2xl font-bold text-cyan-400">{securityReport.filter((item: any) => item.severity === "Low").length}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {securityReport.map((finding: any) => (
                          <div key={finding._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white">{finding.title}</span>
                              <span className="text-[10px] uppercase text-red-400">{finding.severity}</span>
                            </div>
                            <p className="mt-1 text-zinc-400">{finding.description}</p>
                            <p className="mt-2 text-cyan-300">Recommendation: {finding.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white">Testing</h3>
                        <button
                          onClick={() => runProjectTests(selectedProjectId, "Swarm validation suite").then(() => {
                            loadProjectOverview(selectedProjectId);
                            if (activeTab === "security") loadProjectTabData(selectedProjectId, "security");
                          }).catch(console.error)}
                          className="rounded-xl bg-emerald-500 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-black"
                        >
                          Run Test Suite
                        </button>
                      </div>

                      <div className="space-y-3">
                        {testRuns.map((run: any) => (
                          <div key={run._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white">{run.name}</span>
                              <span className="text-cyan-400">{run.status}</span>
                            </div>
                            <p className="mt-1 text-zinc-400">{run.summary}</p>
                            <p className="mt-2 text-zinc-500">{run.passed}/{run.total} passed</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "research" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Database className="text-cyan-400" size={20} />
                      Research & Vision
                    </h2>
                    <button
                      onClick={() => generateProjectResearch(selectedProjectId, "project architecture and security").then(() => {
                        loadProjectOverview(selectedProjectId);
                        if (activeTab === "research") loadProjectTabData(selectedProjectId, "research");
                      }).catch(console.error)}
                      className="rounded-xl bg-cyan-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                    >
                      Generate Research
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <h3 className="text-base font-bold text-white">Research Sources</h3>
                      {researchItems.length === 0 ? (
                        <p className="text-xs text-zinc-500">No research notes yet for this project.</p>
                      ) : (
                        researchItems.map((item: any) => (
                          <div key={item._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-white">{item.title}</span>
                              <span className="text-[10px] uppercase text-cyan-400">{item.relevance}</span>
                            </div>
                            <p className="text-zinc-400">{item.summary}</p>
                            <p className="text-zinc-500">{item.authors?.join(", ") || "Unknown authors"} • {item.year}</p>
                            <p className="text-zinc-500">{item.projectRelationship}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white">Visualizations</h3>
                        <button
                          onClick={() => createProjectVisualization(selectedProjectId, {
                            title: "System Architecture",
                            type: "architecture",
                            content: "flowchart TD\nA[User] --> B[SwarmOS Project Workspace]\nB --> C[Project Memory]\nB --> D[Security & Testing]\nB --> E[Research & Documentation]",
                            description: "System architecture for the active project",
                          }).then(() => {
                            loadProjectOverview(selectedProjectId);
                            if (activeTab === "research") loadProjectTabData(selectedProjectId, "research");
                          }).catch(console.error)}
                          className="rounded-xl bg-violet-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                        >
                          Add Diagram
                        </button>
                      </div>

                      {visualizations.length === 0 ? (
                        <p className="text-xs text-zinc-500">No project diagrams saved yet.</p>
                      ) : (
                        visualizations.map((visual: any) => (
                          <div key={visual._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                            <p className="font-bold text-white">{visual.title}</p>
                            <p className="text-zinc-500 mt-1">{visual.type}</p>
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[10px] text-cyan-300">{visual.content}</pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documentation" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FileText className="text-cyan-400" size={20} />
                      Documentation
                    </h2>
                    <button
                      onClick={() => createProjectDocument(selectedProjectId, {
                        title: "Project Summary",
                        type: "summary",
                        format: "markdown",
                        content: "# Project Summary\n\n- Goal: define the project state and current decisions\n- Status: active and tracked in SwarmOS\n- Notes: generated from the active project intelligence loop",
                      }).then(() => {
                        loadProjectOverview(selectedProjectId);
                        if (activeTab === "documentation") loadProjectTabData(selectedProjectId, "documentation");
                      }).catch(console.error)}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                    >
                      Generate Summary
                    </button>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                    {documentArtifacts.length === 0 ? (
                      <p className="text-xs text-zinc-500">No generated project documents yet.</p>
                    ) : (
                      documentArtifacts.map((doc: any) => (
                        <div key={doc._id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-white">{doc.title}</span>
                            <span className="text-[10px] uppercase text-emerald-400">{doc.type}</span>
                          </div>
                          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] text-zinc-200">{doc.content}</pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "channels" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ArrowRight className="text-cyan-400" size={20} />
                    Shared Project Channels
                  </h2>

                  <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={channelCommandType}
                        onChange={(e) => setChannelCommandType(e.target.value)}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none"
                      >
                        <option value="web">Web Console</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="voice">Voice</option>
                      </select>

                      <input
                        value={channelCommandInput}
                        onChange={(e) => setChannelCommandInput(e.target.value)}
                        placeholder="Type a project command for this channel..."
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          if (!channelCommandInput.trim()) return;
                          sendChannelProjectCommand(selectedProjectId, channelCommandType, channelCommandInput, {
                            projectId: selectedProjectId,
                            title: project?.title || "Project",
                            status: project?.status || "Active",
                            progress: project?.progress || 0,
                          })
                            .then(() => {
                              setChannelCommandInput("");
                              loadProjectOverview(selectedProjectId);
                              if (activeTab === "channels") loadProjectTabData(selectedProjectId, "channels");
                            })
                            .catch(console.error);
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                      >
                        Send Command Through {channelCommandType.toUpperCase()} Channel
                      </button>

                      <button
                        onClick={() => {
                          const payload = {
                            projectId: selectedProjectId,
                            text: channelCommandInput || "status",
                            message: channelCommandInput || "status",
                          };

                          const action = channelCommandType === "whatsapp"
                            ? sendWhatsAppWebhook(selectedProjectId, payload)
                            : sendVoiceWebhook(selectedProjectId, payload);

                          action.then(() => {
                            setChannelCommandInput("");
                            loadProjectOverview(selectedProjectId);
                            if (activeTab === "channels") loadProjectTabData(selectedProjectId, "channels");
                          }).catch(console.error);
                        }}
                        className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                      >
                        Send External Webhook
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {[
                      { type: "web", label: "Web Console" },
                      { type: "whatsapp", label: "WhatsApp" },
                      { type: "voice", label: "Voice" },
                    ].map((channelType) => {
                      const channel = channels.find((c: any) => c.channelType === channelType.type) || {
                        status: "inactive",
                        endpoint: "",
                        lastMessage: "",
                      };

                      return (
                        <div key={channelType.type} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-white">{channelType.label}</h3>
                            <span className={`text-[10px] uppercase ${channel.status === "active" ? "text-emerald-400" : "text-zinc-400"}`}>
                              {channel.status}
                            </span>
                          </div>

                          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300 space-y-2">
                            <p><span className="text-zinc-500">Endpoint:</span> {channel.endpoint || "Not configured"}</p>
                            <p><span className="text-zinc-500">Last message:</span> {channel.lastMessage || "No activity yet"}</p>
                          </div>

                          <button
                            onClick={() => {
                              const payload = {
                                channelType: channelType.type,
                                status: "active",
                                endpoint: channel.endpoint || `${channelType.type}://project/${selectedProjectId}`,
                                projectStateSnapshot: {
                                  projectId: selectedProjectId,
                                  title: project?.title || "Project",
                                  status: project?.status || "Active",
                                  progress: project?.progress || 0,
                                },
                                lastMessage: `Connected via ${channelType.label}`,
                              };

                              upsertProjectChannel(selectedProjectId, payload)
                                .then(() => {
                                  loadProjectOverview(selectedProjectId);
                                  if (activeTab === "channels") loadProjectTabData(selectedProjectId, "channels");
                                })
                                .catch(console.error);
                            }}
                            className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                          >
                            {channel.status === "active" ? "Refresh Channel" : "Enable Channel"}
                          </button>

                          <button
                            onClick={() => {
                              syncProjectChannels(selectedProjectId, {
                                projectId: selectedProjectId,
                                title: project?.title || "Project",
                                status: project?.status || "Active",
                                progress: project?.progress || 0,
                                channelType: channelType.type,
                              }).then(() => {
                                loadProjectOverview(selectedProjectId);
                                if (activeTab === "channels") loadProjectTabData(selectedProjectId, "channels");
                              }).catch(console.error);
                            }}
                            className="w-full rounded-xl bg-zinc-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
                          >
                            Sync Project State
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT AI ASSISTANT PANEL (RAG CHAT & ASSISTANT) */}
        <div className={`border-l border-zinc-800/80 bg-zinc-900/95 flex flex-col justify-between transition-all duration-300 ${chatOpen ? "w-96" : "w-12"} shrink-0`}>
          <div className="border-b border-zinc-800 bg-zinc-950 p-3">
            <form onSubmit={handleCommandSubmit} className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                <BrainCircuit size={14} />
                Orchestrator Command
              </div>
              <textarea
                rows={3}
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Ask SwarmOS anything about this project..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white"
              >
                Run Command <ArrowRight size={14} />
              </button>
            </form>

            {commandResult && (
              <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[11px] text-zinc-200">
                <p className="font-bold text-cyan-300">{commandResult.intent || "SWARM"}</p>
                <p className="mt-1 text-zinc-300">{commandResult.orchestratorMessage || commandResult.error || "Command processed."}</p>
              </div>
            )}
          </div>
          {chatOpen ? (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="text-cyan-400" size={20} />
                  <h3 className="font-bold text-sm text-white">Project RAG AI Assistant</h3>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-zinc-500 hover:text-white">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex flex-wrap gap-1.5">
                {[
                  "What should I work on next?",
                  "Analyze this project",
                  "Create tasks for this project",
                  "Explain this error",
                  "Summarize project progress",
                ].map((qp) => (
                  <button
                    key={qp}
                    onClick={() => handleQuickPrompt(qp)}
                    className="text-[10px] font-semibold bg-zinc-900 border border-zinc-800 hover:border-cyan-500 text-zinc-300 hover:text-cyan-400 px-2 py-1 rounded-lg transition"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Message History Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-cyan-600 text-white font-medium"
                          : "bg-zinc-950 border border-zinc-800 text-zinc-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* RAG Sources Citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-zinc-800 text-[10px] text-cyan-400">
                          <span className="font-bold block">📚 RAG Sources:</span>
                          {m.sources.map((s: any, sIdx: number) => (
                            <span key={sIdx} className="block text-zinc-400">• {s.fileName}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sendingMsg && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                    <Sparkles className="animate-spin" size={14} />
                    RAG Assistant searching knowledge base...
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="p-3 border-t border-zinc-800 bg-zinc-950">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask RAG AI about your project..."
                    className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg}
                    className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="p-3 text-cyan-400 hover:text-white flex flex-col items-center gap-2 mt-4"
              title="Open RAG AI Assistant"
            >
              <Bot size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-lg font-bold">Add Custom Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Task Title</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none"
                  placeholder="Task title..."
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none"
                  placeholder="Task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Assigned Agent</label>
                  <select
                    value={taskAgent}
                    onChange={(e) => setTaskAgent(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2 text-xs text-white"
                  >
                    <option value="Planner Agent">Planner Agent</option>
                    <option value="Architecture Agent">Architecture Agent</option>
                    <option value="Database Agent">Database Agent</option>
                    <option value="Backend Agent">Backend Agent</option>
                    <option value="Frontend Agent">Frontend Agent</option>
                    <option value="Tester Agent">Tester Agent</option>
                    <option value="Reviewer Agent">Reviewer Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2 text-xs text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-semibold text-white"
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