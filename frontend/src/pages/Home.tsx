import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AgentCard from "@/components/agents/AgentCard";
import ExecutionPanel from "@/components/agents/ExecutionPanel";
import { motion } from "framer-motion";
import { initialAgents } from "@/data/agents";

export default function Home() {
  const [agents, setAgents] = useState(initialAgents);
  const [logs, setLogs] = useState<string[]>([]);
  const [projectIdea, setProjectIdea] = useState("");

  const startGeneration = async () => {
    if (!projectIdea.trim()) {
      alert("Please enter a project idea!");
      return;
    }

    // Reset agents
    const updated = initialAgents.map((agent) => ({
      ...agent,
      status:
        agent.title === "🤖 Planner" || agent.title === "📋 Requirements"
          ? "Ready"
          : "Waiting",
    }));

    setAgents(updated);
    setLogs([
      `🚀 Starting project generation...`,
      `💡 Project: ${projectIdea}`,
    ]);

    const names = [
      "Planner",
      "Requirements",
      "Architecture",
      "Database",
      "Backend",
      "Frontend",
      "Testing",
      "Deployment",
    ];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = "Running";
      setAgents([...updated]);

      setLogs((prev) => [
        ...prev,
        `⚡ ${names[i]} Agent started...`,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      updated[i].status = "Completed";
      setAgents([...updated]);

      setLogs((prev) => [
        ...prev,
        `✅ ${names[i]} Agent completed.`,
      ]);
    }

    setLogs((prev) => [
      ...prev,
      "🎉 Project generated successfully!",
    ]);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <Navbar />

      {/* Background Glow */}
      <div className="absolute left-1/2 top-40 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />

      <section className="relative flex flex-col items-center justify-center px-6 pt-24">

        {/* Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-6xl font-extrabold leading-tight"
        >
          Build Software with
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            AI Agent Teams
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-2xl text-center text-lg text-zinc-400"
        >
          Turn your idea into a complete software project using intelligent AI
          agents working together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/login"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:border-blue-500 hover:text-blue-300"
          >
            Create account
          </a>
        </motion.div>

        {/* Input */}
        <div className="mt-10 flex w-full max-w-3xl gap-4">
          <input
            type="text"
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            placeholder="Describe your project..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-5 outline-none focus:border-blue-500"
          />

          <button
            onClick={startGeneration}
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
          >
            🚀 Generate
          </button>
        </div>

        {/* Agent Cards */}
        <div className="mt-20 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              title={agent.title}
              status={agent.status}
            />
          ))}
        </div>

        {/* Execution Panel */}
        <ExecutionPanel logs={logs} />

      </section>
    </div>
  );
}