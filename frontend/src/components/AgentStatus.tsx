interface Agent {
  name: string;
  status: string;
  role?: string;
}

interface Props {
  agents: Agent[];
}

export default function AgentStatus({ agents }: Props) {
  if (!agents || agents.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {agents.map((agent) => {
        const isWorking = agent.status === "Working" || agent.status === "Thinking" || agent.status === "Running";
        const isDone = agent.status === "Completed";

        return (
          <div
            key={agent.name}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition ${
              isDone
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isWorking
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse"
                : "bg-zinc-950 border-zinc-800 text-zinc-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{agent.name.split(" ")[0]}</span>
            <span className="opacity-70 text-[10px]">({agent.status})</span>
          </div>
        );
      })}
    </div>
  );
}