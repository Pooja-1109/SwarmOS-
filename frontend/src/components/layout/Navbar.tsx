import { Cpu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Cpu className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide text-white">
            SwarmOS
          </h1>
        </div>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-zinc-300">
          <a href="#" className="hover:text-white transition">
            Features
          </a>

          <a href="#" className="hover:text-white transition">
            Docs
          </a>

          <a href="#" className="hover:text-white transition">
            Pricing
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 hover:bg-zinc-800 transition">
            GitHub
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium hover:bg-blue-500 transition">
            Login
          </button>
        </div>

      </div>
    </nav>
  );
}