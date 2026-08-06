const activities = [
  "🤖 Planner Agent completed project planning",
  "⚙ Backend Agent generated APIs",
  "🎨 Frontend Agent created UI",
  "🗄 Database Agent designed schema",
  "🧪 Testing Agent running tests",
];

export default function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-5 text-2xl font-bold text-white">
        Live Activity
      </h2>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-zinc-800 p-4 text-zinc-300"
          >
            {item}
          </div>
        ))}
      </div>

    </div>
  );
}