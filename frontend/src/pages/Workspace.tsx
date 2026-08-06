import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/projectService";

export default function Workspace() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!title || !description) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await createProject({
        title,
        description,
      });

      alert("✅ Project Created Successfully");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">
        🚀 Create AI Project
      </h1>

      <div className="mx-auto max-w-3xl rounded-xl bg-zinc-900 p-8">

        <label className="mb-2 block text-lg">
          Project Title
        </label>

        <input
          className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4"
          placeholder="Hospital Management System"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="mb-2 block text-lg">
          Project Description
        </label>

        <textarea
          className="mb-8 h-40 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-4"
          placeholder="Describe your software project..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 py-4 text-xl font-bold hover:bg-cyan-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "🚀 Generate Project"}
        </button>

      </div>
    </div>
  );
}