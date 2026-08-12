import { Link } from "react-router-dom";
import { Cpu, GitBranch, MessageSquare, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">SwarmOS</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Autonomous AI agent swarms collaborating to plan, architect, build, test, and evolve full-stack software from natural language prompts and WhatsApp interactions.
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400">
                <Zap size={12} /> Autonomous AI Swarm
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400">
                <MessageSquare size={12} /> WhatsApp Webhooks
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Product</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
              <li><a href="#agents" className="hover:text-white transition">AI Agents</a></li>
              <li><Link to="/whatsapp" className="hover:text-white transition">WhatsApp Integration</Link></li>
              <li><Link to="/workspace" className="hover:text-white transition">Developer Workspace</Link></li>
            </ul>
          </div>

          {/* Col 3: Agents */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Agents</h3>
            <ul className="space-y-2 text-xs">
              <li><span className="text-zinc-400">🧠 Planner Agent</span></li>
              <li><span className="text-zinc-400">📋 Requirements Agent</span></li>
              <li><span className="text-zinc-400">🏗 Architecture Agent</span></li>
              <li><span className="text-zinc-400">⚙️ Backend Agent</span></li>
              <li><span className="text-zinc-400">🎨 Frontend Agent</span></li>
              <li><span className="text-zinc-400">🧪 Testing & Security Agent</span></li>
            </ul>
          </div>

          {/* Col 4: Resources & Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/Pooja-1109/SwarmOS-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <GitBranch size={14} /> GitHub Repository
                </a>
              </li>
              <li><a href="#docs" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} SwarmOS AI Platform. Built for Hackathon Excellence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Systems Operational
            </span>
            <span>v2.0.0-release</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
