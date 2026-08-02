import { motion } from "framer-motion";

interface Props {
  logs: string[];
}

export default function ExecutionPanel({ logs }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-16 w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h2 className="mb-5 text-xl font-bold text-cyan-400">
        Live Agent Execution
      </h2>

      <div className="space-y-3 font-mono text-green-400">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </motion.div>
  );
}