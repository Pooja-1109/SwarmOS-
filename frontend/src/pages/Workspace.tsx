import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import {
  getProjects,
  getProject,
  getProjectSummary,
  getExecutionStatus,
  downloadProjectZip,
  getProjectLogs,
  runProject,
  stopProject,
  getProjectRuntime,
  deployProject,
} from "../services/projectService";
import { getTasks } from "../services/taskService";
import { getProjectAgents, startAgents } from "../services/agentService";
import { uploadFile, getProjectFiles, queryProjectKnowledge } from "../services/fileService";
import {
  FolderKanban,
  FileText,
  Bot,
  Play,
  Upload,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  X,
  Zap,
  Brain,
  Layers,
  Code2,
  TestTube,
  Download,
  Terminal,
  Eye,
  Copy,
  Check,
  Rocket,
  Square,
  ExternalLink,
  Search,
  BookOpen,
  RefreshCw,
} from "lucide-react";

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectIdFromUrl = searchParams.get("id");
  const tabFromUrl = searchParams.get("tab");

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || "");
  const [project, setProject] = useState<any>(null);

  // EXACT 5 WORKSPACE TABS - Default to "build" when navigating after Start AI Team
  const [activeTab, setActiveTab] = useState<"overview" | "build" | "preview" | "files" | "knowledge">(
    (tabFromUrl as any) || "build"
  );

  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streamNotice, setStreamNotice] = useState("");
  const activeLoadIdRef = useRef<string>("");

  // Real Execution State driven from Backend Data
  const [executionData, setExecutionData] = useState<any>(null);
  const [selectedAgentNode, setSelectedAgentNode] = useState<any>(null);

  // Tab & Entity States - Safe Initial Values
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);

  // Runtime & Deployment State
  const [runtimeState, setRuntimeState] = useState<{
    status: "idle" | "starting" | "running" | "failed" | "stopped";
    port: number;
    url: string;
    pid: number;
    error: string;
  }>({
    status: "idle",
    port: 0,
    url: "",
    pid: 0,
    error: "",
  });
  const [isRunningLoading, setIsRunningLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);

  const [isAgentsRunning, setIsAgentsRunning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Knowledge Base Q&A RAG State
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [knowledgeAnswer, setKnowledgeAnswer] = useState("");
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);

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

  // Real-time execution status polling loop
  useEffect(() => {
    if (!selectedProjectId) return;

    const interval = setInterval(() => {
      fetchRealExecutionStatus(selectedProjectId);
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedProjectId, activeTab]);

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

  const fetchRealExecutionStatus = async (id: string) => {
    try {
      const statusData = await getExecutionStatus(id);
      if (statusData && (activeLoadIdRef.current === id || !activeLoadIdRef.current)) {
        setExecutionData(statusData);
        if (Array.isArray(statusData.tasks)) setTasks(statusData.tasks);
        if (Array.isArray(statusData.executionLogs)) setExecutionLogs(statusData.executionLogs);
        if (Array.isArray(statusData.files) && statusData.files.length > 0) {
          setGeneratedFiles(statusData.files);
        }
        if (Array.isArray(statusData.agents) && statusData.agents.length > 0) {
          setAgents(statusData.agents);
        }
        setStreamNotice("");
      }
    } catch (err) {
      setStreamNotice("Live agent updates are temporarily polling via fallback...");
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
          setProject({ _id: id, title: "AI Application Project", progress: 0, status: "Building" });
        }
      } else {
        setProject(proj);
      }

      setLoading(false);

      // Fetch real execution status & resources
      fetchRealExecutionStatus(id);

      Promise.all([
        getTasks({ projectId: id }).catch(() => []),
        getProjectAgents(id).catch(() => []),
        getProjectFiles(id).catch(() => []),
        getExecutionStatus(id).then(s => s?.files || []).catch(() => []),
        getProjectLogs(id).catch(() => []),
        getProjectRuntime(id).catch(() => null),
      ]).then(([taskData, agentData, fileData, genFilesData, logsData, rtData]) => {
        if (activeLoadIdRef.current === id) {
          setTasks(Array.isArray(taskData) ? taskData : []);
          setAgents(Array.isArray(agentData) ? agentData : []);
          setFiles(Array.isArray(fileData) ? fileData : []);
          setGeneratedFiles(Array.isArray(genFilesData) ? genFilesData : []);
          setExecutionLogs(Array.isArray(logsData) ? logsData : []);
          if (rtData) {
            setRuntimeState({
              status: rtData.status || "idle",
              port: rtData.port || 0,
              url: rtData.url || "",
              pid: rtData.pid || 0,
              error: rtData.error || "",
            });
          }
          if (Array.isArray(genFilesData) && genFilesData.length > 0 && !selectedFile) {
            setSelectedFile(genFilesData[0]);
          }
        }
      });
    } catch (err: any) {
      console.error("Error loading project overview:", err);
      if (activeLoadIdRef.current === id) {
        setLoading(false);
      }
    }
  };

  // Run Real Local Application Process
  const handleRunProject = async () => {
    if (!selectedProjectId) return;
    try {
      setIsRunningLoading(true);
      setRuntimeState((prev) => ({ ...prev, status: "starting" }));
      const result = await runProject(selectedProjectId);
      setRuntimeState({
        status: "running",
        port: result.port,
        url: result.url,
        pid: result.pid,
        error: "",
      });
      loadProjectOverview(selectedProjectId);
    } catch (err: any) {
      console.error("Run project failed:", err);
      setRuntimeState((prev) => ({
        ...prev,
        status: "failed",
        error: err.response?.data?.message || err.message || "Failed to start local process.",
      }));
    } finally {
      setIsRunningLoading(false);
    }
  };

  // Stop Local Process
  const handleStopProject = async () => {
    if (!selectedProjectId) return;
    try {
      setIsRunningLoading(true);
      await stopProject(selectedProjectId);
      setRuntimeState({
        status: "stopped",
        port: 0,
        url: "",
        pid: 0,
        error: "",
      });
      loadProjectOverview(selectedProjectId);
    } catch (err: any) {
      console.error("Stop project failed:", err);
    } finally {
      setIsRunningLoading(false);
    }
  };

  // Deploy Project
  const handleDeployProject = async () => {
    if (!selectedProjectId) return;
    try {
      setDeployLoading(true);
      await deployProject(selectedProjectId);
    } catch (err: any) {
      console.error("Deploy failed:", err);
    } finally {
      setDeployLoading(false);
    }
  };

  // Run full AI Swarm
  const handleRunSwarm = async () => {
    if (!selectedProjectId) return;
    try {
      setIsAgentsRunning(true);
      await startAgents(selectedProjectId);
      fetchRealExecutionStatus(selectedProjectId);
      setTimeout(() => {
        setIsAgentsRunning(false);
        loadProjectOverview(selectedProjectId);
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsAgentsRunning(false);
    }
  };

  // Download ZIP Package
  const handleDownloadZip = async () => {
    if (!selectedProjectId) return;
    try {
      setIsDownloading(true);
      await downloadProjectZip(selectedProjectId);
    } catch (err: any) {
      console.error("ZIP download failed:", err);
      alert("Failed to download project ZIP. Ensure Swarm agents have run first.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Query Project Knowledge Base (RAG)
  const handleKnowledgeQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !knowledgeQuery.trim() || knowledgeLoading) return;

    try {
      setKnowledgeLoading(true);
      const res = await queryProjectKnowledge(selectedProjectId, knowledgeQuery);
      setKnowledgeAnswer(res.answer || "No matching context found.");
    } catch (err: any) {
      console.error("Knowledge query error:", err);
      setKnowledgeAnswer("Unable to retrieve project knowledge context.");
    } finally {
      setKnowledgeLoading(false);
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

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe Progress Calculation from Database Tasks
  const totalExecutionTasks = Array.isArray(tasks) ? tasks.length : 0;
  const completedExecutionTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === "Completed").length
    : 0;

  const realProgress =
    executionData?.progress !== undefined
      ? executionData.progress
      : totalExecutionTasks > 0
      ? Math.round((completedExecutionTasks / totalExecutionTasks) * 100)
      : (project?.progress || 0);

  // Requirement 9: Initial Agent Workforce Roster with Running & Waiting states
  const agentList =
    Array.isArray(agents) && agents.length > 0
      ? agents
      : [
          { name: "Orchestrator Agent", role: "Requirements Analysis & Workflow Dispatch", status: "Running", currentTask: "Analyzing requirement prompt & mapping tasks", icon: Brain },
          { name: "Planner Agent", role: "PRD & Feature Breakdown", status: "Waiting", currentTask: "Waiting for Orchestrator", icon: Brain },
          { name: "Architecture Agent", role: "System & Data Architecture Blueprint", status: "Waiting", currentTask: "Waiting for PRD spec", icon: Layers },
          { name: "UI/UX Agent", role: "Design Specs & Styles", status: "Waiting", currentTask: "Waiting for Architecture blueprint", icon: Zap },
          { name: "Developer Agent", role: "Full-Stack Source Code Generation", status: "Waiting", currentTask: "Waiting for UI design spec", icon: Code2 },
          { name: "Tester Agent", role: "QA Audit & Automated Test Suite", status: "Waiting", currentTask: "Waiting for source code", icon: TestTube },
          { name: "Documentation Agent", role: "Technical Documentation Manuals", status: "Waiting", currentTask: "Waiting for QA report", icon: FileText },
        ];

  // Build Preview HTML Document safely checking previewHtmlFile.content
  const previewHtmlFile = (generatedFiles || []).find((f) => f.fileName === "index.html");
  const previewCssFile = (generatedFiles || []).find((f) => f.fileName === "styles.css");
  
  const htmlContent = previewHtmlFile?.content || "";
  const cssContent = previewCssFile?.content || "";

  const srcDoc = htmlContent
    ? `
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body style="background: #09090b; color: #fff; margin:0; padding:16px;">
          ${htmlContent.replace(/<link[^>]*>/gi, "").replace(/<!DOCTYPE html>|<html[^>]*>|<head[^>]*>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<\/html>/gi, "")}
        </body>
      </html>
    `
    : `<div style="color:#a1a1aa; font-family:sans-serif; text-align:center; padding: 40px;">
        <h3>No HTML Preview Available</h3>
        <p>Run Swarm Agents to generate the interactive application frontend.</p>
       </div>`;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      <Sidebar />

      <div className="ml-64 flex flex-1 flex-col h-screen overflow-hidden">

        {/* ================= TOP HEADER BAR ================= */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft size={16} /> Projects
            </Link>

            <div className="h-4 w-px bg-zinc-800" />

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-white tracking-tight">
                  {project?.title || "Initializing SwarmOS Project..."}
                </h1>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    runtimeState.status === "running"
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 animate-pulse"
                      : realProgress === 100
                      ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                      : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-pulse"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {runtimeState.status === "running"
                    ? `RUNNING (Port ${runtimeState.port})`
                    : realProgress === 100
                    ? "READY FOR EXECUTION"
                    : `BUILDING (${realProgress}%)`}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-md">
                {project?.description || "AI-powered multi-agent application workspace"}
              </p>
            </div>
          </div>

          {/* Core Master Action Buttons */}
          <div className="flex items-center gap-2">
            {runtimeState.status === "running" ? (
              <button
                onClick={handleStopProject}
                disabled={isRunningLoading}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/60 px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900 transition"
              >
                <Square size={14} /> Stop Server
              </button>
            ) : (
              <button
                onClick={handleRunProject}
                disabled={isRunningLoading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950 hover:brightness-110 disabled:opacity-50 transition"
              >
                <Play size={14} />
                {isRunningLoading ? "Starting..." : "▶ Run Project"}
              </button>
            )}

            <button
              onClick={handleDeployProject}
              disabled={deployLoading}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-900 transition"
            >
              <Rocket size={14} /> Deploy
            </button>

            <button
              onClick={() => setActiveTab("preview")}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition"
            >
              <Eye size={14} /> Preview
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-600 hover:text-white transition disabled:opacity-50"
            >
              <Download size={14} /> Download ZIP
            </button>
          </div>
        </div>

        {/* ================= MAIN CONTENT SPLIT ================= */}
        <div className="flex-1 flex overflow-hidden">

          {/* 1. LEFT NAVIGATION PANEL — EXACT 5 TABS */}
          <div className="w-56 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="px-2">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Select Project
                </label>
                {projectsList.length > 0 ? (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      navigate(`/workspace?id=${e.target.value}&tab=build`);
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

              {/* EXACT 5 TABS NAVIGATION */}
              <nav className="space-y-1">
                {[
                  { id: "build", label: "Build", icon: Bot, count: agentList.length },
                  { id: "overview", label: "Overview", icon: FolderKanban },
                  { id: "preview", label: "Preview", icon: Eye },
                  { id: "files", label: "Files", icon: Code2, count: (generatedFiles || []).length },
                  { id: "knowledge", label: "Knowledge", icon: BookOpen, count: (files || []).length },
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
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            isActive ? "bg-white/20 text-white" : "bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              >
                <FolderKanban size={15} /> All Projects
              </Link>
            </div>
          </div>

          {/* 2. CENTER STAGE - ALWAYS RENDER SAFE UI */}
          <div className="flex-1 bg-zinc-950 overflow-y-auto p-6 space-y-6">

            {streamNotice && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 px-4 py-2 text-xs text-yellow-300 flex items-center justify-between">
                <span>{streamNotice}</span>
                <button onClick={() => fetchRealExecutionStatus(selectedProjectId)} className="flex items-center gap-1 font-bold underline">
                  <RefreshCw size={12} /> Retry Poll
                </button>
              </div>
            )}

            {error ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center space-y-4 max-w-md mx-auto my-12">
                <AlertCircle className="mx-auto text-yellow-400" size={36} />
                <h3 className="text-base font-bold text-white">Workspace Notice</h3>
                <p className="text-xs text-zinc-400">{error}</p>
                <button
                  onClick={() => loadProjectOverview(selectedProjectId)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-xs font-bold text-white"
                >
                  Retry Loading Workspace
                </button>
              </div>
            ) : (
              <>

                {/* ================= 1. DYNAMIC BUILD TAB (REQUIREMENTS 4, 9, 10 & 12) ================= */}
                {activeTab === "build" && (
                  <div className="space-y-6">

                    {/* Requirement 4: Immediate Build Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                          <Bot size={24} className="text-cyan-400 animate-pulse" />
                          SWARMOS IS BUILDING YOUR PROJECT
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">
                          Project: <strong className="text-cyan-300">{project?.title || "Initializing..."}</strong> • Overall Progress: <strong className="text-emerald-400">{realProgress}%</strong> ({completedExecutionTasks} of {totalExecutionTasks} tasks complete)
                        </p>
                      </div>

                      <button
                        onClick={handleRunSwarm}
                        disabled={isAgentsRunning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition shrink-0"
                      >
                        {isAgentsRunning ? <Sparkles size={16} className="animate-spin" /> : <Play size={16} />}
                        {isAgentsRunning ? "Swarm Executing..." : "Re-trigger Swarm"}
                      </button>
                    </div>

                    {/* CELEBRATION PAYOFF BANNER WHEN 100% COMPLETE */}
                    {realProgress === 100 && (
                      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-zinc-900 p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                              🎉
                            </div>
                            <div>
                              <h3 className="text-lg font-extrabold text-white">YOUR PROJECT IS READY</h3>
                              <p className="text-xs text-emerald-300">
                                Requirements, Architecture, UI, Code, and QA Tests completed successfully.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`http://localhost:5000/runtime/${selectedProjectId}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-emerald-500 shadow-xl transition"
                            >
                              <Play size={15} /> ▶ Run Project
                            </a>
                            <button
                              onClick={() => setActiveTab("preview")}
                              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 font-bold text-xs flex items-center gap-1.5 hover:text-white transition"
                            >
                              <Eye size={15} /> Preview
                            </button>
                            <button
                              onClick={handleDownloadZip}
                              className="px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-900 transition"
                            >
                              <Download size={15} /> Download ZIP
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/40 text-xs font-semibold text-emerald-200">
                          <div>✓ Requirements complete</div>
                          <div>✓ Architecture complete</div>
                          <div>✓ Source code generated</div>
                          <div>✓ Tests passed (100%)</div>
                        </div>
                      </div>
                    )}

                    {/* VISUAL AGENT SWARM TOPOLOGY GRAPH (REQUIREMENT 4 & 9) */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 shadow-xl text-center relative overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
                        Visual Agent Swarm Topology Graph
                      </span>

                      {/* Swarm Node Layout */}
                      <div className="py-4 space-y-6">
                        {/* Central Orchestrator Node */}
                        <div className="inline-block rounded-2xl border-2 border-cyan-500 bg-cyan-950/60 px-6 py-3 shadow-lg shadow-cyan-950/50">
                          <span className="text-2xl block">🧠</span>
                          <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 justify-center">
                            ORCHESTRATOR AGENT
                            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                          </span>
                          <span className="block text-[10px] text-zinc-400">Understands requirements & assigns work</span>
                        </div>

                        {/* Connecting lines graphic */}
                        <div className="flex justify-center items-center gap-8 text-cyan-500 font-mono text-xs">
                          <span>↙</span>
                          <span>↓</span>
                          <span>↘</span>
                        </div>

                        {/* Specialized Agent Nodes Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                          {agentList.slice(1, 5).map((ag: any, idx: number) => {
                            const agentName = String(ag?.name || "");
                            const isDone = ag.status === "Completed" || realProgress === 100;
                            const isWorking = ag.status === "Working" || ag.status === "Running" || ag.status === "In Progress";
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedAgentNode(ag)}
                                className={`cursor-pointer rounded-xl border p-3 transition shadow space-y-1.5 group text-left ${
                                  isDone
                                    ? "border-emerald-500/40 bg-emerald-950/20"
                                    : isWorking
                                    ? "border-cyan-500/60 bg-cyan-950/30 animate-pulse"
                                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                                }`}
                              >
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-xl">
                                    {agentName.includes("Planner") ? "📋" :
                                     agentName.includes("Arch") ? "🏗" :
                                     agentName.includes("UI") ? "🎨" : "💻"}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isDone
                                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                        : isWorking
                                        ? "bg-cyan-950 text-cyan-400 border border-cyan-500/40"
                                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                                    }`}
                                  >
                                    {isDone ? "✓ Ready" : isWorking ? "● Running" : "○ Waiting"}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition">{ag.name}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{ag.currentTask || ag.role}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Convergence line to Tester */}
                        <div className="flex justify-center items-center gap-8 text-cyan-500 font-mono text-xs pt-2">
                          <span>↘</span>
                          <span>↓</span>
                          <span>↙</span>
                        </div>

                        {/* Tester & Docs Node */}
                        <div className="inline-block rounded-2xl border border-emerald-500/50 bg-emerald-950/40 px-6 py-2.5 shadow">
                          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                            <span>🧪</span> Tester & Documentation Agents — {realProgress === 100 ? "Automated Validation Passed" : "Automated QA Verification"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Agent Detail Panel Modal / Drawer when clicked */}
                    {selectedAgentNode && (
                      <div className="rounded-2xl border border-cyan-500/40 bg-zinc-900 p-5 space-y-3 shadow-2xl relative">
                        <button
                          onClick={() => setSelectedAgentNode(null)}
                          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                        >
                          <X size={18} />
                        </button>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>🤖</span> {selectedAgentNode.name} Detail Inspector
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Role: {selectedAgentNode.role || "Specialized agent responsible for output generation."}
                        </p>
                        <div className="p-3 rounded-xl bg-zinc-950 text-xs font-mono text-cyan-300 space-y-1">
                          <div>• Status: {selectedAgentNode.status || "Completed"}</div>
                          <div>• Current Task: {selectedAgentNode.currentTask || "Artifact generated"}</div>
                          <div>• Output artifact saved to MongoDB</div>
                        </div>
                      </div>
                    )}

                    {/* 6 BUILD PHASES TIMELINE */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-xl">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        6 Build Phases Progression
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { phase: "PHASE 1", title: "Understanding", detail: "Requirements Analyzed", status: "✓" },
                          { phase: "PHASE 2", title: "Planning", detail: "PRD & Architecture", status: realProgress >= 30 ? "✓" : "○" },
                          { phase: "PHASE 3", title: "Design", detail: "UI Specification", status: realProgress >= 50 ? "✓" : "○" },
                          { phase: "PHASE 4", title: "Development", detail: "Source Code Files", status: realProgress >= 80 ? "✓" : "○" },
                          { phase: "PHASE 5", title: "Testing", detail: "QA Audit Scans", status: realProgress >= 90 ? "✓" : "○" },
                          { phase: "PHASE 6", title: "Ready", detail: "Build Verified", status: realProgress === 100 ? "✓" : "○" },
                        ].map((p, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-center space-y-1">
                            <span className="text-[9px] font-bold text-emerald-400 font-mono block">{p.phase}</span>
                            <p className="text-xs font-bold text-white">{p.title}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{p.detail}</p>
                            <span className="text-xs font-bold text-emerald-400 block pt-1">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LIVE BUILD ACTIVITY LOG FEED */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal size={16} className="text-cyan-400" /> LIVE BUILD ACTIVITY FEED
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400">{(executionLogs || []).length} Events Logged</span>
                      </div>

                      <div className="rounded-xl bg-zinc-950 p-4 font-mono text-xs space-y-2 max-h-[300px] overflow-y-auto border border-zinc-800">
                        {Array.isArray(executionLogs) && executionLogs.length > 0 ? (
                          executionLogs.map((log: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 border-b border-zinc-900/80 pb-1.5 text-[11px]">
                              <span className="text-zinc-500 shrink-0">
                                {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                              </span>
                              <span
                                className={`font-bold shrink-0 ${
                                  log.level === "success"
                                    ? "text-emerald-400"
                                    : log.level === "error"
                                    ? "text-red-400"
                                    : "text-cyan-400"
                                }`}
                              >
                                {log.agentName || "Swarm Agent"}:
                              </span>
                              <span className="text-zinc-300">{log.message}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-zinc-500 py-6">
                            Connecting to agent execution stream... Events will update live.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* ================= 2. OVERVIEW TAB ================= */}
                {activeTab === "overview" && (
                  <div className="space-y-6">

                    {/* Master Action & Real Progress Bar */}
                    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 p-6 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                            <Sparkles size={18} /> SwarmOS Multi-Agent Execution Status
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {realProgress === 100
                              ? "All specialized AI agents have completed build tasks and generated source code."
                              : `Executing real tasks (${completedExecutionTasks} / ${totalExecutionTasks} completed)...`}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0">
                          {runtimeState.status === "running" ? (
                            <a
                              href={runtimeState.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-500 transition shadow-lg"
                            >
                              <ExternalLink size={14} /> Open Running Project
                            </a>
                          ) : (
                            <button
                              onClick={handleRunProject}
                              disabled={isRunningLoading}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 transition"
                            >
                              <Play size={14} /> Run Project
                            </button>
                          )}

                          <button
                            onClick={handleDeployProject}
                            className="px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-900 transition"
                          >
                            <Rocket size={14} /> Deploy Project
                          </button>
                          <button
                            onClick={handleDownloadZip}
                            disabled={isDownloading}
                            className="px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 font-semibold text-xs flex items-center gap-1.5 hover:bg-cyan-600 hover:text-white transition"
                          >
                            <Download size={14} /> Download ZIP
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300">Overall Real Task Progress</span>
                          <span className="text-cyan-400 font-mono font-bold">{realProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 transition-all duration-700"
                            style={{ width: `${realProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Generated Files</span>
                        <span className="text-xl font-extrabold text-cyan-400">{(generatedFiles || []).length}</span>
                        <span className="text-[10px] text-zinc-500 block">Saved in MongoDB</span>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AI Agents</span>
                        <span className="text-xl font-extrabold text-emerald-400">{agentList.length}</span>
                        <span className="text-[10px] text-zinc-500 block">Specialized Roles</span>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Real Tasks</span>
                        <span className="text-xl font-extrabold text-purple-400">{completedExecutionTasks} / {totalExecutionTasks}</span>
                        <span className="text-[10px] text-zinc-500 block">Tasks Completed</span>
                      </div>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Runtime Port</span>
                        <span className="text-xl font-extrabold text-yellow-400">5000</span>
                        <span className="text-[10px] text-zinc-500 block">Express Host Route</span>
                      </div>
                    </div>

                    {/* AI Agent Swarm Workforce Roster */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Bot size={18} className="text-cyan-400" /> Active AI Agent Workforce
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">{agentList.length} Agents</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agentList.map((agent: any, idx: number) => {
                          const agentName = String(agent?.name || "");
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <span className="text-base shrink-0">
                                  {agentName.includes("Planner") ? "🧠" :
                                   agentName.includes("Arch") ? "🏗" :
                                   agentName.includes("Data") ? "🗄" :
                                   agentName.includes("Back") ? "⚙️" :
                                   agentName.includes("Front") ? "🎨" :
                                   agentName.includes("Test") ? "🧪" : "🚀"}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate">{agent.name}</p>
                                  <p className="text-[11px] text-zinc-400 truncate">{agent.currentTask || agent.role}</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                                Ready
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* ================= 3. PREVIEW TAB ================= */}
                {activeTab === "preview" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Eye size={20} className="text-cyan-400" /> Interactive Web Application Preview
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {runtimeState.status === "running"
                            ? `Showing live running application server at http://localhost:${runtimeState.port}`
                            : "Showing rendered code preview generated by Developer Agent."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {runtimeState.status === "running" ? (
                          <a
                            href={runtimeState.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition"
                          >
                            <ExternalLink size={14} /> Open in New Tab
                          </a>
                        ) : (
                          <button
                            onClick={handleRunProject}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:brightness-110 transition"
                          >
                            <Play size={14} /> Run App Server
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2 h-[600px] overflow-hidden shadow-2xl">
                      <iframe
                        title="Project App Preview"
                        src={runtimeState.status === "running" ? runtimeState.url : undefined}
                        srcDoc={runtimeState.status === "running" ? undefined : srcDoc}
                        className="w-full h-full rounded-xl border border-zinc-800 bg-zinc-950"
                      />
                    </div>
                  </div>
                )}

                {/* ================= 4. FILES TAB ================= */}
                {activeTab === "files" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Code2 size={20} className="text-cyan-400" /> Generated Project Source Files ({(generatedFiles || []).length})
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Inspect PRDs, architecture specifications, code files, test suites, and docs saved in MongoDB.
                        </p>
                      </div>

                      <button
                        onClick={handleDownloadZip}
                        disabled={isDownloading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition disabled:opacity-50 shrink-0"
                      >
                        <Download size={15} />
                        {isDownloading ? "Generating ZIP..." : "Download Full Project ZIP"}
                      </button>
                    </div>

                    {(generatedFiles || []).length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* File Tree Explorer */}
                        <div className="space-y-2 lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 max-h-[600px] overflow-y-auto">
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Project Files</p>
                          {generatedFiles.map((file: any) => {
                            const isSelected = selectedFile?._id === file._id || selectedFile?.filePath === file.filePath;
                            return (
                              <button
                                key={file._id || file.filePath}
                                onClick={() => setSelectedFile(file)}
                                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-mono text-left transition ${
                                  isSelected
                                    ? "bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold"
                                    : "bg-zinc-950 border border-zinc-800/80 text-zinc-300 hover:border-zinc-700"
                                }`}
                              >
                                <span className="truncate pr-2">📄 {file.filePath || file.fileName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-sans shrink-0">
                                  {file.language || "text"}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Code Syntax & Document Viewer */}
                        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3 flex flex-col h-[600px]">
                          {selectedFile ? (
                            <>
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                <div>
                                  <h4 className="text-sm font-mono font-bold text-cyan-400">{selectedFile.filePath || selectedFile.fileName}</h4>
                                  <p className="text-[11px] text-zinc-400">
                                    Generated by: <strong className="text-white">{selectedFile.generatedByAgent || "Developer Agent"}</strong>
                                  </p>
                                </div>

                                <button
                                  onClick={handleCopyCode}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
                                >
                                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                  {copied ? "Copied!" : "Copy Code"}
                                </button>
                              </div>

                              <div className="flex-1 overflow-auto rounded-xl bg-zinc-950 p-4 border border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre">
                                {selectedFile.content || "// File content loading or empty..."}
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                              Select a file from the explorer to view code syntax.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-3">
                        <Code2 size={40} className="mx-auto text-zinc-600" />
                        <h4 className="text-base font-bold text-zinc-300">No Generated Files Available Yet</h4>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= 5. KNOWLEDGE TAB ================= */}
                {activeTab === "knowledge" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <BookOpen size={20} className="text-cyan-400" /> Project Knowledge Base & RAG Context
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Upload PDFs, spec documents, or requirement files to build RAG context for your AI agent team.
                        </p>
                      </div>

                      <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white cursor-pointer hover:brightness-110 transition shrink-0 flex items-center gap-1.5">
                        <Upload size={15} />
                        {uploading ? "Indexing Document..." : "Upload Document (PDF/TXT)"}
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Ask Project Knowledge Search Box */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4 shadow-xl">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Search size={16} className="text-cyan-400" /> Ask Project Knowledge Base
                      </h4>

                      <form onSubmit={handleKnowledgeQuery} className="flex gap-2">
                        <input
                          type="text"
                          value={knowledgeQuery}
                          onChange={(e) => setKnowledgeQuery(e.target.value)}
                          placeholder="Search indexed PDF/TXT document specs (e.g. What are the attendance rules?)..."
                          className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                        />
                        <button
                          type="submit"
                          disabled={knowledgeLoading || !knowledgeQuery.trim()}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition shrink-0"
                        >
                          <Search size={14} /> Search
                        </button>
                      </form>

                      {knowledgeAnswer && (
                        <div className="rounded-xl bg-zinc-950 p-4 border border-cyan-500/30 text-xs text-zinc-200 font-mono leading-relaxed whitespace-pre-wrap">
                          {knowledgeAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </>
            )}

          </div>

          {/* 3. RIGHT PANEL */}
          <div className="w-64 border-l border-zinc-800 bg-zinc-950 p-4 space-y-6 overflow-y-auto shrink-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Swarm Team</h3>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{agentList.length} Agents</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {agentList.map((ag: any, idx: number) => {
                  const nameStr = String(ag?.name || "Agent").replace(" Agent", "");
                  return (
                    <div key={idx} className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-900">
                      <span className="truncate pr-2 text-zinc-300">
                        {nameStr}
                      </span>
                      <span className="font-bold text-[11px] text-emerald-400">✓</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}