import { useState } from "react";
import { Link } from "react-router-dom";
import { Cpu, GitBranch, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">

        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition-transform">
            <Cpu className="h-6 w-6" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SwarmOS
              <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                v2.0 AI
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono leading-none">Autonomous Agent Teams</p>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
            How it Works
          </a>
          <a href="#agents" className="hover:text-cyan-400 transition-colors">
            Agents
          </a>
          <a href="#whatsapp" className="hover:text-cyan-400 transition-colors">
            WhatsApp
          </a>
          <a href="#docs" className="hover:text-cyan-400 transition-colors">
            Docs
          </a>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/Pooja-1109/SwarmOS-"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
          >
            <GitBranch size={16} />
            GitHub
          </a>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-900/20 hover:brightness-110 transition"
            >
              <Sparkles size={14} />
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-900/30 hover:brightness-110 transition"
              >
                Start Building
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-800 bg-zinc-950/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 text-sm font-medium text-zinc-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#agents"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors"
            >
              Agents
            </a>
            <a
              href="#whatsapp"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-cyan-400 transition-colors"
            >
              Docs
            </a>

            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <a
                href="https://github.com/Pooja-1109/SwarmOS-"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300"
              >
                <GitBranch size={16} />
                GitHub Repository
              </a>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center rounded-xl bg-cyan-600 py-2.5 text-xs font-semibold text-white"
                  >
                    Start Building
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}