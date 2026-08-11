import { Cpu, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <Cpu className="h-8 w-8 text-blue-500" />

          <h1 className="text-2xl font-bold tracking-wide text-white">
            SwarmOS
          </h1>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-zinc-300">

          <a href="#features" className="hover:text-white transition">
            Features
          </a>

          <a href="#docs" className="hover:text-white transition">
            Docs
          </a>

          <a href="#pricing" className="hover:text-white transition">
            Pricing
          </a>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <a
            href="https://github.com/Pooja-1109/SwarmOS-"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 hover:bg-zinc-800 transition"
          >
            <GitBranch size={18} />
            GitHub
          </a>

          <Link
            to="/login"
            className="rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-800 transition"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 transition"
          >
            Create account
          </Link>

        </div>

      </div>
    </nav>
  );
}