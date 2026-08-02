interface AgentCardProps {
  title: string;
  status: string;
}

export default function AgentCard({ title, status }: AgentCardProps) {
  const color =
    status === "Completed"
      ? "text-green-400"
      : status === "Running"
      ? "text-yellow-400 animate-pulse"
      : "text-zinc-400";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500">
      <h3 className="text-xl font-bold">{title}</h3>

      <p className={`mt-4 font-semibold ${color}`}>
        {status}
      </p>
    </div>
  );
}