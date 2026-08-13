import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../services/projectService";
import { sendChannelProjectCommand } from "../services/channelService";
import { getChatHistory } from "../services/chatService";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  FolderKanban,
  Play,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ActionBtn {
  label: string;
  action: string;
}

interface AgentStatusItem {
  name: string;
  status: string;
}

interface ChatMsg {
  id: string;
  sender: "user" | "swarmos";
  text: string;
  timestamp: string;
  agentStatusUpdates?: AgentStatusItem[];
  actionButtons?: ActionBtn[];
}

export default function WhatsAppPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  // Active agents status tracking
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({
    "Planner Agent": "Ready",
    "Architecture Agent": "Ready",
    "Database Agent": "Ready",
    "Backend Agent": "Ready",
    "Frontend Agent": "Ready",
    "Tester Agent": "Ready",
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadHistory(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0]._id);
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error("Failed to load projects for WhatsApp page:", err);
    }
  };

  const loadHistory = async (projectId: string) => {
    try {
      const history = await getChatHistory(projectId);
      const proj = projects.find((p) => p._id === projectId) || selectedProject;

      if (history && history.length > 0) {
        const formatted: ChatMsg[] = history.map((m: any) => ({
          id: m._id || String(Date.now()),
          sender: m.sender === "user" ? "user" : "swarmos",
          text: m.text,
          timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          agentStatusUpdates: m.agentStatuses || [],
          actionButtons: m.actionButtons || [],
        }));
        setMessages(formatted);
      } else {
        setMessages([
          {
            id: "greeting",
            sender: "swarmos",
            text: `👋 Welcome back! I'm your SwarmOS AI Assistant.

You're working on: **${proj?.title || "Your Software Project"}**

Tell me what you'd like to build, change, or improve today!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionButtons: [
              { label: "▶ Run Project", action: "run_project" },
              { label: "🔒 Add Admin Login", action: "add_admin" },
              { label: "🌓 Dark Theme", action: "dark_theme" },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    const found = projects.find((p) => p._id === id);
    setSelectedProject(found || null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    if (!selectedProjectId && projects.length === 0) {
      alert("Please create a project first before sending commands.");
      return;
    }

    const targetProjectId = selectedProjectId || (projects[0] && projects[0]._id);
    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");
    setLoading(true);
    setErrorMsg("");

    setAgentStatuses({
      "Planner Agent": "Completed",
      "Architecture Agent": "Completed",
      "Database Agent": "Completed",
      "Backend Agent": "Running",
      "Frontend Agent": "Running",
      "Tester Agent": "Waiting",
    });

    try {
      const response = await sendChannelProjectCommand(targetProjectId, "whatsapp", text);

      let replyText = "";
      let statusUpdates: AgentStatusItem[] = [
        { name: "Planner Agent", status: "Completed" },
        { name: "Developer Agent", status: "Completed" },
        { name: "Tester Agent", status: "Completed" },
      ];
      let btns: ActionBtn[] = [{ label: "▶ Run Project", action: "run_project" }];

      if (response && response.orchestratorResult) {
        replyText = response.orchestratorResult.orchestratorMessage;
        if (response.orchestratorResult.agentStatuses) {
          statusUpdates = response.orchestratorResult.agentStatuses;
        }
        if (response.orchestratorResult.actionButtons) {
          btns = response.orchestratorResult.actionButtons;
        }
      } else if (response && response.result && response.result.orchestratorMessage) {
        replyText = response.result.orchestratorMessage;
      } else if (response && response.message) {
        replyText = response.message;
      } else {
        replyText = `Done — I've processed your request "${text}" for ${selectedProject?.title || "your project"} and updated the project source code.`;
      }

      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "swarmos",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentStatusUpdates: statusUpdates,
        actionButtons: btns,
      };

      setMessages((prev) => [...prev, botMsg]);

      setAgentStatuses({
        "Planner Agent": "Completed",
        "Architecture Agent": "Completed",
        "Database Agent": "Completed",
        "Backend Agent": "Completed",
        "Frontend Agent": "Completed",
        "Tester Agent": "Completed",
      });
    } catch (err: any) {
      console.error("WhatsApp Command Error:", err);
      setErrorMsg("Something went wrong while making that change. Your project is still safe. Want me to try again?");
    } finally {
      setLoading(false);
    }
  };

  const handleActionButtonClick = (btn: ActionBtn) => {
    if (btn.action === "run_project" || btn.action === "open_runtime") {
      window.open(`http://localhost:5000/runtime/${selectedProjectId}/`, "_blank");
    } else if (btn.action === "open_workspace" || btn.action === "view_files") {
      navigate(`/workspace?id=${selectedProjectId}`);
    } else if (btn.action === "add_admin") {
      handleSendMessage("Add admin login and role-based access control");
    } else if (btn.action === "dark_theme") {
      handleSendMessage("Change dashboard to dark mode");
    } else {
      handleSendMessage(btn.label);
    }
  };

  const renderMarkdownText = (content: string) => {
    // Simple robust renderer for bold, lists, and inline code
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[•\-\*]\s*/, "");
        return (
          <li key={idx} className="ml-4 list-disc my-1 text-zinc-200">
            {formatInlineFormatting(itemText)}
          </li>
        );
      }

      if (trimmed.startsWith("```")) {
        return null; // Skip code fence toggles in text
      }

      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 leading-relaxed">
          {formatInlineFormatting(line)}
        </p>
      );
    });
  };

  const formatInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-cyan-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-black">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 text-white shadow-lg">
                <MessageSquare size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">SwarmOS Assistant</h1>
                <p className="text-xs text-zinc-400">
                  Conversational AI project partner to instruct, modify, and run your software applications
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● Online | AI Project Builder</span>
          </div>
        </div>

        {/* Top Context Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Target Project</span>
              {projects.length > 0 ? (
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-cyan-400 outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-zinc-400">No project selected</span>
              )}
            </div>
            <FolderKanban size={24} className="text-cyan-400 shrink-0" />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Live Application Runtime</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">http://localhost:5000/runtime/{selectedProjectId}/</span>
            </div>
            <a
              href={`http://localhost:5000/runtime/${selectedProjectId}/`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">WhatsApp Permission</span>
              <span className="text-xs font-bold text-zinc-200">{user?.whatsappNumber || "+91 9876543210"}</span>
            </div>
            <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
          </div>

        </div>

        {/* Main Conversational Chat UI & Live Swarm Reaction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Premium ChatGPT-Style Conversational Interface */}
          <div className="lg:col-span-8 flex justify-center">
            <div className="w-full rounded-[2rem] border border-zinc-800 bg-zinc-950 p-4 shadow-2xl flex flex-col h-[650px]">

              {/* Chat Header Bar */}
              <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3.5 rounded-t-[1.5rem] flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-none text-white">SwarmOS Assistant</h3>
                    <p className="text-[11px] text-zinc-400 leading-none mt-1">
                      Context: <strong className="text-cyan-400">{selectedProject?.title || "SwarmOS Project"}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`http://localhost:5000/runtime/${selectedProjectId}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-1.5 rounded-xl hover:brightness-110 flex items-center gap-1.5 shadow transition"
                  >
                    <Play size={13} /> Run Project
                  </a>
                </div>
              </div>

              {/* Messages Scroll Feed */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto font-sans text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "swarmos" && (
                      <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0 mt-1 shadow">
                        🤖
                      </div>
                    )}

                    <div className="max-w-[82%] space-y-2">
                      <div
                        className={`rounded-2xl p-4 shadow-lg leading-relaxed ${
                          msg.sender === "user"
                            ? "rounded-tr-none bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-medium"
                            : "rounded-tl-none bg-zinc-900 border border-zinc-800 text-zinc-200"
                        }`}
                      >
                        {msg.sender === "swarmos" ? (
                          <div className="space-y-1">{renderMarkdownText(msg.text)}</div>
                        ) : (
                          <p className="whitespace-pre-line">{msg.text}</p>
                        )}

                        <span className="block text-[9px] text-zinc-400 text-right mt-2 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Agent Status Progress Card beneath assistant response */}
                      {msg.sender === "swarmos" && msg.agentStatusUpdates && msg.agentStatusUpdates.length > 0 && (
                        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-3 space-y-2 shadow">
                          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Sparkles size={12} /> Swarm Agent Task Execution
                            </span>
                            <span className="text-emerald-400">100% Completed</span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            {msg.agentStatusUpdates.map((u, idx) => (
                              <div key={idx} className="flex justify-between bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                                <span className="font-semibold text-zinc-300">{u.name}</span>
                                <span className="text-emerald-400 font-bold">✓ {u.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons beneath assistant response */}
                      {msg.sender === "swarmos" && msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.actionButtons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionButtonClick(btn)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-cyan-300 hover:border-cyan-500 hover:bg-cyan-950/40 hover:text-white transition shadow"
                            >
                              <Zap size={12} />
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Animated Thinking State */}
                {loading && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0 shadow">
                      🤖
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-zinc-900 border border-zinc-800 p-4 text-cyan-400 text-xs flex items-center gap-3 shadow-lg">
                      <Sparkles size={16} className="animate-spin text-cyan-400" />
                      <span>SwarmOS is thinking...</span>
                      <div className="flex gap-1 items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div className="rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-200 flex justify-between items-center">
                    <span>{errorMsg}</span>
                    <button
                      onClick={() => handleSendMessage(inputMsg)}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggested Prompts */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex gap-2 overflow-x-auto text-[11px] font-medium no-scrollbar">
                  {[
                    "Build a library management system",
                    "Add admin login and role-based access",
                    "Change dashboard to dark mode",
                    "Add overdue notifications",
                    "Run my project",
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip)}
                      className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-cyan-500 hover:text-white shrink-0 transition"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Composer Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-zinc-900 border-t border-zinc-800 rounded-b-[1.5rem] flex items-end gap-2"
              >
                <textarea
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Message SwarmOS about your project (Press Enter to send)..."
                  className="flex-1 rounded-2xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMsg.trim()}
                  className="h-10 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 transition shrink-0 shadow-lg"
                >
                  <Send size={15} className="mr-1" /> Send
                </button>
              </form>

            </div>
          </div>

          {/* Right Column: Live Swarm Agent Reaction Status */}
          <div className="lg:col-span-4 space-y-6">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2 text-white">
                  <Bot size={18} className="text-cyan-400" />
                  Live AI Swarm Reaction
                </h3>
                <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" /> ACTIVE
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                When you chat with SwarmOS, the orchestrator updates project requirements, generates new source code files, and materializes the build.
              </p>

              <div className="space-y-2.5 pt-2">
                {Object.entries(agentStatuses).map(([agentName, status]) => (
                  <div
                    key={agentName}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <span className="font-semibold text-white">{agentName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        status === "Running"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" /> Quick Project Actions
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`http://localhost:5000/runtime/${selectedProjectId}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-900 transition"
                >
                  <ExternalLink size={14} /> Open App
                </a>
                <button
                  onClick={() => handleSendMessage("Re-run full quality assurance and security scan")}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold flex items-center justify-center gap-1.5 hover:border-cyan-500 transition"
                >
                  <Sparkles size={14} /> QA Scan
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
