const projects = [
  "🏥 Hospital Management",
  "🌍 RescueLink",
  "👶 Smart Baby Care",
  "📚 Library System",
];

export default function RecentProjects() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

      <h2 className="mb-5 text-2xl font-bold text-white">
        Recent Projects
      </h2>

      <div className="space-y-3">

        {projects.map((project) => (
          <div
            key={project}
            className="rounded-lg bg-zinc-800 p-4 text-zinc-300"
          >
            {project}
          </div>
        ))}

      </div>

    </div>
  );
}