import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { Cpu, Lock, Sliders, CheckCircle2 } from "lucide-react";

export default function Settings() {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState("0.7");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="mb-8 text-4xl font-bold text-cyan-400">⚙️ Platform Settings</h1>

        <div className="max-w-4xl space-y-8">
          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400">
              <CheckCircle2 size={18} />
              Settings updated successfully!
            </div>
          )}

          {/* AI Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-bold">AI Engine & Model Configuration</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Selected LLM Provider</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  <option value="custom-rag-agent">SwarmOS Autonomous Fallback Swarm</option>
                </select>
                <p className="mt-2 text-xs text-zinc-400">
                  Note: Configure <code className="text-cyan-400 bg-zinc-950 px-1 py-0.5 rounded">AI_API_KEY</code> in backend <code className="text-cyan-400 bg-zinc-950 px-1 py-0.5 rounded">.env</code> to connect live Gemini API.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">AI Creativity (Temperature: {temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300">
                <span className="font-semibold text-cyan-400">🔒 Security Notice:</span> API credentials are managed strictly in server environment variables and never exposed to the frontend browser.
              </div>

              <button
                type="submit"
                className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold hover:bg-cyan-500 transition"
              >
                Save AI Settings
              </button>
            </form>
          </div>

          {/* Project Preferences */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold">Project Default Preferences</h2>
            </div>

            <div className="space-y-4 text-sm text-zinc-300">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <h3 className="font-semibold text-white">Auto-Trigger Multi-Agent Swarm</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">Automatically trigger Planner & Dev Agents upon project creation</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <h3 className="font-semibold text-white">RAG Auto-Indexing</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">Chunk and index uploaded documents immediately into vector knowledge base</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-emerald-400" size={24} />
              <h2 className="text-2xl font-bold">Session & Authentication</h2>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Your active session uses JWT tokens signed with backend secrets.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              STATUS: AUTHENTICATED (JWT Active)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
