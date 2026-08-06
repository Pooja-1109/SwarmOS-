import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { getDashboard } from "../services/dashboardService";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();

      console.log("Dashboard Data:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <h1 className="mb-8 text-4xl font-bold">📊 Dashboard</h1>

        {loading && <p>Loading...</p>}

        {!loading && dashboard && (
          <>
            <div className="grid grid-cols-4 gap-6">
              <div className="rounded-xl bg-zinc-900 p-6">
                <h2>Total Projects</h2>
                <p className="text-4xl font-bold">
                  {dashboard.totalProjects}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-6">
                <h2>Running</h2>
                <p className="text-4xl font-bold text-yellow-400">
                  {dashboard.runningProjects}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-6">
                <h2>Completed</h2>
                <p className="text-4xl font-bold text-green-400">
                  {dashboard.completedProjects}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-6">
                <h2>Pending</h2>
                <p className="text-4xl font-bold text-red-400">
                  {dashboard.pendingProjects}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">
                Recent Projects
              </h2>

              {dashboard.recentProjects?.length > 0 ? (
                dashboard.recentProjects.map((project: any) => (
                  <div
                    key={project._id}
                    className="mb-3 rounded-lg bg-zinc-900 p-4"
                  >
                    <h3 className="text-xl font-semibold">
                      {project.title}
                    </h3>

                    <p>{project.description}</p>

                    <span className="text-cyan-400">
                      {project.status}
                    </span>
                  </div>
                ))
              ) : (
                <p>No projects found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}