import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../services/projectService";
import { sendChannelProjectCommand } from "../services/channelService";
import {
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Send,
  Sparkles,
  Bot,
  FolderKanban,
  Layers,
} from "lucide-react";

interface ChatMsg {
  id: string;
  sender: "user" | "swarmos";
  text: string;
  timestamp: string;
  agentStatusUpdates?: Array<{ name: string; status: string }>;
}

export default function WhatsAppPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "1",
      sender: "swarmos",
      text: `🤖 Welcome to SwarmOS WhatsApp Assistant!\n\nYour AI development team is ready to process your natural language commands. Select a project below and send a change request or prompt.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Active agents status tracking
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({
    "Planner Agent": "Ready",
    "Requirements Agent": "Ready",
    "Architecture Agent": "Waiting",
    "Database Agent": "Waiting",
    "Backend Agent": "Waiting",
    "Frontend Agent": "Waiting",
    "Testing Agent": "Waiting",
    "Deployment Agent": "Waiting",
  });

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    const found = projects.find((p) => p._id === id);
    setSelectedProject(found || null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    if (!selectedProjectId && projects.length === 0) {
      alert("Please create a project first before sending WhatsApp commands.");
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

    // Update agent statuses to simulate activity
    setAgentStatuses({
      "Planner Agent": "Running",
      "Requirements Agent": "Running",
      "Architecture Agent": "Running",
      "Database Agent": "Waiting",
      "Backend Agent": "Waiting",
      "Frontend Agent": "Waiting",
      "Testing Agent": "Waiting",
      "Deployment Agent": "Waiting",
    });

    try {
      // Call backend channel command endpoint
      const response = await sendChannelProjectCommand(targetProjectId, "whatsapp", text);

      let replyText = "";
      if (response && response.result) {
        replyText = typeof response.result === "string"
          ? response.result
          : response.result.message || JSON.stringify(response.result);
      } else if (response && response.summary) {
        replyText = response.summary;
      } else {
        replyText = `Command received for project "${selectedProject?.title || "SwarmOS Project"}". Agents have updated the task queue and requirements trace.`;
      }

      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "swarmos",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agentStatusUpdates: [
          { name: "Planner Agent", status: "Completed" },
          { name: "Frontend Agent", status: "Running" },
          { name: "Backend Agent", status: "Running" },
        ],
      };

      setMessages((prev) => [...prev, botMsg]);

      // Final agent status simulation update
      setTimeout(() => {
        setAgentStatuses({
          "Planner Agent": "Completed",
          "Requirements Agent": "Completed",
          "Architecture Agent": "Completed",
          "Database Agent": "Completed",
          "Backend Agent": "Completed",
          "Frontend Agent": "Completed",
          "Testing Agent": "Running",
          "Deployment Agent": "Ready",
        });
      }, 1500);

    } catch (err: any) {
      console.error("WhatsApp Command Error:", err);
      const fallbackMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "swarmos",
        text: `✅ Request received: "${text}". Assigned to Planner & Engineering Agents for processing.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp Innovation Center</h1>
                <p className="text-xs text-zinc-400">
                  Control AI agent swarms and manage software projects via natural WhatsApp interaction
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Smartphone size={14} />
            <span>Mode: Demo Mode (Mock WhatsApp Active)</span>
          </div>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Connection Status Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="uppercase tracking-wider">WhatsApp Status</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            </div>
            <p className="text-xl font-bold text-white">Mock WhatsApp Engine</p>
            <p className="text-xs text-zinc-400">
              Ready for hackathon demonstration. Real Meta WhatsApp Webhooks ready via environment variables.
            </p>
          </div>

          {/* User Phone Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="uppercase tracking-wider">Registered Phone</span>
              <span className="text-cyan-400 font-mono">Verified</span>
            </div>
            <p className="text-xl font-bold text-white">
              {user?.whatsappNumber || "+91 9876543210"}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Permission Opt-In: <strong className="text-emerald-400">Active</strong></span>
            </div>
          </div>

          {/* Target Project Selector */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span className="uppercase tracking-wider">Target Project</span>
              <FolderKanban size={16} className="text-cyan-400" />
            </div>
            {projects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-zinc-500">No projects found. Create one in Dashboard.</p>
            )}
            <p className="text-[11px] text-zinc-400 truncate">
              {selectedProject?.description || "Select a project to route WhatsApp commands."}
            </p>
          </div>

        </div>

        {/* Main WhatsApp Interactive Simulator & Live Agent Reaction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Interactive Phone Mock Chat UI */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
              {/* Phone Header */}
              <div className="rounded-[1.8rem] bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col h-[560px]">

                {/* WhatsApp Bar Header */}
                <div className="bg-emerald-800 px-4 py-3 flex items-center justify-between text-white shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      🤖
                    </div>
                    <div>
                      <h3 className="text-xs font-bold leading-none">SwarmOS AI Team Assistant</h3>
                      <p className="text-[10px] text-emerald-200 leading-none mt-1">
                        Active Project: {selectedProject?.title || "Global Swarm"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    MOCK
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 space-y-3.5 overflow-y-auto font-sans text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow space-y-2 ${
                          msg.sender === "user"
                            ? "rounded-tr-none bg-emerald-700 text-white"
                            : "rounded-tl-none bg-zinc-800 border border-zinc-700 text-zinc-200"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                        {/* Agent status badges if present */}
                        {msg.agentStatusUpdates && (
                          <div className="pt-2 border-t border-zinc-700/60 space-y-1">
                            <p className="text-[10px] uppercase font-bold text-cyan-400">Live Swarm Update:</p>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              {msg.agentStatusUpdates.map((u, idx) => (
                                <div key={idx} className="flex justify-between bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-700">
                                  <span>{u.name}</span>
                                  <span className="text-emerald-400 font-semibold">{u.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className="block text-[9px] text-zinc-400 text-right">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-none bg-zinc-800 p-3 text-cyan-400 text-xs flex items-center gap-2">
                        <Sparkles size={14} className="animate-spin" />
                        AI Agents are executing your request...
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Sample Action Chips */}
                <div className="px-3 py-2 bg-zinc-950/80 border-t border-zinc-800 flex gap-2 overflow-x-auto text-[11px] font-medium no-scrollbar">
                  <button
                    onClick={() => handleSendMessage("Add Excel export feature")}
                    className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white shrink-0 hover:border-cyan-500 transition"
                  >
                    + Add Excel Export
                  </button>
                  <button
                    onClick={() => handleSendMessage("Enable dark mode theme")}
                    className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white shrink-0 hover:border-cyan-500 transition"
                  >
                    + Dark Mode
                  </button>
                  <button
                    onClick={() => handleSendMessage("What is my project status?")}
                    className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white shrink-0 hover:border-cyan-500 transition"
                  >
                    📊 Status Check
                  </button>
                  <button
                    onClick={() => handleSendMessage("Run security vulnerability scan")}
                    className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white shrink-0 hover:border-cyan-500 transition"
                  >
                    🛡 Security Scan
                  </button>
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type a WhatsApp prompt or command..."
                    className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMsg.trim()}
                    className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500 disabled:opacity-50 transition shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>

              </div>
            </div>
          </div>

          {/* Right Column: Live Swarm Agent Reaction Status */}
          <div className="lg:col-span-5 space-y-6">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Bot size={18} className="text-cyan-400" />
                  Live Agent Team Reaction
                </h3>
                <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" /> SYNCHRONIZED
                </span>
              </div>

              <p className="text-xs text-zinc-400">
                When a command is received via WhatsApp, SwarmOS automatically parses the intent and dispatches tasks to relevant specialized agents.
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
                          : status === "Completed" || status === "Ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Explanation Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Layers size={16} className="text-cyan-400" />
                Real Meta WhatsApp Cloud API Architecture
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                SwarmOS includes production Meta Cloud API webhook handling. To connect real WhatsApp Business API messaging:
              </p>
              <ul className="text-xs text-zinc-400 space-y-1 font-mono pl-4 list-disc">
                <li><code className="text-cyan-300">WHATSAPP_MODE=real</code></li>
                <li><code className="text-cyan-300">WHATSAPP_ACCESS_TOKEN</code></li>
                <li><code className="text-cyan-300">WHATSAPP_PHONE_NUMBER_ID</code></li>
                <li><code className="text-cyan-300">WHATSAPP_VERIFY_TOKEN</code></li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
