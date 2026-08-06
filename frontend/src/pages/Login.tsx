import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log("Sending Login Request...");
      console.log(formData);

      const data = await loginUser(formData);

      console.log("✅ Login Response:", data);

      login(data.token, data.user);

      console.log(
        "✅ Token Saved:",
        localStorage.getItem("token")
      );

      console.log(
        "✅ User Saved:",
        localStorage.getItem("user")
      );

      alert("✅ Login Successful");

      navigate("/dashboard");
    } catch (err: any) {
      console.error("❌ Login Error:", err);

      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-md rounded-xl bg-zinc-900 p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <input
          className="mb-4 w-full rounded bg-zinc-800 p-3"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="mb-6 w-full rounded bg-zinc-800 p-3"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-3 hover:bg-blue-500"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;