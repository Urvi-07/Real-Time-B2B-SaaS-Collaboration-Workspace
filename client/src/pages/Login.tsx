import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../socket/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // Get token from backend response
const token =
  res.data?.token ||
  res.data?.data?.token ||
  res.data?.accessToken;

// Get user object (supports common response formats)
const user =
  res.data?.user ||
  res.data?.data?.user ||
  res.data?.data;

if (!token) {
  setError("Login failed: Token not received from backend.");
  return;
}

// Save token
localStorage.setItem("token", token);

// Save user details if available
if (user) {
  if (user.name) {
    localStorage.setItem("name", user.name);
  }

  if (user.email) {
    localStorage.setItem("email", user.email);
  }
}

console.log("✅ Token and user details saved");

// Update socket authentication
socket.auth = {
  token,
};

// Reconnect socket with latest auth
if (socket.connected) {
  socket.disconnect();
}

socket.connect();

console.log("🔌 Connecting to Socket.IO server...");

// Navigate after login
navigate("/dashboard");

    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Sign in to your workspace
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-lg font-semibold transition"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}