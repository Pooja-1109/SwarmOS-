import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">
        Welcome {user?.name}
      </h1>

      <p className="mb-2">
        Email: {user?.email}
      </p>

      <p className="mb-8">
        Role: {user?.role}
      </p>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-6 py-3"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;