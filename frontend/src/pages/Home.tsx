import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Brain,
  FileText,
  Layers,
  Code2,
  Database,
  TestTube,
  Rocket,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Smartphone,
  Send,
  Bot,
} from "lucide-react";

export default function Home() {
  // Interactive Live Agent Execution simulation state
  const [agents, setAgents] = useState([
    { id: 1, name: "Planner Agent", icon: Brain, role: "Analyzing requirements & feature breakdown", status: "Running", progress: 85, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
    { id: 2, name: "Requirements Agent", icon: FileText, role: "Converting prompt to user stories & specs", status: "Ready", progress: 100, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
    { id: 3, name: "Architecture Agent", icon: Layers, role: "Designing system components & topology", status: "Running", progress: 60, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
    { id: 4, name: "Database Agent", icon: Database, role: "Designing MongoDB schemas & indexes", status: "Waiting", progress: 0, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    { id: 5, name: "Backend Agent", icon: Code2, role: "Generating Express REST APIs & middleware", status: "Waiting", progress: 0, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { id: 6, name: "Frontend Agent", icon: Zap, role: "Building React components & Tailwind UI", status: "Waiting", progress: 0, color: "text-pink-400 border-pink-500/30 bg-pink-500/10" },
    { id: 7, name: "Testing Agent", icon: TestTube, role: "Running unit tests & vulnerability scans", status: "Waiting", progress: 0, color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
    { id: 8, name: "Deployment Agent", icon: Rocket, role: "Packaging docker containers & deployment", status: "Waiting", progress: 0, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  ]);

  // Dynamic simulation timer for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((ag) => {
          if (ag.status === "Running") {
            const nextProgress = Math.min(100, ag.progress + 15);
            return {
              ...ag,
              progress: nextProgress,
              status: nextProgress === 100 ? "Completed" : "Running",
            };
          }
          return ag;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500 selection:text-black font-sans">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background glows */}
        <div className="absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-600/20 to-purple-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute right-10 top-40 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900/90 border border-zinc-800 px-4 py-1.5 text-xs font-semibold text-cyan-400 shadow-xl"
              >
                <Sparkles size={14} className="animate-spin text-cyan-400" />
                <span>Next-Gen Autonomous Engineering Swarm</span>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                Build Software with <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  AI Agent Teams.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Describe your idea once. SwarmOS plans, builds, tests and evolves your software through a specialized team of autonomous AI agents working synchronously.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-cyan-950/50 hover:brightness-110 transition group"
                >
                  Start Building
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-7 py-4 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
                >
                  See How It Works
                </a>
              </motion.div>

              {/* Flow Pill Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-mono text-zinc-500"
              >
                <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
                  IDEA
                </span>
                <span className="text-cyan-400">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Bot size={14} /> AI AGENTS
                </span>
                <span className="text-cyan-400">→</span>
                <span className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold">
                  FULL-STACK SOFTWARE
                </span>
              </motion.div>
            </div>

            {/* Hero Right: Interactive Animated Visual Nodes Graph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl">

                {/* Top Terminal Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs font-mono text-zinc-400">swarmos-orchestrator.active</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" /> LIVE SWARM
                  </span>
                </div>

                {/* Connected Agent Nodes Graphic */}
                <div className="relative py-4 space-y-3">
                  {/* Central Idea Node */}
                  <div className="mx-auto max-w-xs rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-3 text-center shadow-lg shadow-cyan-900/20">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">User Natural Language Input</span>
                    <p className="text-xs font-medium text-white mt-0.5">"Build an Attendance Management System"</p>
                  </div>

                  {/* Connecting lines graphic */}
                  <div className="h-6 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-gradient-to-b from-cyan-500 to-purple-500 animate-pulse" />
                  </div>

                  {/* Swarm Agents Grid Nodes */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-purple-500/30 bg-zinc-900/90 p-3 space-y-1 hover:border-purple-500 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <Brain size={14} /> Planner
                        </span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Requirements breakdown</p>
                    </div>

                    <div className="rounded-xl border border-cyan-500/30 bg-zinc-900/90 p-3 space-y-1 hover:border-cyan-500 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <Layers size={14} /> Architect
                        </span>
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">System design topology</p>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-zinc-900/90 p-3 space-y-1 hover:border-amber-500 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Code2 size={14} /> Backend
                        </span>
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Express REST APIs</p>
                    </div>

                    <div className="rounded-xl border border-pink-500/30 bg-zinc-900/90 p-3 space-y-1 hover:border-pink-500 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                          <Zap size={14} /> Frontend
                        </span>
                        <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">React + Tailwind components</p>
                    </div>
                  </div>

                  {/* Connecting lines */}
                  <div className="h-6 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-gradient-to-b from-purple-500 to-emerald-500 animate-pulse" />
                  </div>

                  {/* Output Node */}
                  <div className="mx-auto max-w-xs rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center shadow-lg">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">Deployed Production Software</span>
                    <p className="text-xs font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Attendance App Ready
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= LIVE AGENT EXECUTION SECTION ================= */}
      <section id="agents-live" className="py-20 border-t border-zinc-800/80 bg-zinc-950 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Agent Swarm</span> Live Execution
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Watch real-time multi-agent execution as autonomous specialists collaborate on software engineering tasks.
            </p>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 hover:border-zinc-700 transition shadow-xl space-y-4 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${agent.color}`}>
                      <Icon size={22} />
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        agent.status === "Running"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse"
                          : agent.status === "Completed" || agent.status === "Ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{agent.role}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-zinc-500">Progress</span>
                      <span className="text-cyan-400">{agent.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section id="how-it-works" className="py-24 border-t border-zinc-800/80 bg-zinc-950/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Streamlined Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              How SwarmOS Transforms Ideas into Software
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              A 4-step autonomous process engineered for clarity, speed, and continuous software evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 shadow-xl">
              <span className="text-4xl font-extrabold text-cyan-500/20 font-mono">01</span>
              <h3 className="text-xl font-bold text-white">Describe</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tell SwarmOS what you want to build in plain natural language, or send a quick prompt over WhatsApp.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 shadow-xl">
              <span className="text-4xl font-extrabold text-blue-500/20 font-mono">02</span>
              <h3 className="text-xl font-bold text-white">Plan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI agents break down your concept into detailed technical requirements, architecture blueprints, and DB schemas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 shadow-xl">
              <span className="text-4xl font-extrabold text-purple-500/20 font-mono">03</span>
              <h3 className="text-xl font-bold text-white">Build</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Specialized agents work concurrently writing clean backend APIs, responsive frontends, and security checks.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4 shadow-xl">
              <span className="text-4xl font-extrabold text-emerald-500/20 font-mono">04</span>
              <h3 className="text-xl font-bold text-white">Ship</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Test, iterate, and deploy your software directly from the developer workspace or via mobile WhatsApp updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI AGENT TEAM SECTION ================= */}
      <section id="agents" className="py-24 border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Autonomous Workforce</span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Meet Your Specialized AI Agent Team
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Every phase of software engineering is handled by a dedicated agent with domain expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🧠</div>
              <h3 className="text-lg font-bold text-white">Planner Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Understands the user's software idea and formulates a complete step-by-step development roadmap.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">📋</div>
              <h3 className="text-lg font-bold text-white">Requirements Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Converts natural language prompts into structured technical user stories, specs, and acceptance criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🏗</div>
              <h3 className="text-lg font-bold text-white">Architecture Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Designs high-level system architecture, microservices, component boundaries, and technology stacks.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🎨</div>
              <h3 className="text-lg font-bold text-white">Frontend Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Builds modern, responsive user interfaces using React, Tailwind CSS, Lucide icons, and component libraries.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">⚙️</div>
              <h3 className="text-lg font-bold text-white">Backend Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Constructs robust RESTful APIs, authentication middleware, server logic, and service integrations.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🗄</div>
              <h3 className="text-lg font-bold text-white">Database Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Architects MongoDB data models, indexes, schemas, and relational trace matrices.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🧪</div>
              <h3 className="text-lg font-bold text-white">Testing Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Executes automated test suites, quality gates, vulnerability assessments, and self-healing fixes.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
              <div className="text-2xl">🚀</div>
              <h3 className="text-lg font-bold text-white">Deployment Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Prepares production configurations, build pipelines, and automated containerization artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHATSAPP INNOVATION SECTION ================= */}
      <section id="whatsapp" className="py-24 border-t border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Description */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <Smartphone size={14} />
                <span>Conversational Mobile Innovation</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Your AI Development Team, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  in Your Pocket.
                </span>
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Don't stay in front of your laptop to manage your project. SwarmOS is designed to let you communicate with your AI development team through WhatsApp.
              </p>

              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Send project ideas directly via WhatsApp chat to assemble an AI team.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Request feature updates like "Add Excel export" or "Enable dark mode" on the go.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Receive automated progress notifications and agent status reports.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Link
                  to="/whatsapp"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-xs font-semibold text-white shadow-lg transition"
                >
                  <MessageSquare size={16} />
                  Try WhatsApp Live Demo
                </Link>
                <span className="text-[11px] font-mono text-zinc-500">
                  Supports Mock Test & Meta WhatsApp Cloud API
                </span>
              </div>
            </div>

            {/* Right Phone Mock UI */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-sm rounded-[3rem] border-4 border-zinc-800 bg-zinc-950 p-4 shadow-2xl relative">
                {/* Top Phone Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-zinc-800" />

                {/* Chat Screen */}
                <div className="rounded-[2.2rem] bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col h-[520px] mt-4">

                  {/* WhatsApp Header */}
                  <div className="bg-emerald-800/90 p-3.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        🤖
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-none">SwarmOS AI Team</p>
                        <p className="text-[10px] text-emerald-200 leading-none mt-1">Online • Verified Swarm</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto font-sans text-xs">
                    {/* User msg 1 */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-emerald-700/80 p-2.5 text-white shadow">
                        I want to build an attendance management system for my college.
                        <span className="block text-[9px] text-emerald-200 text-right mt-1">10:14 AM</span>
                      </div>
                    </div>

                    {/* SwarmOS msg 1 */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-zinc-800 border border-zinc-700 p-2.5 text-zinc-200 shadow space-y-1.5">
                        <p>Got it. I've created a project and started planning.</p>

                        <div className="pt-1 space-y-1 text-[10px]">
                          <div className="flex justify-between items-center bg-purple-950/40 p-1 rounded border border-purple-800/40">
                            <span>🧠 Planner Agent</span>
                            <span className="text-emerald-400 font-bold">Completed</span>
                          </div>
                          <div className="flex justify-between items-center bg-cyan-950/40 p-1 rounded border border-cyan-800/40">
                            <span>🎨 Frontend Agent</span>
                            <span className="text-cyan-400 font-bold animate-pulse">Building</span>
                          </div>
                          <div className="flex justify-between items-center bg-zinc-900 p-1 rounded">
                            <span>⚙️ Backend Agent</span>
                            <span className="text-zinc-500">Waiting</span>
                          </div>
                        </div>

                        <span className="block text-[9px] text-zinc-500 text-right">10:15 AM</span>
                      </div>
                    </div>

                    {/* User msg 2 */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-emerald-700/80 p-2.5 text-white shadow">
                        Add Excel export.
                        <span className="block text-[9px] text-emerald-200 text-right mt-1">10:17 AM</span>
                      </div>
                    </div>

                    {/* SwarmOS msg 2 */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-zinc-800 border border-zinc-700 p-2.5 text-zinc-200 shadow">
                        Change request received. Frontend and Backend agents are working on it. 🚀
                        <span className="block text-[9px] text-zinc-500 text-right mt-1">10:17 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Mock */}
                  <div className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
                    <input
                      disabled
                      placeholder="Type a WhatsApp message..."
                      className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 outline-none"
                    />
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Send size={12} />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= WORKSPACE PREVIEW SECTION ================= */}
      <section className="py-24 border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">High-Performance Environment</span>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Professional AI Developer Workspace
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Monitor active tasks, agent outputs, codebase artifacts, and live test runs in an integrated command center.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Workspace Mock Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-white">Attendance Management System</h4>
                  <p className="text-[11px] text-zinc-400">Status: <span className="text-cyan-400 font-semibold">Running</span> • Progress: <span className="text-emerald-400 font-semibold">78%</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300">Run Agents</span>
                <span className="px-3 py-1 rounded-lg bg-cyan-600 text-xs font-semibold text-white">Open Preview</span>
              </div>
            </div>

            {/* Mock Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 text-xs">
              {/* Left Agent List */}
              <div className="lg:col-span-3 rounded-xl bg-zinc-950 p-3 space-y-2 border border-zinc-800">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Agent Team</p>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-zinc-900 border border-purple-500/30 flex justify-between">
                    <span>🧠 Planner Agent</span>
                    <span className="text-emerald-400 font-bold">Ready</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-cyan-500/30 flex justify-between">
                    <span>⚙️ Backend Agent</span>
                    <span className="text-cyan-400 font-bold animate-pulse">Running</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-pink-500/30 flex justify-between">
                    <span>🎨 Frontend Agent</span>
                    <span className="text-cyan-400 font-bold animate-pulse">Running</span>
                  </div>
                </div>
              </div>

              {/* Center Activity Timeline */}
              <div className="lg:col-span-6 rounded-xl bg-zinc-950 p-3 space-y-2 border border-zinc-800 font-mono">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Execution Timeline</p>
                <div className="space-y-2 text-[11px]">
                  <div className="text-purple-400">09:42 Planner Agent started requirements mapping</div>
                  <div className="text-cyan-400">09:43 Architecture blueprint generated</div>
                  <div className="text-emerald-400">09:45 Database schema created in MongoDB</div>
                  <div className="text-amber-400">09:46 Backend Agent generated REST controllers</div>
                  <div className="text-pink-400">09:48 Frontend Agent generating React views...</div>
                </div>
              </div>

              {/* Right Tasks */}
              <div className="lg:col-span-3 rounded-xl bg-zinc-950 p-3 space-y-2 border border-zinc-800">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Active Tasks</p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-zinc-900 text-zinc-300">Create Attendance API Routes</div>
                  <div className="p-2 rounded bg-zinc-900 text-zinc-300">Build Teacher Dashboard UI</div>
                  <div className="p-2 rounded bg-zinc-900 text-zinc-300">Add Excel Export Feature</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-24 border-t border-zinc-800/80 bg-gradient-to-b from-zinc-950 to-black text-center relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative space-y-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your idea is the starting point. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Let an AI team build the rest.
            </span>
          </h2>

          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Experience the future of conversational multi-agent software development. Start building today.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-9 py-4 text-sm font-bold text-white shadow-2xl shadow-cyan-950 hover:brightness-110 transition group"
            >
              Start Building with SwarmOS
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}