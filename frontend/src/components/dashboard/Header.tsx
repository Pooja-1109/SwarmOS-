import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-10 py-6">

      <div>
        <h2 className="text-3xl font-bold text-white">
          Dashboard
        </h2>

        <p className="text-zinc-400">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="rounded-xl bg-zinc-800 px-5 py-3">
        <p className="font-semibold text-white">
          {user?.email}
        </p>
      </div>

    </div>
  );
}